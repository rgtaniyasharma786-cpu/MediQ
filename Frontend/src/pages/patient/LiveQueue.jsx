import React, { useState, useEffect } from 'react';
import { Activity, Clock, CheckCircle, Wifi, WifiOff, XCircle, AlertTriangle } from 'lucide-react';
import { queueAPI, patientsAPI } from '../../services/api';
import { joinQueueRoom, joinPatientRoom, getSocket } from '../../services/socket';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function QueueItem({ token, isOwn }) {
  const cfg = {
    waiting:   { bg: 'bg-amber-50  border-amber-200',  token: 'bg-amber-100  border-amber-300  text-amber-800',  badge: 'badge-waiting'   },
    ongoing:   { bg: 'bg-sky-50    border-sky-200',    token: 'bg-sky-100    border-sky-300    text-sky-800',    badge: 'badge-ongoing'   },
    completed: { bg: 'bg-emerald-50 border-emerald-200', token: 'bg-emerald-100 border-emerald-300 text-emerald-800', badge: 'badge-completed' },
    cancelled: { bg: 'bg-slate-50  border-slate-200',  token: 'bg-slate-100  border-slate-300  text-slate-500',  badge: 'badge-cancelled' },
  }[token.status] || {};

  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border transition-all
      ${isOwn ? 'ring-2 ring-sky-400 ring-offset-1 bg-sky-50 border-sky-300' : cfg.bg}
      ${token.isEmergency && token.status !== 'completed' ? 'border-red-300 emergency-ring' : ''}
    `}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold border-2 text-sm flex-shrink-0 ${cfg.token}`}>
          #{token.tokenNumber}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-slate-800">{isOwn ? '👤 You' : '• • • • •'}</p>
            {isOwn && <span className="text-xs font-bold text-sky-700 bg-sky-100 border border-sky-200 px-2 py-0.5 rounded-full">Your Token</span>}
            {token.isEmergency && token.status !== 'completed' && <span className="badge-emergency">🚨</span>}
          </div>
          {token.estimatedWaitTime > 0 && token.status === 'waiting' && (
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <Clock size={10} /> ~{token.estimatedWaitTime} min wait
            </p>
          )}
        </div>
      </div>
      <span className={`badge border ${cfg.badge}`}>
        {token.status.charAt(0).toUpperCase() + token.status.slice(1)}
      </span>
    </div>
  );
}

export default function LiveQueue() {
  const [myTokens, setMyTokens]   = useState([]);
  const [queues, setQueues]       = useState({});
  const [loading, setLoading]     = useState(true);
  const [connected, setConnected] = useState(false);
  const [patient, setPatient]     = useState(null);
  const navigate = useNavigate();

  useEffect(() => { init(); }, []);

  const init = async () => {
    try {
      const [tokensRes, profileRes] = await Promise.all([
        queueAPI.getPatientToday(),
        patientsAPI.getProfile(),
      ]);
      setMyTokens(tokensRes.data);
      setPatient(profileRes.data);

      const today = new Date().toISOString().split('T')[0];

      for (const token of tokensRes.data) {
        const docId = token.doctor?._id;
        if (docId) {
          joinQueueRoom(docId, today);
          const qRes = await queueAPI.getDoctorQueue(docId);
          setQueues(prev => ({ ...prev, [docId]: qRes.data }));
        }
      }

      joinPatientRoom(profileRes.data._id);

      const socket = getSocket();
      if (socket) {
        setConnected(true);

        socket.on('tokenCalled', token => {
          const docId = typeof token.doctor === 'object' ? token.doctor._id : token.doctor;
          setQueues(prev => ({
            ...prev,
            [docId]: (prev[docId] || []).map(t =>
              t.tokenNumber === token.tokenNumber ? { ...t, status: 'ongoing' }
              : t.status === 'ongoing' ? { ...t, status: 'waiting' }
              : t
            ),
          }));
        });

        socket.on('statusUpdated', token => {
          const docId = typeof token.doctor === 'object' ? token.doctor._id : token.doctor;
          setQueues(prev => ({ ...prev, [docId]: (prev[docId] || []).map(t => t._id === token._id ? token : t) }));
        });

        socket.on('queueUpdated', token => {
          const docId = typeof token.doctor === 'object' ? token.doctor._id : token.doctor;
          setQueues(prev => {
            const existing = prev[docId] || [];
            const idx = existing.findIndex(t => t._id === token._id);
            return { ...prev, [docId]: idx >= 0 ? existing.map(t => t._id === token._id ? token : t) : [...existing, token] };
          });
          setMyTokens(prev => prev.map(t => t._id === token._id ? { ...t, ...token } : t));
        });

        socket.on('yourTurn', token => {
          toast('🎉 It\'s your turn! Please proceed to the doctor\'s room.', {
            duration: 8000,
            style: { background: '#f0fdf4', color: '#14532d', border: '1px solid #bbf7d0' },
          });
          setMyTokens(prev => prev.map(t => t._id === token._id ? { ...t, status: 'ongoing' } : t));
        });

        socket.on('tokenCancelled', id => {
          setMyTokens(prev => prev.map(t => t._id === id ? { ...t, status: 'cancelled' } : t));
        });

        socket.on('disconnect', () => setConnected(false));
        socket.on('connect',    () => setConnected(true));
      }
    } catch { toast.error('Failed to load queue data'); }
    finally { setLoading(false); }
  };

  const handleCancel = async (tokenId) => {
    if (!confirm('Cancel your appointment token?')) return;
    try {
      await queueAPI.cancelToken(tokenId);
      setMyTokens(prev => prev.map(t => t._id === tokenId ? { ...t, status: 'cancelled' } : t));
      toast.success('Token cancelled');
    } catch { toast.error('Failed to cancel token'); }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5 max-w-8xl ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Live Queue</h1>
          <p className="text-slate-500 text-sm mt-0.5">Real-time status of your appointments</p>
        </div>
        <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl border ${
          connected
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          {connected ? <Wifi size={13} /> : <WifiOff size={13} />}
          {connected ? 'Live' : 'Disconnected'}
        </div>
      </div>

      {/* Empty state */}
      {myTokens.length === 0 ? (
        <div className="card p-14 text-center">
          <Activity size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-600 font-bold mb-1">No appointments today</p>
          <p className="text-slate-400 text-sm mb-5">Book an appointment to start tracking your queue position</p>
          <button onClick={() => navigate('/patient/book')} className="btn-primary">
            Book Appointment
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {myTokens.map(myToken => {
            const docId       = myToken.doctor?._id;
            const docQueue    = queues[docId] || [];
            const activeQueue = docQueue.filter(t => t.status !== 'cancelled');
            const waitingList = docQueue.filter(t => t.status === 'waiting');
            const ongoingToken = docQueue.find(t => t.status === 'ongoing');
            const myPosition   = waitingList.findIndex(t => t._id === myToken._id) + 1;

            return (
              <div key={myToken._id} className="space-y-3">
                {/* Doctor + my status card */}
                <div className={`card p-5 border-l-4 ${myToken.status === 'ongoing' ? 'border-l-emerald-500' : myToken.status === 'cancelled' ? 'border-l-red-400' : 'border-l-sky-500'}`}>
                  {/* Doctor info */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center font-bold text-teal-700 text-lg">
                        {myToken.doctor?.user?.name?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">Dr. {myToken.doctor?.user?.name}</p>
                        <p className="text-xs text-teal-600 font-semibold">{myToken.doctor?.specialization}</p>
                      </div>
                    </div>
                    {myToken.status === 'waiting' && (
                      <button
                        onClick={() => handleCancel(myToken._id)}
                        className="text-xs text-red-600 hover:text-red-700 font-semibold px-2.5 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-all flex items-center gap-1"
                      >
                        <XCircle size={12} /> Cancel
                      </button>
                    )}
                  </div>

                  {/* Status grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                      <p className="text-xs text-slate-400 font-medium mb-1">My Token</p>
                      <p className="text-2xl font-bold font-mono text-sky-700">#{myToken.tokenNumber}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                      <p className="text-xs text-slate-400 font-medium mb-1">Status</p>
                      <p className={`text-sm font-bold capitalize ${
                        myToken.status === 'ongoing'   ? 'text-sky-600'     :
                        myToken.status === 'completed' ? 'text-emerald-600' :
                        myToken.status === 'cancelled' ? 'text-red-500'     : 'text-amber-600'
                      }`}>
                        {myToken.status}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                      <p className="text-xs text-slate-400 font-medium mb-1">Position</p>
                      <p className="text-2xl font-bold font-mono text-slate-800">
                        {myToken.status === 'waiting' && myPosition > 0 ? `#${myPosition}` : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Now serving banner */}
                  {ongoingToken && (
                    <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 mb-3 flex items-center gap-3">
                      <div className="live-dot flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Now Serving</p>
                        <p className="font-bold text-sky-700 font-mono">Token #{ongoingToken.tokenNumber}</p>
                      </div>
                    </div>
                  )}

                  {/* Your turn! */}
                  {myToken.status === 'ongoing' && (
                    <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 text-center">
                      <div className="text-3xl mb-1">🎉</div>
                      <p className="font-bold text-emerald-700 text-lg">It's Your Turn!</p>
                      <p className="text-sm text-slate-500 mt-0.5">Please proceed to Dr. {myToken.doctor?.user?.name}'s room</p>
                    </div>
                  )}

                  {myToken.status === 'completed' && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-2 text-sm text-slate-500">
                      <CheckCircle size={16} className="text-emerald-500" />
                      Consultation completed. Check prescriptions for details.
                    </div>
                  )}
                </div>

                {/* Full queue list */}
                {activeQueue.length > 0 && (
                  <div className="card p-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Queue — {activeQueue.length} patient{activeQueue.length !== 1 ? 's' : ''}
                    </p>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {docQueue
                        .filter(t => t.status !== 'cancelled')
                        .sort((a, b) => {
                          if (a.isEmergency && !b.isEmergency) return -1;
                          if (!a.isEmergency && b.isEmergency) return 1;
                          return a.tokenNumber - b.tokenNumber;
                        })
                        .map(t => (
                          <QueueItem key={t._id} token={t} isOwn={t._id === myToken._id} />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

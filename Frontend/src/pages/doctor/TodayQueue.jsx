import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Activity, CheckCircle, ChevronRight, Phone, FileText, Filter, SkipForward } from 'lucide-react';
import { queueAPI, doctorsAPI } from '../../services/api';
import { joinDoctorRoom, joinQueueRoom, getSocket } from '../../services/socket';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function TodayQueue() {
  const [queue, setQueue]   = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');
  const navigate = useNavigate();

  useEffect(() => { initQueue(); }, []);

  const initQueue = async () => {
    try {
      const docRes = await doctorsAPI.getMyProfile();
      setDoctor(docRes.data);
      await fetchQueue(docRes.data._id);
      const today = new Date().toISOString().split('T')[0];
      joinDoctorRoom(docRes.data._id);
      joinQueueRoom(docRes.data._id, today);
      const socket = getSocket();
      if (socket) {
        socket.on('newPatient',    () => fetchQueue(docRes.data._id));
        socket.on('tokenCalled',   () => fetchQueue(docRes.data._id));
        socket.on('statusUpdated', () => fetchQueue(docRes.data._id));
        socket.on('tokenCancelled',() => fetchQueue(docRes.data._id));
        socket.on('tokenSkipped',  () => fetchQueue(docRes.data._id));
        socket.on('emergencyAlert', () => {
          toast('🚨 Emergency patient added!', { style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' } });
          fetchQueue(docRes.data._id);
        });
      }
    } catch { toast.error('Failed to load queue'); }
    finally { setLoading(false); }
  };

  const fetchQueue = async (docId) => {
    const res = await queueAPI.getDoctorQueue(docId);
    setQueue(res.data);
  };

  // Call next patient
  const handleCallNext = async () => {
    try {
      const res = await queueAPI.callNext(doctor._id);
      if (res.data?.tokenNumber) toast.success(`Calling Token #${res.data.tokenNumber}`);
      else toast('No more patients in queue 🎉');
      await fetchQueue(doctor._id);
    } catch { toast.error('Failed to call next patient'); }
  };

  // Skip current patient — moves to end of queue
  const handleSkipPatient = async () => {
    if (!window.confirm('Skip current patient? They will be moved to the end of the queue.')) return;
    try {
      await queueAPI.skipPatient(doctor._id);
      toast('Patient skipped — moved to end of queue', { icon: '⏭️' });
      await fetchQueue(doctor._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'No ongoing patient to skip');
    }
  };

  // Update token status
  const handleStatusUpdate = async (tokenId, status) => {
    try {
      await queueAPI.updateStatus(tokenId, { status });
      await fetchQueue(doctor._id);
      toast.success(`Marked as ${status}`);
    } catch { toast.error('Failed to update status'); }
  };

  // Mark as emergency
  const handleMarkEmergency = async (tokenId) => {
    try {
      await queueAPI.markEmergency(tokenId);
      await fetchQueue(doctor._id);
      toast('🚨 Marked as emergency', { style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' } });
    } catch { toast.error('Failed'); }
  };

  const stats = {
    waiting:   queue.filter(t => t.status === 'waiting').length,
    ongoing:   queue.filter(t => t.status === 'ongoing').length,
    completed: queue.filter(t => t.status === 'completed').length,
    emergency: queue.filter(t => t.isEmergency && t.status !== 'cancelled').length,
  };

  const filtered = queue.filter(t => {
    if (filter === 'all')       return true;
    if (filter === 'emergency') return t.isEmergency;
    return t.status === filter;
  });

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5 max-w-8xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Today's Queue</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSkipPatient} className="btn-secondary flex items-center gap-2 text-sm">
            <SkipForward size={15} /> Skip Patient
          </button>
          <button onClick={handleCallNext} className="btn-primary flex items-center gap-2">
            <Activity size={16} /> Call Next
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { key: 'waiting',   label: 'Waiting',    color: 'bg-amber-50   border-amber-200   text-amber-700'   },
          { key: 'ongoing',   label: 'In Progress', color: 'bg-sky-50     border-sky-200     text-sky-700'     },
          { key: 'completed', label: 'Completed',   color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
          { key: 'emergency', label: 'Emergency',   color: 'bg-red-50     border-red-200     text-red-700'     },
        ].map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setFilter(filter === key ? 'all' : key)}
            className={`card p-3 text-center border-2 transition-all hover:shadow-md
              ${filter === key ? 'ring-2 ring-sky-500 ring-offset-1' : ''} ${color}`}
          >
            <p className="text-2xl font-bold font-mono">{stats[key]}</p>
            <p className="text-xs font-semibold mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-slate-400" />
        {['all', 'waiting', 'ongoing', 'completed', 'cancelled', 'emergency'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize border transition-all
              ${filter === f
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
              }`}
          >
            {f === 'emergency' ? '🚨 Emergency' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Queue list */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="card p-14 text-center">
            <Clock size={32} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No patients in this category</p>
          </div>
        ) : (
          filtered.map(token => (
            <div
              key={token._id}
              className={`card p-4 transition-all hover:shadow-md
                ${token.isEmergency && token.status !== 'completed' && token.status !== 'cancelled'
                  ? 'border-red-300 emergency-ring' : ''}
                ${token.status === 'ongoing' ? 'border-sky-300 ring-1 ring-sky-100' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Token badge */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-lg flex-shrink-0 border-2
                    ${token.status === 'ongoing'
                      ? 'bg-sky-50 border-sky-300 text-sky-700'
                      : token.isEmergency
                        ? 'bg-red-50 border-red-300 text-red-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    #{token.tokenNumber}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-slate-800">{token.patient?.user?.name}</p>
                      {token.isEmergency && token.status !== 'completed' && token.status !== 'cancelled'
                        ? <span className="badge-emergency">🚨 Emergency</span>
                        : <span className={`badge border
                            ${token.status === 'waiting'   ? 'badge-waiting'   :
                              token.status === 'ongoing'   ? 'badge-ongoing'   :
                              token.status === 'completed' ? 'badge-completed' : 'badge-cancelled'}`}
                          >
                            {token.status.charAt(0).toUpperCase() + token.status.slice(1)}
                          </span>
                      }
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Phone size={10} /> {token.patient?.user?.phone || 'N/A'}
                      </span>
                      {token.problemDescription && (
                        <span className="flex items-center gap-1 max-w-xs truncate">
                          <FileText size={10} /> {token.problemDescription}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Booked {new Date(token.appointedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      {token.estimatedWaitTime > 0 && token.status === 'waiting'
                        && ` · ~${token.estimatedWaitTime} min wait`}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {token.status === 'waiting' && (
                    <>
                      {!token.isEmergency && (
                        <button
                          onClick={() => handleMarkEmergency(token._id)}
                          className="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all font-semibold"
                        >
                          🚨 Emergency
                        </button>
                      )}
                      <button
                        onClick={() => handleStatusUpdate(token._id, 'cancelled')}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-all font-semibold"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {token.status === 'ongoing' && (
                    <button
                      onClick={() => handleStatusUpdate(token._id, 'completed')}
                      className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all font-bold"
                    >
                      ✓ Complete
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/doctor/patients/${token._id}`)}
                    className="p-2 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all border border-transparent hover:border-sky-200"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Phone, Clock } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { getSocket, joinAdminRoom } from '../../services/socket';
import toast from 'react-hot-toast';

export default function EmergencyControl() {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmergencies();
    joinAdminRoom();
    const socket = getSocket();
    if (socket) {
      socket.on('emergencyAlert', () => {
        toast('🚨 New emergency patient!', {
          style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' },
          duration: 6000,
        });
        fetchEmergencies();
      });
    }
    return () => { if (socket) socket.off('emergencyAlert'); };
  }, []);

  const fetchEmergencies = async () => {
    try {
      const res = await adminAPI.getTodayEmergencies();
      setEmergencies(res.data);
    } catch { toast.error('Failed to load emergencies'); }
    finally { setLoading(false); }
  };

  const handleApprove = async (tokenId, patientName) => {
    try {
      await adminAPI.approveEmergency(tokenId);
      toast.success(`Emergency approved for ${patientName}`);
      fetchEmergencies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve emergency');
    }
  };

  const handleRemove = async (tokenId, patientName) => {
    if (!window.confirm(`Remove emergency status for ${patientName}?`)) return;
    try {
      await adminAPI.removeEmergency(tokenId);
      toast.success('Emergency status removed');
      fetchEmergencies();
    } catch { toast.error('Failed'); }
  };

  const statusConfig = {
    waiting:   { label: 'Waiting',    color: 'badge-waiting'   },
    ongoing:   { label: 'Ongoing',    color: 'badge-ongoing'   },
    completed: { label: 'Completed',  color: 'badge-completed' },
    cancelled: { label: 'Cancelled',  color: 'badge-cancelled' },
  };

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
          <h1 className="page-title flex items-center gap-2">
            <AlertTriangle size={22} className="text-red-500" />
            Emergency Control
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Approve emergency patients and prioritize critical cases
          </p>
        </div>
        <button onClick={fetchEmergencies} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Total Emergencies',
            value: emergencies.length,
            color: 'bg-red-50 border-red-200 text-red-700',
          },
          {
            label: 'Waiting',
            value: emergencies.filter(e => e.status === 'waiting').length,
            color: 'bg-amber-50 border-amber-200 text-amber-700',
          },
          {
            label: 'Completed',
            value: emergencies.filter(e => e.status === 'completed').length,
            color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
          },
        ].map(({ label, value, color }) => (
          <div key={label} className={`card p-4 border-2 ${color}`}>
            <p className="text-2xl font-bold font-mono">{value}</p>
            <p className="text-xs font-semibold mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Emergency list */}
      {emergencies.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-emerald-500" />
          </div>
          <p className="font-bold text-slate-600 mb-1">No emergency patients today</p>
          <p className="text-slate-400 text-sm">All clear — no critical cases at the moment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {emergencies.map(token => {
            const cfg = statusConfig[token.status] || statusConfig.waiting;
            const patientName = token.patient?.user?.name || 'Unknown';
            const doctorName  = token.doctor?.user?.name  || 'Unknown';

            return (
              <div
                key={token._id}
                className="card p-5 border-l-4 border-l-red-500 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Emergency badge */}
                    <div className="w-14 h-14 bg-red-50 border-2 border-red-300 rounded-2xl flex flex-col items-center justify-center flex-shrink-0">
                      <AlertTriangle size={16} className="text-red-500 mb-0.5" />
                      <span className="text-xs font-bold text-red-700 font-mono">#{token.tokenNumber}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-slate-800 text-base">{patientName}</p>
                        <span className={`badge border ${cfg.color}`}>{cfg.label}</span>
                        <span className="badge-emergency">🚨 Emergency</span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-1.5">
                        <span className="flex items-center gap-1">
                          <Phone size={11} />
                          {token.patient?.user?.phone || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {token.appointedAt
                            ? new Date(token.appointedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                            : '—'
                          }
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 mb-1">
                        <span className="font-semibold">Doctor:</span> Dr. {doctorName}
                      </p>

                      {token.problemDescription && (
                        <p className="text-xs text-slate-500">
                          <span className="font-semibold">Problem:</span> {token.problemDescription}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 flex-shrink-0 ml-4">
                    {token.status === 'waiting' && (
                      <button
                        onClick={() => handleApprove(token._id, patientName)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700
                                   text-white text-xs font-bold transition-all"
                      >
                        <CheckCircle size={13} /> Approve & Prioritize
                      </button>
                    )}
                    <button
                      onClick={() => handleRemove(token._id, patientName)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200
                                 text-slate-600 text-xs font-semibold border border-slate-200 transition-all"
                    >
                      <XCircle size={13} /> Remove Emergency
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
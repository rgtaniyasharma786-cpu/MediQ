import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, Users, RefreshCw, RotateCcw } from 'lucide-react';
import { adminAPI, queueAPI } from '../../services/api';
import { getSocket, joinAdminRoom } from '../../services/socket';
import toast from 'react-hot-toast';

export default function QueueMonitoring() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonitor();
    joinAdminRoom();
    const socket = getSocket();
    if (socket) {
      socket.on('queueUpdate', fetchMonitor);
      socket.on('tokenCalled', fetchMonitor);
      socket.on('emergencyAlert', () => {
        toast('🚨 Emergency patient!', { style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' } });
        fetchMonitor();
      });
    }
    const interval = setInterval(fetchMonitor, 30000);
    return () => {
      clearInterval(interval);
      if (socket) { socket.off('queueUpdate'); socket.off('tokenCalled'); socket.off('emergencyAlert'); }
    };
  }, []);

  const fetchMonitor = async () => {
    try { const res = await adminAPI.getQueueMonitor(); setData(res.data); }
    catch { toast.error('Failed to load queue data'); }
    finally { setLoading(false); }
  };

  const handleReset = async (doctorId, name) => {
    if (!confirm(`Reset queue for Dr. ${name}? This will cancel all waiting tokens.`)) return;
    try { await queueAPI.resetQueue(doctorId); toast.success('Queue reset successfully'); fetchMonitor(); }
    catch { toast.error('Failed to reset queue'); }
  };

  const totals = data.reduce((acc, d) => ({
    waiting: acc.waiting + d.stats.waiting,
    ongoing: acc.ongoing + d.stats.ongoing,
    completed: acc.completed + d.stats.completed,
    emergency: acc.emergency + d.stats.emergency,
  }), { waiting: 0, ongoing: 0, completed: 0, emergency: 0 });

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5 max-w-8xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Queue Monitor</h1>
          <p className="text-slate-500 text-sm mt-0.5">Real-time patient queues across all doctors</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            <div className="live-dot" /> Live
          </div>
          <button onClick={fetchMonitor} className="btn-secondary text-sm py-2">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Waiting', value: totals.waiting, icon: Clock, color: 'bg-amber-50 text-amber-600 border-amber-100' },
          { label: 'In Consultation', value: totals.ongoing, icon: Activity, color: 'bg-sky-50 text-sky-600 border-sky-100' },
          { label: 'Completed', value: totals.completed, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
          { label: 'Emergency', value: totals.emergency, icon: AlertTriangle, color: 'bg-red-50 text-red-600 border-red-100' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${color}`}>
              <Icon size={17} />
            </div>
            <p className="text-2xl font-bold text-slate-900 font-mono">{value}</p>
            <p className="text-sm text-slate-500 font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Per-doctor cards */}
      <div className="space-y-3">
        {data.map(({ doctor, stats }) => (
          <div key={doctor._id} className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold border ${doctor.isAvailableToday ? 'bg-teal-50 border-teal-100 text-teal-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  {doctor.user?.name?.[0]}
                </div>
                <div>
                  <p className="font-bold text-slate-800">Dr. {doctor.user?.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500">{doctor.specialization}</span>
                    {stats.emergency > 0 && (
                      <span className="badge-emergency">🚨 {stats.emergency} Emergency</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${doctor.isAvailableToday ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                  {doctor.isAvailableToday ? '● Available' : '○ Unavailable'}
                </span>
                <button onClick={() => handleReset(doctor._id, doctor.user?.name)}
                  className="text-xs text-red-600 hover:text-red-700 px-2.5 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-all flex items-center gap-1">
                  <RotateCcw size={11} /> Reset
                </button>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span>Queue progress</span>
                <span className="font-semibold">{stats.completed} / {stats.total} completed</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }} />
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Waiting', value: stats.waiting, cls: 'badge-waiting' },
                { label: 'Ongoing', value: stats.ongoing, cls: 'badge-ongoing' },
                { label: 'Completed', value: stats.completed, cls: 'badge-completed' },
                { label: 'Cancelled', value: stats.cancelled, cls: 'badge-cancelled' },
              ].map(({ label, value, cls }) => (
                <div key={label} className="text-center bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xl font-bold text-slate-800 font-mono">{value}</p>
                  <span className={cls}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="card p-16 text-center">
            <Users size={36} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No doctors in the system</p>
          </div>
        )}
      </div>
    </div>
  );
}

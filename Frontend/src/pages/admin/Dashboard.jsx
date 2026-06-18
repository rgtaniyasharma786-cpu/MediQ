import React, { useState, useEffect } from 'react';
import { Users, Stethoscope, Activity, AlertTriangle, CheckCircle, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { joinAdminRoom, getSocket } from '../../services/socket';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
    joinAdminRoom();
    const socket = getSocket();
    if (socket) {
      socket.on('queueUpdate', fetchDashboard);
      socket.on('emergencyAlert', () => {
        toast('🚨 Emergency patient alert!', { style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' } });
        fetchDashboard();
      });
    }
    return () => { if (socket) { socket.off('queueUpdate'); socket.off('emergencyAlert'); } };
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await adminAPI.getDashboard();
      setStats(res.data);
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  const statCards = stats ? [
    { label: 'Total Doctors', value: stats.totalDoctors, icon: Stethoscope, color: 'bg-teal-50 text-teal-600 border-teal-100', trend: '+2 this month' },
    { label: 'Total Patients', value: stats.totalPatients, icon: Users, color: 'bg-sky-50 text-sky-600 border-sky-100', trend: 'Registered' },
    { label: "Today's Tokens", value: stats.todayTokens, icon: Activity, color: 'bg-violet-50 text-violet-600 border-violet-100', trend: 'Booked today' },
    { label: 'Completed Today', value: stats.completedToday, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600 border-emerald-100', trend: 'Consultations' },
    { label: 'Emergencies', value: stats.emergencyToday, icon: AlertTriangle, color: 'bg-red-50 text-red-600 border-red-100', trend: 'Today' },
  ] : [];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
    </div>
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-5 max-w-8xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-2 rounded-xl">
          <div className="live-dot" />
          System Live
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, trend }) => (
          <div key={label} className="card p-5 hover:shadow-md transition-all duration-200">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="text-3xl font-bold text-slate-900 font-mono tracking-tight">{value ?? 0}</p>
            <p className="text-sm font-semibold text-slate-700 mt-1">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{trend}</p>
          </div>
        ))}
      </div>

      {/* Quick actions + status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* System status */}
        <div className="card p-5">
          <h2 className="section-title mb-4">
            <div className="w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Activity size={14} className="text-emerald-600" />
            </div>
            System Status
          </h2>
          <div className="space-y-2.5">
            {[
              { label: 'Queue System', status: 'Operational' },
              { label: 'Real-time Updates', status: 'Live' },
              { label: 'Notifications', status: 'Active' },
              { label: 'Database', status: 'Connected' },
            ].map(({ label, status }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-600">{label}</span>
                <div className="flex items-center gap-1.5">
                  <div className="live-dot" />
                  <span className="text-xs font-semibold text-emerald-600">{status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="card p-5 md:col-span-2">
          <h2 className="section-title mb-4">
            <div className="w-6 h-6 bg-sky-50 rounded-lg flex items-center justify-center">
              <TrendingUp size={14} className="text-sky-600" />
            </div>
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Queue Monitor', desc: 'View all active queues', href: '/admin/queue-monitor', color: 'bg-sky-50 border-sky-200 hover:bg-sky-100', icon: Activity, iconColor: 'text-sky-600' },
              { label: 'Manage Doctors', desc: 'Add or edit doctors', href: '/admin/doctors', color: 'bg-teal-50 border-teal-200 hover:bg-teal-100', icon: Stethoscope, iconColor: 'text-teal-600' },
              { label: 'Analytics', desc: 'View reports & charts', href: '/admin/analytics', color: 'bg-violet-50 border-violet-200 hover:bg-violet-100', icon: TrendingUp, iconColor: 'text-violet-600' },
              { label: 'User Management', desc: 'Manage all users', href: '/admin/users', color: 'bg-amber-50 border-amber-200 hover:bg-amber-100', icon: Users, iconColor: 'text-amber-600' },
            ].map(({ label, desc, href, color, icon: Icon, iconColor }) => (
              <button key={label} onClick={() => navigate(href)}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all text-left ${color}`}>
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Icon size={15} className={iconColor} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

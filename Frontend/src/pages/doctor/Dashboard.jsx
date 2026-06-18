import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, AlertTriangle, Activity, ToggleLeft, ToggleRight, ChevronRight } from 'lucide-react';
import { doctorsAPI, queueAPI } from '../../services/api';
import { joinDoctorRoom, getSocket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [queueStats, setQueueStats] = useState({ waiting: 0, ongoing: 0, completed: 0, emergency: 0 });
  const [currentToken, setCurrentToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchDoctor(); }, []);

  const fetchDoctor = async () => {
    try {
      const res = await doctorsAPI.getMyProfile();
      setDoctor(res.data);
      fetchQueue(res.data._id);
      fetchCurrentToken(res.data._id);
      joinDoctorRoom(res.data._id);
      const socket = getSocket();
      if (socket) {
        socket.on('newPatient', () => { fetchQueue(res.data._id); fetchCurrentToken(res.data._id); });
        socket.on('tokenCalled', () => { fetchQueue(res.data._id); fetchCurrentToken(res.data._id); });
        socket.on('emergencyAlert', () => {
          toast('🚨 Emergency patient in queue!', { duration: 5000, style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' } });
          fetchQueue(res.data._id);
        });
      }
    } catch { toast.error('Failed to load profile'); }
    finally { setLoading(false); }
  };

  const fetchQueue = async (docId) => {
    try {
      const res = await queueAPI.getDoctorQueue(docId);
      const q = res.data;
      setQueueStats({
        waiting: q.filter(t => t.status === 'waiting').length,
        ongoing: q.filter(t => t.status === 'ongoing').length,
        completed: q.filter(t => t.status === 'completed').length,
        emergency: q.filter(t => t.isEmergency && t.status !== 'cancelled').length,
      });
    } catch {}
  };

  const fetchCurrentToken = async (docId) => {
    try {
      const res = await queueAPI.getCurrentToken(docId);
      setCurrentToken(res.data.current);
    } catch {}
  };

  const handleCallNext = async () => {
    try {
      const res = await queueAPI.callNext(doctor._id);
      if (res.data?.tokenNumber) {
        setCurrentToken(res.data);
        toast.success(`Calling Token #${res.data.tokenNumber} — ${res.data.patient?.user?.name}`);
      } else {
        toast('Queue is empty — great work! 🎉');
        setCurrentToken(null);
      }
      fetchQueue(doctor._id);
    } catch { toast.error('Failed to call next patient'); }
  };

  const toggleAvailability = async () => {
    try {
      const res = await doctorsAPI.toggleAvailability();
      setDoctor(prev => ({ ...prev, isAvailableToday: res.data.isAvailableToday }));
      toast.success(res.data.isAvailableToday ? 'You are now marked as available' : 'You are now marked as unavailable');
    } catch { toast.error('Failed to update availability'); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5 max-w-8xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, Dr. {user?.name?.split(' ').slice(-1)[0]} 👋</h1>
          <p className="text-slate-500 text-sm mt-0.5">{doctor?.specialization} · {doctor?.room || 'Room not assigned'}</p>
        </div>
        <button onClick={toggleAvailability}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${doctor?.isAvailableToday ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
          {doctor?.isAvailableToday ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          {doctor?.isAvailableToday ? 'Available Today' : 'Set Unavailable'}
        </button>
      </div>

      {/* Current token + call next */}
      <div className="card p-6 border-l-4 border-l-sky-500">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Currently Serving</p>
            {currentToken ? (
              <>
                <div className="token-display">#{currentToken.tokenNumber}</div>
                <p className="text-slate-700 font-semibold mt-2">{currentToken.patient?.user?.name}</p>
                {currentToken.isEmergency && <span className="badge-emergency mt-1">🚨 Emergency Priority</span>}
              </>
            ) : (
              <p className="text-2xl font-bold text-slate-300 mt-1">No active patient</p>
            )}
          </div>
          <button onClick={handleCallNext}
            className="relative btn-primary text-base px-8 py-4 rounded-2xl shadow-lg"
            style={{ boxShadow: '0 4px 20px rgba(2,132,199,0.35)' }}>
            <Activity size={20} />
            Call Next Patient
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Waiting', value: queueStats.waiting, color: 'bg-amber-50 border-amber-100 text-amber-700' },
            { label: 'Ongoing', value: queueStats.ongoing, color: 'bg-sky-50 border-sky-100 text-sky-700' },
            { label: 'Completed', value: queueStats.completed, color: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
            { label: 'Emergency', value: queueStats.emergency, color: 'bg-red-50 border-red-100 text-red-700' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-xl p-3 text-center border ${color}`}>
              <p className="text-2xl font-bold font-mono">{value}</p>
              <p className="text-xs font-semibold mt-0.5 opacity-80">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick nav + profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="section-title mb-4">Quick Actions</h2>
          {[
            { label: "View Today's Queue", desc: 'Manage patients in queue', href: '/doctor/queue', color: 'text-sky-600 bg-sky-50' },
            { label: 'Write Prescription', desc: 'For current patient', href: '/doctor/queue', color: 'text-teal-600 bg-teal-50' },
            { label: 'View Prescriptions', desc: 'All issued prescriptions', href: '/doctor/prescriptions', color: 'text-violet-600 bg-violet-50' },
          ].map(({ label, desc, href, color }) => (
            <button key={label} onClick={() => navigate(href)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all mb-1">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                  <Activity size={14} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-800">{label}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
              </div>
              <ChevronRight size={15} className="text-slate-300" />
            </button>
          ))}
        </div>

        <div className="card p-5">
          <h2 className="section-title mb-4">My Profile</h2>
          <div className="space-y-2.5">
            {[
              { label: 'Qualification', value: doctor?.qualification || '—' },
              { label: 'Experience', value: `${doctor?.experience || 0} years` },
              { label: 'Consultation Fee', value: `₹${doctor?.fees}` },
              { label: 'Room', value: doctor?.room || '—' },
              { label: 'Max Patients', value: `${doctor?.maxPatientsPerDay}/day` },
              { label: 'Working Hours', value: `${doctor?.availability?.startTime} – ${doctor?.availability?.endTime}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                <span className="text-xs text-slate-500 font-medium">{label}</span>
                <span className="text-sm font-semibold text-slate-700">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Activity, Clock, ChevronRight, Stethoscope, Plus, TrendingUp } from 'lucide-react';
import { queueAPI, prescriptionAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [todayTokens, setTodayTokens] = useState([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [tokensRes, rxRes] = await Promise.all([
        queueAPI.getPatientToday(),
        prescriptionAPI.getPatientHistory(),
      ]);
      setTodayTokens(tokensRes.data);
      setRecentPrescriptions(rxRes.data.slice(0, 3));
    } catch {}
    finally { setLoading(false); }
  };

  const statusConfig = {
    waiting:   { label: 'Waiting',   color: 'text-amber-700  bg-amber-50  border-amber-200'  },
    ongoing:   { label: 'In Progress', color: 'text-sky-700  bg-sky-50  border-sky-200'      },
    completed: { label: 'Completed', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    cancelled: { label: 'Cancelled', color: 'text-red-600    bg-red-50   border-red-200'     },
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5 max-w-8xl ">
      {/* Welcome banner */}
      <div className="rounded-2xl p-6 gradient-header text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full opacity-10">
          <Stethoscope size={200} className="absolute -right-8 -top-8" />
        </div>
        <p className="text-blue-200 text-sm font-medium mb-1">{greeting} 👋</p>
        <h1 className="text-2xl font-bold">{user?.name}</h1>
        <p className="text-blue-200 text-sm mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <button
          onClick={() => navigate('/patient/book')}
          className="mt-4 flex items-center gap-2 bg-white text-slate-800 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-blue-50 transition-all"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
        >
          <Plus size={15} /> Book Appointment
        </button>
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Book Token',    icon: Calendar,  color: 'bg-sky-50  border-sky-200  text-sky-600',     href: '/patient/book'          },
          { label: 'Live Queue',    icon: Activity,  color: 'bg-teal-50 border-teal-200 text-teal-600',    href: '/patient/live-queue'    },
          { label: 'Prescriptions', icon: FileText,  color: 'bg-violet-50 border-violet-200 text-violet-600', href: '/patient/prescriptions' },
          { label: 'My Profile',    icon: TrendingUp,color: 'bg-emerald-50 border-emerald-200 text-emerald-600', href: '/patient/profile' },
        ].map(({ label, icon: Icon, color, href }) => (
          <button
            key={label}
            onClick={() => navigate(href)}
            className="card p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 text-center"
          >
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${color}`}>
              <Icon size={18} />
            </div>
            <span className="text-xs font-bold text-slate-600">{label}</span>
          </button>
        ))}
      </div>

      {/* Today's appointments */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">
            <div className="w-6 h-6 bg-sky-50 rounded-lg flex items-center justify-center border border-sky-100">
              <Calendar size={13} className="text-sky-600" />
            </div>
            Today's Appointments
          </h2>
          <button
            onClick={() => navigate('/patient/live-queue')}
            className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
          >
            Track Live <ChevronRight size={13} />
          </button>
        </div>

        {todayTokens.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100">
            <Clock size={30} className="text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm font-medium">No appointments today</p>
            <button
              onClick={() => navigate('/patient/book')}
              className="btn-primary text-sm mt-3 py-2"
            >
              <Plus size={14} /> Book Now
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todayTokens.map(token => {
              const cfg = statusConfig[token.status] || statusConfig.waiting;
              return (
                <div
                  key={token._id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border ${token.status === 'ongoing' ? 'bg-sky-50 border-sky-200' : 'bg-white border-slate-200'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-mono font-bold text-base border-2 ${token.status === 'ongoing' ? 'bg-sky-100 border-sky-300 text-sky-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                      #{token.tokenNumber}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Dr. {token.doctor?.user?.name}</p>
                      <p className="text-xs text-slate-400">{token.doctor?.specialization}</p>
                    </div>
                  </div>
                  <span className={`badge border ${cfg.color}`}>{cfg.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent prescriptions */}
      {recentPrescriptions.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">
              <div className="w-6 h-6 bg-violet-50 rounded-lg flex items-center justify-center border border-violet-100">
                <FileText size={13} className="text-violet-600" />
              </div>
              Recent Prescriptions
            </h2>
            <button
              onClick={() => navigate('/patient/prescriptions')}
              className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
            >
              View all <ChevronRight size={13} />
            </button>
          </div>
          <div className="space-y-2">
            {recentPrescriptions.map(rx => (
              <div
                key={rx._id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-violet-50 border border-violet-100 rounded-lg flex items-center justify-center">
                    <FileText size={13} className="text-violet-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{rx.diagnosis || 'General Consultation'}</p>
                    <p className="text-xs text-slate-400">Dr. {rx.doctor?.user?.name} · {new Date(rx.issuedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-400">{rx.medicines?.length || 0} med{rx.medicines?.length !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

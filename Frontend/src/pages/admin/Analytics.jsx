import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { analyticsAPI } from '../../services/api';
import { Clock, Users, BarChart3, TrendingUp } from 'lucide-react';

const COLORS = ['#0284c7', '#0d9488', '#7c3aed', '#059669', '#d97706', '#dc2626'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg">
        <p className="text-xs font-semibold text-slate-600 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="text-sm font-bold">{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const [patientsPerDay, setPatientsPerDay] = useState([]);
  const [waitTime, setWaitTime] = useState(null);
  const [statusDist, setStatusDist] = useState(null);
  const [bySpec, setBySpec] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [ppd, wt, sd, bs] = await Promise.all([
        analyticsAPI.getPatientsPerDay(),
        analyticsAPI.getAvgWaitTime(),
        analyticsAPI.getStatusDistribution(),
        analyticsAPI.getBySpecialization(),
      ]);
      setPatientsPerDay(ppd.data.map(d => ({ ...d, date: d.date.slice(5) })));
      setWaitTime(wt.data);
      setStatusDist(sd.data);
      setBySpec(bs.data);
    } catch {}
    finally { setLoading(false); }
  };

  const pieData = statusDist ? [
    { name: 'Waiting', value: statusDist.waiting },
    { name: 'Ongoing', value: statusDist.ongoing },
    { name: 'Completed', value: statusDist.completed },
    { name: 'Cancelled', value: statusDist.cancelled },
  ].filter(d => d.value > 0) : [];

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5 max-w-8xl">
      <div>
        <h1 className="page-title">Analytics Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Performance insights and operational metrics</p>
      </div>

      {/* KPI row */}
      {waitTime && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Avg. Wait Time', value: `${waitTime.avgWaitMinutes} min`, icon: Clock, color: 'bg-amber-50 text-amber-600 border-amber-100', sub: 'Per patient' },
            { label: 'Avg. Consultation', value: `${waitTime.avgConsultMinutes} min`, icon: Users, color: 'bg-teal-50 text-teal-600 border-teal-100', sub: 'Duration' },
            { label: 'Total Completed', value: waitTime.totalCompleted, icon: BarChart3, color: 'bg-emerald-50 text-emerald-600 border-emerald-100', sub: 'All time' },
          ].map(({ label, value, icon: Icon, color, sub }) => (
            <div key={label} className="card p-5">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 ${color}`}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-bold text-slate-900 font-mono">{value}</p>
              <p className="text-sm font-semibold text-slate-700 mt-1">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Patients per day chart */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-sky-50 rounded-lg flex items-center justify-center border border-sky-100">
            <TrendingUp size={15} className="text-sky-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">Patient Volume — Last 7 Days</h2>
            <p className="text-xs text-slate-400">Daily breakdown of total, emergency, and completed</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={patientsPerDay}>
            <defs>
              <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gEmerg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.12}/>
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
            <Area type="monotone" dataKey="total" name="Total" stroke="#0284c7" fill="url(#gTotal)" strokeWidth={2} dot={{ fill: '#0284c7', r: 3, strokeWidth: 0 }} />
            <Area type="monotone" dataKey="emergency" name="Emergency" stroke="#dc2626" fill="url(#gEmerg)" strokeWidth={2} dot={{ fill: '#dc2626', r: 3, strokeWidth: 0 }} />
            <Area type="monotone" dataKey="completed" name="Completed" stroke="#059669" fill="none" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status pie */}
        <div className="card p-5">
          <h2 className="font-bold text-slate-800 mb-1">Today's Status Distribution</h2>
          <p className="text-xs text-slate-400 mb-4">Breakdown of token statuses</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-slate-300">
              <BarChart3 size={32} className="mb-2" />
              <p className="text-sm">No data for today</p>
            </div>
          )}
        </div>

        {/* Specialization bar chart */}
        <div className="card p-5">
          <h2 className="font-bold text-slate-800 mb-1">Patients by Specialization</h2>
          <p className="text-xs text-slate-400 mb-4">All-time distribution</p>
          {bySpec.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={bySpec} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={90} stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Patients" fill="#0284c7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-slate-300">
              <BarChart3 size={32} className="mb-2" />
              <p className="text-sm">No data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

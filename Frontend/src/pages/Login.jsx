import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]  = useState(false);
  const { login }              = useAuth();
  const navigate               = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(`/${user.role}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-header flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <Stethoscope size={20} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl">MediQueue</span>
        </div>
        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Smart Queue Management for Modern Healthcare
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            Streamline patient flow, reduce wait times, and deliver better care with real-time queue management.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[{ label: 'Doctors', value: '20+' }, { label: 'Daily Patients', value: '100+' }, { label: 'Wait Reduction', value: '60%' }].map(({ label, value }) => (
              <div key={label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-slate-500 text-sm">© 2026 MediQueue. All rights reserved.</p>
      </div>

      {/* Right form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center gradient-header">
              <Stethoscope size={18} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">MediQueue</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Sign in to your account</h1>
          <p className="text-slate-500 text-sm mb-8">Enter your credentials to access the system</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
              <input type="email" className="input-field" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required autoFocus />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="input-field pr-11" placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><LogIn size={17} /> Sign In</>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            New patient?{' '}
            <Link to="/register" className="text-sky-600 hover:text-sky-700 font-semibold">Create a patient account</Link>
          </p>

          <div className="mt-5 p-4 bg-sky-50 border border-sky-200 rounded-xl">
            <p className="text-xs font-bold text-sky-800 mb-1">For Doctors &amp; Admins</p>
            <p className="text-xs text-sky-700 leading-relaxed">
              Doctor accounts are created by the hospital administrator. The default admin account is auto-created when the server first starts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
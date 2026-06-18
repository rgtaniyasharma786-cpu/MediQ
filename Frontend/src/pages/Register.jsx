import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, UserPlus, User, CheckCircle } from 'lucide-react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
  });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // Register as patient only — no auto-login, no token stored
      await authAPI.register({
        name:        form.name,
        email:       form.email,
        password:    form.password,
        phone:       form.phone,
        role:        'patient',        // always patient
        gender:      form.gender,
        dateOfBirth: form.dateOfBirth,
      });

      // Show success state then redirect to login
      setSuccess(true);
      toast.success('Account created! Please sign in.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="card p-10">
            <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-200 rounded-full
                            flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={38} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">You're registered!</h2>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Your patient account has been created successfully. You'll be
              redirected to the login page in a moment.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary w-full py-3"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Registration form ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center gradient-header mx-auto mb-4"
            style={{ boxShadow: '0 8px 24px rgba(15,23,42,0.2)' }}
          >
            <Stethoscope size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create Patient Account</h1>
          <p className="text-slate-500 text-sm mt-1">
            Register to book appointments and track your queue
          </p>
        </div>

        {/* Form card */}
        <div
          className="bg-white rounded-2xl border border-slate-200 p-7"
          style={{ boxShadow: '0 4px 24px rgba(15,23,42,0.07)' }}
        >
          {/* Role badge — fixed, not selectable */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-sky-50 border-2 border-sky-200 mb-5">
            <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-sky-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-sky-700">Registering as Patient</p>
              <p className="text-xs text-slate-400">
                Doctors are registered by the hospital admin
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                className="input-field"
                placeholder="Your full name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Phone
                </label>
                <input
                  className="input-field"
                  placeholder="+91 9876543210"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Gender + DOB */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Gender
                </label>
                <select
                  className="input-field"
                  value={form.gender}
                  onChange={e => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={form.dateOfBirth}
                  onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
                />
              </div>
            </div>

            {/* Password + Confirm */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Password <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  className={`input-field ${
                    form.confirmPassword && form.password !== form.confirmPassword
                      ? 'border-red-400 focus:border-red-400'
                      : ''
                  }`}
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                />
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-1"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <><UserPlus size={17} /> Create Account</>
              }
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-600 hover:text-sky-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

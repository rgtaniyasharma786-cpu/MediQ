import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProfileDropdown() {
  const { user, logout } = useAuth();
  const [open, setOpen]  = useState(false);
  const navigate         = useNavigate();
  const ref              = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const avatarColor = { admin: 'from-violet-500 to-purple-600', doctor: 'from-teal-500 to-emerald-600', patient: 'from-sky-500 to-blue-600' };
  const roleRoute   = { admin: '/admin', doctor: '/doctor', patient: '/patient' };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 transition-all"
      >
        <div className={`w-8 h-8 bg-gradient-to-br ${avatarColor[user?.role] || avatarColor.patient} rounded-lg flex items-center justify-center text-xs font-bold text-white`}>
          {user?.avatar
            ? <img src={user.avatar} alt="avatar" className="w-full h-full rounded-lg object-cover" />
            : getInitials(user?.name)
          }
        </div>
        <span className="hidden md:block text-sm font-semibold text-slate-700 max-w-28 truncate">{user?.name}</span>
        <ChevronDown size={13} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50"
          style={{ boxShadow: '0 20px 40px rgba(15,23,42,0.12)' }}>
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
            <p className="font-bold text-slate-800 text-sm truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
          </div>
          <div className="p-1.5">
            <button onClick={() => { navigate(roleRoute[user?.role]); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm font-medium transition-all">
              <LayoutDashboard size={15} className="text-slate-400" /> Dashboard
            </button>
            <button onClick={() => { navigate(`${roleRoute[user?.role]}/profile`); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm font-medium transition-all">
              <User size={15} className="text-slate-400" /> Profile
            </button>
            <div className="my-1 border-t border-slate-100" />
            <button onClick={() => { logout(); navigate('/login'); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 text-sm font-semibold transition-all">
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
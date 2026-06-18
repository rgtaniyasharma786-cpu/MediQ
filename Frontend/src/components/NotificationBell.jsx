import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, AlertTriangle, Info, CheckCircle, Zap } from 'lucide-react';
import { patientsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';

export default function NotificationBell() {
  const { user }              = useAuth();
  const [open, setOpen]       = useState(false);
  const [notifs, setNotifs]   = useState([]);
  const [unread, setUnread]   = useState(0);
  const ref                   = useRef(null);

  useEffect(() => { if (user) fetch(); }, [user]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = (n) => { setNotifs(p => [n, ...p].slice(0, 20)); setUnread(c => c + 1); };
    socket.on('notification', handler);
    return () => socket.off('notification', handler);
  }, []);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const fetch = async () => {
    try {
      const res = await patientsAPI.getNotifications();
      setNotifs(res.data);
      setUnread(res.data.filter(n => !n.isRead).length);
    } catch {}
  };

  const markAll = async () => {
    try { await patientsAPI.markAllRead(); setNotifs(p => p.map(n => ({ ...n, isRead: true }))); setUnread(0); } catch {}
  };

  const typeIcon = {
    emergency: { icon: Zap,          color: 'text-red-500',     bg: 'bg-red-50'     },
    success:   { icon: CheckCircle,  color: 'text-emerald-500', bg: 'bg-emerald-50' },
    warning:   { icon: AlertTriangle,color: 'text-amber-500',   bg: 'bg-amber-50'   },
    info:      { icon: Info,         color: 'text-sky-500',     bg: 'bg-sky-50'     },
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-all">
        <Bell size={19} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
          style={{ boxShadow: '0 20px 40px rgba(15,23,42,0.12)' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
            {unread > 0 && (
              <button onClick={markAll} className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1">
                <Check size={11} /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
            {notifs.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={28} className="text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No notifications</p>
              </div>
            ) : notifs.map(n => {
              const cfg  = typeIcon[n.type] || typeIcon.info;
              const Icon = cfg.icon;
              return (
                <div key={n._id} className={`px-4 py-3 hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-sky-50/40' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg}`}>
                      <Icon size={13} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 leading-tight">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    {!n.isRead && <div className="w-2 h-2 bg-sky-500 rounded-full mt-1.5 flex-shrink-0" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
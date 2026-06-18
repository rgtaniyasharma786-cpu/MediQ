import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldCheck, Stethoscope, User, ToggleLeft, ToggleRight } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try { const res = await adminAPI.getUsers(); setUsers(res.data); }
    catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const toggleUser = async (id) => {
    try {
      const res = await adminAPI.toggleUser(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: res.data.isActive } : u));
      toast.success('User status updated');
    } catch { toast.error('Failed to update user'); }
  };

  const roleIcon = { admin: ShieldCheck, doctor: Stethoscope, patient: User };
  const roleColor = {
    admin: 'text-violet-700 bg-violet-50 border-violet-200',
    doctor: 'text-teal-700 bg-teal-50 border-teal-200',
    patient: 'text-sky-700 bg-sky-50 border-sky-200'
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const counts = {
    admin: users.filter(u => u.role === 'admin').length,
    doctor: users.filter(u => u.role === 'doctor').length,
    patient: users.filter(u => u.role === 'patient').length,
  };

  return (
    <div className="space-y-5 max-w-8xl">
      <div>
        <h1 className="page-title">User Management</h1>
        <p className="text-slate-500 text-sm mt-0.5">{users.length} total registered users</p>
      </div>

      {/* Role summary */}
      <div className="grid grid-cols-3 gap-4">
        {(['admin', 'doctor', 'patient']).map(role => {
          const Icon = roleIcon[role];
          return (
            <button key={role} onClick={() => setRoleFilter(roleFilter === role ? 'all' : role)}
              className={`card p-4 text-left transition-all hover:shadow-md ${roleFilter === role ? 'ring-2 ring-sky-500 ring-offset-1' : ''}`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${roleColor[role]}`}>
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 font-mono">{counts[role]}</p>
                  <p className="text-xs text-slate-500 font-medium capitalize">{role}s</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 ">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input-field pl-10" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-auto" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="doctor">Doctor</option>
          <option value="patient">Patient</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin" /></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="table-header">User</th>
                <th className="table-header">Role</th>
                <th className="table-header hidden md:table-cell">Phone</th>
                <th className="table-header hidden md:table-cell">Joined</th>
                <th className="table-header">Status</th>
                <th className="table-header">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const Icon = roleIcon[u.role] || User;
                return (
                  <tr key={u._id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm font-bold text-slate-600">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge border capitalize ${roleColor[u.role] || ''}`}>
                        <Icon size={10} /> {u.role}
                      </span>
                    </td>
                    <td className="table-cell hidden md:table-cell text-slate-500">{u.phone || '—'}</td>
                    <td className="table-cell hidden md:table-cell text-slate-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="table-cell">
                      <span className={`badge border ${u.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <button onClick={() => toggleUser(u._id)} title={u.isActive ? 'Deactivate' : 'Activate'}>
                        {u.isActive
                          ? <ToggleRight size={22} className="text-emerald-500 hover:text-emerald-600 transition-colors" />
                          : <ToggleLeft size={22} className="text-slate-400 hover:text-slate-600 transition-colors" />
                        }
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="py-16 text-center">
                  <Users size={32} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">No users found</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

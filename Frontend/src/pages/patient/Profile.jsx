import React, { useState, useEffect } from 'react';
import { User, Phone, Calendar, Droplet, MapPin, Edit3, Save, X, AlertCircle } from 'lucide-react';
import { patientsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function PatientProfile() {
  const { user } = useAuth();
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [form,    setForm]      = useState({
    gender: '', dateOfBirth: '', bloodGroup: '', address: '', allergies: '',
    emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelation: '',
  });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await patientsAPI.getProfile();
      setProfile(res.data);
      setForm({
        gender: res.data.gender || '',
        dateOfBirth: res.data.dateOfBirth?.split('T')[0] || '',
        bloodGroup: res.data.bloodGroup || '',
        address: res.data.address || '',
        allergies: (res.data.allergies || []).join(', '),
        emergencyContactName: res.data.emergencyContact?.name || '',
        emergencyContactPhone: res.data.emergencyContact?.phone || '',
        emergencyContactRelation: res.data.emergencyContact?.relation || '',
      });
    } catch { toast.error('Failed to load profile'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await patientsAPI.updateProfile({
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        bloodGroup: form.bloodGroup,
        address: form.address,
        allergies: form.allergies.split(',').map(s => s.trim()).filter(Boolean),
        emergencyContact: {
          name:     form.emergencyContactName,
          phone:    form.emergencyContactPhone,
          relation: form.emergencyContactRelation,
        },
      });
      setProfile(res.data);
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const avatarColor = 'from-sky-500 to-blue-600';

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5 max-w-8xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your personal and medical information</p>
        </div>
        <button
          onClick={() => editing ? setEditing(false) : setEditing(true)}
          className={editing ? 'btn-secondary' : 'btn-primary'}
        >
          {editing ? <><X size={15} /> Cancel</> : <><Edit3 size={15} /> Edit Profile</>}
        </button>
      </div>

      {/* Account card */}
      <div className="card p-5 flex items-center gap-4">
        <div className={`w-16 h-16 bg-gradient-to-br ${avatarColor} rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0`}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
          <p className="text-slate-500 text-sm">{user?.email}</p>
          <p className="text-slate-400 text-xs mt-0.5">{user?.phone || 'No phone number added'}</p>
        </div>
      </div>

      {/* Personal information */}
      <div className="card p-5">
        <h3 className="section-title mb-4">
          <div className="w-6 h-6 bg-sky-50 rounded-lg flex items-center justify-center border border-sky-100">
            <User size={13} className="text-sky-600" />
          </div>
          Personal Information
        </h3>

        {editing ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Gender</label>
              <select className="input-field" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select gender</option>
                {['Male', 'Female', 'Other'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Date of Birth</label>
              <input type="date" className="input-field" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Blood Group</label>
              <select className="input-field" value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}>
                <option value="">Select blood group</option>
                {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Address</label>
              <input className="input-field" placeholder="Your city / address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Known Allergies <span className="text-slate-400 font-normal">(comma-separated)</span>
              </label>
              <input className="input-field" placeholder="e.g., Penicillin, Aspirin, Dust" value={form.allergies} onChange={e => setForm({ ...form, allergies: e.target.value })} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: User,    label: 'Gender',       value: profile?.gender      || '—' },
              { icon: Calendar,label: 'Date of Birth', value: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-IN') : '—' },
              { icon: Droplet, label: 'Blood Group',  value: profile?.bloodGroup  || '—' },
              { icon: MapPin,  label: 'Address',      value: profile?.address     || '—' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label}>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                  <Icon size={11} /> {label}
                </div>
                <p className="text-sm font-semibold text-slate-700">{value}</p>
              </div>
            ))}

            {profile?.allergies?.length > 0 && (
              <div className="col-span-2">
                <p className="text-xs text-slate-400 font-medium mb-2 flex items-center gap-1">
                  <AlertCircle size={11} /> Allergies
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.allergies.map((a, i) => (
                    <span key={i} className="badge bg-red-50 text-red-600 border border-red-200">⚠ {a}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Emergency contact */}
      <div className="card p-5">
        <h3 className="section-title mb-4">
          <div className="w-6 h-6 bg-red-50 rounded-lg flex items-center justify-center border border-red-100">
            <Phone size={13} className="text-red-500" />
          </div>
          Emergency Contact
        </h3>

        {editing ? (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Name</label>
              <input className="input-field" placeholder="Contact name" value={form.emergencyContactName} onChange={e => setForm({ ...form, emergencyContactName: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Phone</label>
              <input className="input-field" placeholder="+91 XXXXXXXXXX" value={form.emergencyContactPhone} onChange={e => setForm({ ...form, emergencyContactPhone: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Relation</label>
              <input className="input-field" placeholder="e.g., Spouse, Parent" value={form.emergencyContactRelation} onChange={e => setForm({ ...form, emergencyContactRelation: e.target.value })} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Name',     value: profile?.emergencyContact?.name     || '—' },
              { label: 'Phone',    value: profile?.emergencyContact?.phone    || '—' },
              { label: 'Relation', value: profile?.emergencyContact?.relation || '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-slate-400 font-medium mb-1">{label}</p>
                <p className="text-sm font-semibold text-slate-700">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save button */}
      {editing && (
        <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-3 text-base">
          {saving
            ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            : <><Save size={16} /> Save Changes</>
          }
        </button>
      )}
    </div>
  );
}

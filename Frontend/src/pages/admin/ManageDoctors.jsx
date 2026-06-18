import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Search, Stethoscope, X,
  Star, Clock, IndianRupee, MapPin, Users, ChevronDown
} from 'lucide-react';
import { adminAPI, doctorsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/* ─────────────────────────────────────────────────────────────────────────────
   MODAL
───────────────────────────────────────────────────────────────────────────── */
function DoctorModal({ doctor, onClose, onSave }) {
  const isEdit = !!doctor;

  const [form, setForm] = useState(
    isEdit
      ? {
          name: doctor.user?.name || '',
          email: doctor.user?.email || '',
          phone: doctor.user?.phone || '',
          specialization: doctor.specialization || '',
          fees: doctor.fees || '',
          qualification: doctor.qualification || '',
          experience: doctor.experience || '',
          room: doctor.room || '',
          maxPatientsPerDay: doctor.maxPatientsPerDay || 30,
          isAvailableToday: doctor.isAvailableToday,
          availability: doctor.availability || {
            days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            startTime: '09:00',
            endTime: '17:00',
          },
          password: '',
        }
      : {
          name: '', email: '', phone: '', password: '',
          specialization: '', fees: '', qualification: '',
          experience: '', room: '', maxPatientsPerDay: 30,
          isAvailableToday: true,
          availability: {
            days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            startTime: '09:00',
            endTime: '17:00',
          },
        }
  );

  const [loading, setLoading] = useState(false);

  // prevent body scroll while modal open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const toggleDay = (day) => {
    const days = form.availability.days.includes(day)
      ? form.availability.days.filter(d => d !== day)
      : [...form.availability.days, day];
    setForm({ ...form, availability: { ...form.availability, days } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await adminAPI.updateDoctor(doctor._id, form);
        toast.success('Doctor updated successfully');
      } else {
        await adminAPI.createDoctor(form);
        toast.success('Doctor added successfully');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* ── backdrop covers full screen including sidebar ── */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      
      {/* ── modal box — truly centered on full screen ── */}
      <div
        className="bg-white rounded-2xl border border-slate-200 flex flex-col w-full"
        style={{
          maxWidth: '580px',
          height: 'min(88vh, 680px)',
          boxShadow: '0 24px 64px rgba(15,23,42,0.28)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── HEADER — never scrolls ── */}
        <div className="flex-none flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-white rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-sky-50 border border-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Stethoscope size={15} className="text-sky-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm leading-none">
                {isEdit ? 'Edit Doctor' : 'Add New Doctor'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isEdit ? 'Update doctor profile' : 'Register a new doctor'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── BODY — this part scrolls ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-4">

            {/* PERSONAL INFORMATION */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  Personal Information
                </span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    className="input-field py-2 text-sm"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="Dr. Full Name"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    className="input-field py-2 text-sm"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                    placeholder="doctor@hospital.com"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Phone</label>
                  <input
                    className="input-field py-2 text-sm"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 XXXXXXXXXX"
                  />
                </div>
                {!isEdit && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Password <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      className="input-field py-2 text-sm"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      required
                      minLength={6}
                      placeholder="Min. 6 characters"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* PROFESSIONAL DETAILS */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  Professional Details
                </span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Specialization <span className="text-red-400">*</span>
                  </label>
                  <input
                    className="input-field py-2 text-sm"
                    value={form.specialization}
                    onChange={e => setForm({ ...form, specialization: e.target.value })}
                    required
                    placeholder="e.g. Cardiology"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Fee (₹) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    className="input-field py-2 text-sm"
                    value={form.fees}
                    onChange={e => setForm({ ...form, fees: e.target.value })}
                    required
                    placeholder="500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Qualification</label>
                  <input
                    className="input-field py-2 text-sm"
                    value={form.qualification}
                    onChange={e => setForm({ ...form, qualification: e.target.value })}
                    placeholder="MBBS, MD"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Experience (yrs)</label>
                  <input
                    type="number"
                    className="input-field py-2 text-sm"
                    value={form.experience}
                    onChange={e => setForm({ ...form, experience: e.target.value })}
                    placeholder="5"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Room / Location</label>
                  <input
                    className="input-field py-2 text-sm"
                    value={form.room}
                    onChange={e => setForm({ ...form, room: e.target.value })}
                    placeholder="Room 101"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Max Patients / Day</label>
                  <input
                    type="number"
                    className="input-field py-2 text-sm"
                    value={form.maxPatientsPerDay}
                    onChange={e => setForm({ ...form, maxPatientsPerDay: e.target.value })}
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* AVAILABILITY */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  Availability
                </span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              <div className="mb-3">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Working Days</label>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS.map(day => (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border
                        ${form.availability.days.includes(day)
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-sky-300 hover:text-sky-600'
                        }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Start Time</label>
                  <input
                    type="time"
                    className="input-field py-2 text-sm"
                    value={form.availability.startTime}
                    onChange={e => setForm({ ...form, availability: { ...form.availability, startTime: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">End Time</label>
                  <input
                    type="time"
                    className="input-field py-2 text-sm"
                    value={form.availability.endTime}
                    onChange={e => setForm({ ...form, availability: { ...form.availability, endTime: e.target.value } })}
                  />
                </div>
              </div>

              {/* Available today toggle — edit only */}
              {isEdit && (
                <div className="mt-3 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Available Today</p>
                    <p className="text-xs text-slate-400">Toggle doctor's availability for today</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isAvailableToday: !form.isAvailableToday })}
                    className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0
                      ${form.isAvailableToday ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all
                      ${form.isAvailableToday ? 'left-5' : 'left-0.5'}`}
                    />
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── FOOTER — never scrolls, always visible ── */}
        <div className="flex-none flex gap-3 px-5 py-3.5 border-t border-slate-200 bg-white rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1 py-2.5 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="btn-primary flex-1 py-2.5 text-sm"
          >
            {loading
              ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : isEdit ? 'Save Changes' : 'Add Doctor'
            }
          </button>
        </div>

      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DOCTOR CARD
───────────────────────────────────────────────────────────────────────────── */
function DoctorCard({ doctor, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-sky-200 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Card header strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 to-teal-400" />

      <div className="p-5">
        {/* Doctor identity */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-50 to-teal-50 border border-sky-100 flex items-center justify-center text-xl font-bold text-sky-700 flex-shrink-0">
              {doctor.user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-800 text-sm leading-tight truncate">
                {doctor.user?.name}
              </p>
              <p className="text-xs font-semibold text-sky-600 mt-0.5">
                {doctor.specialization}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {doctor.qualification || '—'}
              </p>
            </div>
          </div>

          {/* Availability badge */}
          <span className={`flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border
            ${doctor.isAvailableToday
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full inline-block
              ${doctor.isAvailableToday ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}
            />
            {doctor.isAvailableToday ? 'Available' : 'Off Today'}
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
            <p className="text-base font-bold text-slate-800">{doctor.experience || 0}</p>
            <p className="text-[10px] text-slate-400 font-medium">Yrs Exp</p>
          </div>
          <div className="bg-sky-50 rounded-xl p-2.5 text-center border border-sky-100">
            <p className="text-base font-bold text-sky-700">₹{doctor.fees}</p>
            <p className="text-[10px] text-sky-500 font-medium">Fee</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
            <p className="text-base font-bold text-slate-800">{doctor.maxPatientsPerDay || 30}</p>
            <p className="text-[10px] text-slate-400 font-medium">Max/Day</p>
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MapPin size={12} className="text-slate-400 flex-shrink-0" />
            <span className="truncate">{doctor.room || 'Room not assigned'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock size={12} className="text-slate-400 flex-shrink-0" />
            <span>{doctor.availability?.startTime || '09:00'} – {doctor.availability?.endTime || '17:00'}</span>
          </div>
        </div>

        {/* Working days */}
        <div className="flex gap-1 flex-wrap mb-4">
          {DAYS.map(day => (
            <span
              key={day}
              className={`text-[10px] px-1.5 py-0.5 rounded font-bold
                ${doctor.availability?.days?.includes(day)
                  ? 'bg-sky-100 text-sky-700'
                  : 'bg-slate-100 text-slate-300'
                }`}
            >
              {day}
            </span>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={() => onEdit(doctor)}
            className="btn-secondary flex-1 text-xs py-2 gap-1.5"
          >
            <Edit size={13} /> Edit
          </button>
          <button
            onClick={() => onDelete(doctor._id)}
            className="btn-danger flex-1 text-xs py-2 gap-1.5"
          >
            <Trash2 size={13} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function ManageDoctors() {
  const [doctors, setDoctors]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all'); // all | available | unavailable
  const [modal, setModal]       = useState(null);  // null | 'add' | doctor object

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    try {
      const res = await doctorsAPI.getAll();
      setDoctors(res.data);
    } catch {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this doctor from the system?')) return;
    try {
      await adminAPI.deleteDoctor(id);
      setDoctors(prev => prev.filter(d => d._id !== id));
      toast.success('Doctor removed');
    } catch {
      toast.error('Failed to remove doctor');
    }
  };

  const filtered = doctors.filter(d => {
    const matchSearch =
      d.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'available' && d.isAvailableToday) ||
      (filter === 'unavailable' && !d.isAvailableToday);
    return matchSearch && matchFilter;
  });

  const available   = doctors.filter(d => d.isAvailableToday).length;
  const unavailable = doctors.length - available;

  return (
    <div className="space-y-6 max-w-8xl">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Manage Doctors</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage doctor profiles, availability, and consultation details
          </p>
        </div>
        <button
          onClick={() => setModal('add')}
          className="btn-primary flex-shrink-0"
        >
          <Plus size={16} /> Add Doctor
        </button>
      </div>

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Total Doctors',
            value: doctors.length,
            color: 'bg-sky-50 border-sky-200 text-sky-700',
            key: 'all',
          },
          {
            label: 'Available Today',
            value: available,
            color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
            key: 'available',
          },
          {
            label: 'Off Today',
            value: unavailable,
            color: 'bg-slate-50 border-slate-200 text-slate-600',
            key: 'unavailable',
          },
        ].map(({ label, value, color, key }) => (
          <button
            key={key}
            onClick={() => setFilter(filter === key ? 'all' : key)}
            className={`card p-4 text-left transition-all hover:shadow-md
              ${filter === key ? 'ring-2 ring-sky-400 ring-offset-1' : ''}`}
          >
            <p className={`text-2xl font-bold font-mono ${color.split(' ')[2]}`}>{value}</p>
            <p className="text-xs text-slate-500 font-semibold mt-1">{label}</p>
          </button>
        ))}
      </div>

      {/* ── Search + filter bar ── */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input-field pl-10"
            placeholder="Search by name or specialization..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field w-40"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="all">All Doctors</option>
          <option value="available">Available</option>
          <option value="unavailable">Off Today</option>
        </select>
      </div>

      {/* ── Doctor grid ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading doctors…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Stethoscope size={28} className="text-slate-300" />
          </div>
          <p className="font-bold text-slate-600 mb-1">No doctors found</p>
          <p className="text-slate-400 text-sm mb-5">
            {search ? `No results for "${search}"` : 'Add your first doctor to get started'}
          </p>
          {!search && (
            <button onClick={() => setModal('add')} className="btn-primary mx-auto">
              <Plus size={15} /> Add First Doctor
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-400 font-medium">
            Showing {filtered.length} of {doctors.length} doctor{doctors.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(doctor => (
              <DoctorCard
                key={doctor._id}
                doctor={doctor}
                onEdit={(d) => setModal(d)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Modal ── */}
      {(modal === 'add' || (modal && typeof modal === 'object')) && (
        <DoctorModal
          doctor={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchDoctors(); }}
        />
      )}
    </div>
  );
}

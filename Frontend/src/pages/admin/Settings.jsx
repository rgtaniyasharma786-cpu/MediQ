import React, { useState, useEffect } from 'react';
import { Settings, Save, Clock, Users, AlertTriangle, Bell, RefreshCw, Building } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function SystemSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const res = await adminAPI.getSettings();
      setSettings(res.data);
    } catch { toast.error('Failed to load settings'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminAPI.updateSettings(settings);
      toast.success('Settings saved successfully!');
    } catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  const toggleDay = (day) => {
    const currentDays = settings.workingDays || [];
    const days = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    setSettings({ ...settings, workingDays: days });
  };

  const toggleSwitch = (key) => setSettings({ ...settings, [key]: !settings[key] });

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-8xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">System Settings</h1>
          <p className="text-slate-500 text-sm mt-0.5">Configure clinic settings and system preferences</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving
            ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            : <><Save size={15} /> Save Settings</>
          }
        </button>
      </div>

      {/* Clinic Information */}
      <div className="card p-5">
        <h2 className="section-title mb-4">
          <div className="w-6 h-6 bg-sky-50 rounded-lg flex items-center justify-center border border-sky-100">
            <Building size={13} className="text-sky-600" />
          </div>
          Clinic Information
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Clinic Name</label>
            <input
              className="input-field"
              value={settings.clinicName}
              onChange={e => setSettings({ ...settings, clinicName: e.target.value })}
              placeholder="Hospital / Clinic Name"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Contact Phone</label>
            <input
              className="input-field"
              value={settings.clinicPhone}
              onChange={e => setSettings({ ...settings, clinicPhone: e.target.value })}
              placeholder="+91 XXXXXXXXXX"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Contact Email</label>
            <input
              type="email"
              className="input-field"
              value={settings.clinicEmail}
              onChange={e => setSettings({ ...settings, clinicEmail: e.target.value })}
              placeholder="clinic@hospital.com"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Clinic Address</label>
            <input
              className="input-field"
              value={settings.clinicAddress}
              onChange={e => setSettings({ ...settings, clinicAddress: e.target.value })}
              placeholder="Full address"
            />
          </div>
        </div>
      </div>

      {/* Queue Settings */}
      <div className="card p-5">
        <h2 className="section-title mb-4">
          <div className="w-6 h-6 bg-teal-50 rounded-lg flex items-center justify-center border border-teal-100">
            <Users size={13} className="text-teal-600" />
          </div>
          Queue Configuration
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Default Max Patients / Day</label>
            <input
              type="number"
              className="input-field"
              value={settings.defaultMaxPatientsPerDay}
              onChange={e => setSettings({ ...settings, defaultMaxPatientsPerDay: parseInt(e.target.value) })}
              min="1"
              max="200"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Default Consultation Time (min)</label>
            <input
              type="number"
              className="input-field"
              value={settings.defaultConsultationTime}
              onChange={e => setSettings({ ...settings, defaultConsultationTime: parseInt(e.target.value) })}
              min="5"
              max="120"
            />
          </div>
        </div>
      </div>

      {/* Working Hours */}
      <div className="card p-5">
        <h2 className="section-title mb-4">
          <div className="w-6 h-6 bg-violet-50 rounded-lg flex items-center justify-center border border-violet-100">
            <Clock size={13} className="text-violet-600" />
          </div>
          Default Working Hours
        </h2>
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-600 mb-2">Working Days</label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all
                  ${(settings.workingDays || []).includes(day)
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-sky-300 hover:text-sky-600'
                  }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Start Time</label>
            <input
              type="time"
              className="input-field"
              value={settings.workingHoursStart}
              onChange={e => setSettings({ ...settings, workingHoursStart: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">End Time</label>
            <input
              type="time"
              className="input-field"
              value={settings.workingHoursEnd}
              onChange={e => setSettings({ ...settings, workingHoursEnd: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* System Toggles */}
      <div className="card p-5">
        <h2 className="section-title mb-4">
          <div className="w-6 h-6 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100">
            <Settings size={13} className="text-amber-600" />
          </div>
          System Preferences
        </h2>
        <div className="space-y-3">
          {[
            {
              key: 'allowEmergencyBooking',
              icon: AlertTriangle,
              iconColor: 'text-red-500',
              label: 'Allow Emergency Booking',
              desc: 'Allow patients to mark their token as emergency when booking',
            },
            {
              key: 'autoResetQueue',
              icon: RefreshCw,
              iconColor: 'text-teal-500',
              label: 'Auto Reset Queue Daily',
              desc: 'Automatically cancel all waiting tokens at midnight each day',
            },
            {
              key: 'notificationsEnabled',
              icon: Bell,
              iconColor: 'text-sky-500',
              label: 'In-App Notifications',
              desc: 'Enable real-time in-app notifications for patients and doctors',
            },
          ].map(({ key, icon: Icon, iconColor, label, desc }) => (
            <div
              key={key}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-200 flex-shrink-0">
                  <Icon size={15} className={iconColor} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">{label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleSwitch(key)}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-4
                  ${settings[key] ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all
                  ${settings[key] ? 'left-6' : 'left-1'}`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Auto Reset Time */}
      {settings.autoResetQueue && (
        <div className="card p-5">
          <h2 className="section-title mb-4">
            <div className="w-6 h-6 bg-teal-50 rounded-lg flex items-center justify-center border border-teal-100">
              <RefreshCw size={13} className="text-teal-600" />
            </div>
            Auto Reset Schedule
          </h2>
          <div className="max-w-xs">
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Reset Time (daily)</label>
            <input
              type="time"
              className="input-field"
              value={settings.autoResetTime}
              onChange={e => setSettings({ ...settings, autoResetTime: e.target.value })}
            />
            <p className="text-xs text-slate-400 mt-2">
              Queue will be automatically reset at this time every day
            </p>
          </div>
        </div>
      )}

      {/* Save button bottom */}
      <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-3">
        {saving
          ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          : <><Save size={16} /> Save All Settings</>
        }
      </button>

    </div>
  );
}
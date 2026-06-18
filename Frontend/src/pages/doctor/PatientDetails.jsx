import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Droplet, Phone, AlertTriangle, Plus, Trash2, Save, FileText } from 'lucide-react';
import { queueAPI, prescriptionAPI, doctorsAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function PatientDetails() {
  const { tokenId } = useParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrescription, setShowPrescription] = useState(false);
  const [prescription, setPrescription] = useState({
    diagnosis: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    doctorNotes: '',
    followUpDate: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchToken(); }, [tokenId]);

  const fetchToken = async () => {
    try {
      const docRes = await doctorsAPI.getMyProfile();
      const qRes = await queueAPI.getDoctorQueue(docRes.data._id);
      const found = qRes.data.find(t => t._id === tokenId);
      setToken(found || null);
    } catch { toast.error('Failed to load patient details'); }
    finally { setLoading(false); }
  };

  const addMedicine = () => setPrescription(p => ({ ...p, medicines: [...p.medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }] }));
  const removeMedicine = (i) => setPrescription(p => ({ ...p, medicines: p.medicines.filter((_, idx) => idx !== i) }));
  const updateMedicine = (i, field, value) => setPrescription(p => { const m = [...p.medicines]; m[i] = { ...m[i], [field]: value }; return { ...p, medicines: m }; });

  const handleSavePrescription = async () => {
    setSaving(true);
    try {
      await prescriptionAPI.create({ queueId: tokenId, ...prescription });
      toast.success('Prescription saved and consultation completed!');
      navigate('/doctor/queue');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save prescription'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin" /></div>;
  if (!token) return <div className="card p-16 text-center"><p className="text-slate-400">Patient not found</p></div>;

  const patient = token.patient;

  return (
    <div className="space-y-5 max-w-8xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all border border-slate-200">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="page-title">Patient Details</h1>
          <p className="text-slate-500 text-sm">Token #{token.tokenNumber}</p>
        </div>
      </div>

      {/* Patient card */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 bg-sky-50 border-2 border-sky-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-sky-700">
            {patient?.user?.name?.[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{patient?.user?.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              {token.isEmergency && <span className="badge-emergency">🚨 Emergency</span>}
              <span className={`badge border capitalize ${token.status === 'ongoing' ? 'badge-ongoing' : token.status === 'completed' ? 'badge-completed' : 'badge-waiting'}`}>{token.status}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { icon: User, label: 'Gender', value: patient?.gender || '—' },
            { icon: Calendar, label: 'Date of Birth', value: patient?.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : '—' },
            { icon: Droplet, label: 'Blood Group', value: patient?.bloodGroup || '—' },
            { icon: Phone, label: 'Phone', value: patient?.user?.phone || '—' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1"><Icon size={11} /> {label}</div>
              <p className="text-sm font-semibold text-slate-700">{value}</p>
            </div>
          ))}
        </div>

        {token.problemDescription && (
          <div className="bg-sky-50 rounded-xl p-4 border border-sky-100 mb-3">
            <p className="text-xs font-bold text-sky-600 mb-1">Chief Complaint</p>
            <p className="text-sm text-slate-700">{token.problemDescription}</p>
          </div>
        )}

        {token.symptoms?.length > 0 && (
          <div>
            <p className="text-xs font-bold text-slate-400 mb-2">Symptoms</p>
            <div className="flex flex-wrap gap-1.5">
              {token.symptoms.map((s, i) => <span key={i} className="badge bg-teal-50 text-teal-700 border border-teal-200">{s}</span>)}
            </div>
          </div>
        )}
      </div>

      {/* Medical history */}
      {patient?.medicalHistory?.length > 0 && (
        <div className="card p-5">
          <h3 className="section-title mb-3"><AlertTriangle size={16} className="text-amber-500" /> Medical History</h3>
          <div className="space-y-2">
            {patient.medicalHistory.map((h, i) => (
              <div key={i} className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                <p className="font-semibold text-slate-800 text-sm">{h.condition}</p>
                {h.notes && <p className="text-slate-500 text-xs mt-0.5">{h.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Allergies */}
      {patient?.allergies?.length > 0 && (
        <div className="card p-5">
          <h3 className="section-title mb-3">Known Allergies</h3>
          <div className="flex flex-wrap gap-2">
            {patient.allergies.map((a, i) => <span key={i} className="badge bg-red-50 text-red-600 border border-red-200">⚠ {a}</span>)}
          </div>
        </div>
      )}

      {/* Prescription section */}
      {token.status !== 'completed' && token.status !== 'cancelled' && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title"><FileText size={16} className="text-sky-500" /> Prescription</h3>
            <button onClick={() => setShowPrescription(!showPrescription)} className={showPrescription ? 'btn-secondary text-sm py-2' : 'btn-primary text-sm py-2'}>
              {showPrescription ? 'Hide Form' : 'Write Prescription'}
            </button>
          </div>

          {showPrescription && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Diagnosis</label>
                <input className="input-field" placeholder="Primary diagnosis" value={prescription.diagnosis} onChange={e => setPrescription(p => ({ ...p, diagnosis: e.target.value }))} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-600">Medicines</label>
                  <button onClick={addMedicine} className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 bg-sky-50 px-2 py-1 rounded-lg border border-sky-200">
                    <Plus size={11} /> Add Medicine
                  </button>
                </div>
                <div className="space-y-2.5">
                  {prescription.medicines.map((med, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input className="input-field text-sm py-2" placeholder="Medicine name" value={med.name} onChange={e => updateMedicine(i, 'name', e.target.value)} />
                        <input className="input-field text-sm py-2" placeholder="Dosage (e.g. 500mg)" value={med.dosage} onChange={e => updateMedicine(i, 'dosage', e.target.value)} />
                        <input className="input-field text-sm py-2" placeholder="Frequency (e.g. TID)" value={med.frequency} onChange={e => updateMedicine(i, 'frequency', e.target.value)} />
                        <input className="input-field text-sm py-2" placeholder="Duration (e.g. 5 days)" value={med.duration} onChange={e => updateMedicine(i, 'duration', e.target.value)} />
                      </div>
                      <div className="flex gap-2">
                        <input className="input-field text-sm py-2 flex-1" placeholder="Special instructions" value={med.instructions} onChange={e => updateMedicine(i, 'instructions', e.target.value)} />
                        {prescription.medicines.length > 1 && (
                          <button onClick={() => removeMedicine(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg border border-red-100 transition-all"><Trash2 size={14} /></button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Doctor Notes</label>
                  <textarea className="input-field resize-none h-20" placeholder="Additional notes for patient..." value={prescription.doctorNotes} onChange={e => setPrescription(p => ({ ...p, doctorNotes: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Follow-up Date</label>
                  <input type="date" className="input-field" value={prescription.followUpDate} onChange={e => setPrescription(p => ({ ...p, followUpDate: e.target.value }))} />
                </div>
              </div>

              <button onClick={handleSavePrescription} disabled={saving} className="btn-primary w-full py-3">
                {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Save size={16} /> Save Prescription & Complete Consultation</>}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

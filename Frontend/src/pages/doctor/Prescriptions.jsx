import React, { useState, useEffect } from 'react';
import { FileText, Calendar, ChevronDown, ChevronUp, Pill, Search } from 'lucide-react';
import { prescriptionAPI } from '../../services/api';
import toast from 'react-hot-toast';

function PrescriptionCard({ prescription }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="card overflow-hidden hover:shadow-md transition-all duration-200">
      <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-50 border border-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText size={16} className="text-sky-600" />
          </div>
          <div>
            <p className="font-bold text-slate-800">{prescription.patient?.user?.name}</p>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(prescription.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              {prescription.diagnosis && <span className="text-slate-500">· {prescription.diagnosis}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="badge bg-teal-50 text-teal-700 border border-teal-200">{prescription.medicines?.length || 0} medicines</span>
          {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-5 border-t border-slate-100 space-y-3 pt-4">
          {prescription.medicines?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1"><Pill size={11} /> Medicines Prescribed</p>
              <div className="space-y-2">
                {prescription.medicines.map((med, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div><span className="text-xs text-slate-400 block">Medicine</span><span className="font-semibold text-slate-800">{med.name}</span></div>
                    <div><span className="text-xs text-slate-400 block">Dosage</span><span className="text-slate-700">{med.dosage}</span></div>
                    <div><span className="text-xs text-slate-400 block">Frequency</span><span className="text-slate-700">{med.frequency}</span></div>
                    <div><span className="text-xs text-slate-400 block">Duration</span><span className="text-slate-700">{med.duration}</span></div>
                    {med.instructions && <div className="col-span-4"><span className="text-xs text-slate-400">Instructions: </span><span className="text-xs text-slate-600">{med.instructions}</span></div>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {prescription.doctorNotes && (
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
              <p className="text-xs font-bold text-amber-600 mb-1">Doctor Notes</p>
              <p className="text-sm text-slate-700">{prescription.doctorNotes}</p>
            </div>
          )}
          {prescription.followUpDate && (
            <div className="flex items-center gap-2 text-sm bg-sky-50 rounded-xl px-3 py-2 border border-sky-100">
              <Calendar size={13} className="text-sky-500" />
              <span className="text-slate-500">Follow-up:</span>
              <span className="font-semibold text-sky-700">{new Date(prescription.followUpDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchPrescriptions(); }, []);

  const fetchPrescriptions = async () => {
    try { const res = await prescriptionAPI.getDoctorIssued(); setPrescriptions(res.data); }
    catch { toast.error('Failed to load prescriptions'); }
    finally { setLoading(false); }
  };

  const filtered = prescriptions.filter(p =>
    p.patient?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.diagnosis?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 max-w-8xl">
      <div>
        <h1 className="page-title">Prescriptions Issued</h1>
        <p className="text-slate-500 text-sm mt-0.5">{prescriptions.length} total prescriptions</p>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input-field pl-10" placeholder="Search by patient name or diagnosis..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <FileText size={36} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No prescriptions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => <PrescriptionCard key={p._id} prescription={p} />)}
        </div>
      )}
    </div>
  );
}

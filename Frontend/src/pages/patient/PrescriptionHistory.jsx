import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Pill, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { prescriptionAPI } from '../../services/api';
import toast from 'react-hot-toast';

function PrescriptionCard({ prescription }) {
  const [expanded, setExpanded] = useState(false);

  const handleDownload = () => {
    const lines = [
      '==============================',
      '     MediQueue PRESCRIPTION   ',
      '==============================',
      `Patient : ${prescription.patient?.user?.name}`,
      `Doctor  : Dr. ${prescription.doctor?.user?.name}  (${prescription.doctor?.specialization || ''})`,
      `Date    : ${new Date(prescription.issuedAt).toLocaleDateString('en-IN')}`,
      '',
      `DIAGNOSIS: ${prescription.diagnosis || 'N/A'}`,
      '',
      'MEDICINES:',
      ...(prescription.medicines || []).map((m, i) =>
        `  ${i + 1}. ${m.name}  |  ${m.dosage}  |  ${m.frequency}  |  ${m.duration}${m.instructions ? `  (${m.instructions})` : ''}`
      ),
      '',
      `NOTES: ${prescription.doctorNotes || 'None'}`,
      `FOLLOW-UP: ${prescription.followUpDate ? new Date(prescription.followUpDate).toLocaleDateString('en-IN') : 'Not specified'}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `prescription_${new Date(prescription.issuedAt).toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Prescription downloaded');
  };

  return (
    <div className="card overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Header row */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-violet-50 border border-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText size={17} className="text-violet-500" />
          </div>
          <div>
            <p className="font-bold text-slate-800">Dr. {prescription.doctor?.user?.name}</p>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar size={10} />
                {new Date(prescription.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              {prescription.diagnosis && (
                <span className="text-slate-500">· {prescription.diagnosis}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); handleDownload(); }}
            className="p-2 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 border border-transparent hover:border-sky-200 transition-all"
            title="Download"
          >
            <Download size={15} />
          </button>
          <span className="badge bg-teal-50 text-teal-700 border border-teal-200">
            {prescription.medicines?.length || 0} med{prescription.medicines?.length !== 1 ? 's' : ''}
          </span>
          {expanded ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 pb-5 pt-4 space-y-3">
          {/* Medicines table */}
          {prescription.medicines?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Pill size={11} /> Medicines
              </p>
              <div className="space-y-2">
                {prescription.medicines.map((med, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-sm">
                      <div>
                        <span className="text-xs text-slate-400 block">Medicine</span>
                        <span className="font-bold text-slate-800">{med.name}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block">Dosage</span>
                        <span className="font-medium text-slate-700">{med.dosage}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block">Frequency</span>
                        <span className="font-medium text-slate-700">{med.frequency}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block">Duration</span>
                        <span className="font-medium text-slate-700">{med.duration}</span>
                      </div>
                    </div>
                    {med.instructions && (
                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <span className="text-xs text-slate-400">Instructions: </span>
                        <span className="text-xs text-slate-600">{med.instructions}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Doctor notes */}
          {prescription.doctorNotes && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <p className="text-xs font-bold text-amber-600 mb-1">Doctor's Notes</p>
              <p className="text-sm text-slate-700">{prescription.doctorNotes}</p>
            </div>
          )}

          {/* Follow-up */}
          {prescription.followUpDate && (
            <div className="flex items-center gap-2 bg-sky-50 border border-sky-100 rounded-xl px-3 py-2.5">
              <Calendar size={14} className="text-sky-500" />
              <span className="text-sm text-slate-500">Follow-up appointment:</span>
              <span className="text-sm font-bold text-sky-700">
                {new Date(prescription.followUpDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PrescriptionHistory() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => { fetchPrescriptions(); }, []);

  const fetchPrescriptions = async () => {
    try { const res = await prescriptionAPI.getPatientHistory(); setPrescriptions(res.data); }
    catch { toast.error('Failed to load prescription history'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-5 max-w-8xl ">
      <div>
        <h1 className="page-title">Prescription History</h1>
        <p className="text-slate-500 text-sm mt-0.5">{prescriptions.length} prescription{prescriptions.length !== 1 ? 's' : ''} on record</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="card p-16 text-center">
          <FileText size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-600 font-bold mb-1">No prescriptions yet</p>
          <p className="text-slate-400 text-sm">Your prescription history will appear here after consultations</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map(p => <PrescriptionCard key={p._id} prescription={p} />)}
        </div>
      )}
    </div>
  );
}


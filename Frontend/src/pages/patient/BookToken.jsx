// import React, { useState, useEffect } from 'react';
// import { Stethoscope, Clock, IndianRupee, AlertTriangle, CheckCircle, Search, Star, MapPin, ChevronRight } from 'lucide-react';
// import { doctorsAPI, queueAPI } from '../../services/api';
// import { useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';

// export default function BookToken() {
//   const [doctors, setDoctors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selected, setSelected] = useState(null);
//   const [search, setSearch] = useState('');
//   const [form, setForm] = useState({ problemDescription: '', symptoms: '', isEmergency: false });
//   const [booking, setBooking] = useState(false);
//   const [booked, setBooked] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => { fetchDoctors(); }, []);

//   const fetchDoctors = async () => {
//     try { const res = await doctorsAPI.getAll(); setDoctors(res.data); }
//     catch { toast.error('Failed to load doctors'); }
//     finally { setLoading(false); }
//   };

//   const handleBook = async () => {
//     if (!selected) return toast.error('Please select a doctor first');
//     setBooking(true);
//     try {
//       const res = await queueAPI.bookToken({
//         doctorId: selected._id,
//         problemDescription: form.problemDescription,
//         symptoms: form.symptoms.split(',').map(s => s.trim()).filter(Boolean),
//         isEmergency: form.isEmergency,
//       });
//       setBooked(res.data);
//       toast.success(`Token #${res.data.tokenNumber} booked successfully!`);
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to book token');
//     } finally { setBooking(false); }
//   };

//   const filtered = doctors.filter(d =>
//     d.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
//     d.specialization?.toLowerCase().includes(search.toLowerCase())
//   );

//   // ── Success screen ──────────────────────────────────────────────────────────
//   if (booked) {
//     return (
//       <div className="max-w-md mx-auto">
//         <div className="card p-8 text-center border-t-4 border-t-emerald-500">
//           <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
//             <CheckCircle size={36} className="text-emerald-500" />
//           </div>
//           <h2 className="text-2xl font-bold text-slate-900 mb-1">Booking Confirmed!</h2>
//           <p className="text-slate-500 text-sm mb-6">Your appointment has been successfully booked</p>

//           <div className="bg-slate-50 rounded-2xl p-6 mb-6 border border-slate-200">
//             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Token Number</p>
//             <div className="token-display text-center my-2">#{booked.tokenNumber}</div>
//             {booked.isEmergency && (
//               <div className="mt-2">
//                 <span className="badge-emergency">🚨 Emergency Priority</span>
//               </div>
//             )}
//             <div className="mt-4 space-y-2 divide-y divide-slate-200">
//               <div className="flex justify-between py-2 text-sm">
//                 <span className="text-slate-500">Estimated Wait</span>
//                 <span className="font-semibold text-slate-800">{booked.estimatedWaitTime || 0} minutes</span>
//               </div>
//               <div className="flex justify-between py-2 text-sm">
//                 <span className="text-slate-500">Date</span>
//                 <span className="font-semibold text-slate-800">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
//               </div>
//             </div>
//           </div>

//           <div className="flex gap-3">
//             <button onClick={() => navigate('/patient/live-queue')} className="btn-primary flex-1 py-3">
//               Track Live Queue
//             </button>
//             <button
//               onClick={() => { setBooked(null); setSelected(null); setForm({ problemDescription: '', symptoms: '', isEmergency: false }); }}
//               className="btn-secondary flex-1 py-3"
//             >
//               Book Another
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ── Main screen ─────────────────────────────────────────────────────────────
//   return (
//     <div className="space-y-5 max-w-5xl">
//       <div>
//         <h1 className="page-title">Book Appointment</h1>
//         <p className="text-slate-500 text-sm mt-0.5">Choose a doctor and get your queue token</p>
//       </div>

//       {/* Search */}
//       <div className="relative">
//         <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
//         <input
//           className="input-field pl-10"
//           placeholder="Search by doctor name or specialization..."
//           value={search}
//           onChange={e => setSearch(e.target.value)}
//         />
//       </div>

//       {/* Doctor grid */}
//       {loading ? (
//         <div className="flex justify-center py-16">
//           <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {filtered.map(doctor => {
//             const isSelected = selected?._id === doctor._id;
//             const unavailable = !doctor.isAvailableToday;
//             return (
//               <div
//                 key={doctor._id}
//                 onClick={() => unavailable ? null : setSelected(isSelected ? null : doctor)}
//                 className={`card p-5 transition-all duration-200
//                   ${unavailable ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-md hover:-translate-y-0.5'}
//                   ${isSelected ? 'ring-2 ring-sky-500 ring-offset-1 border-sky-300' : ''}
//                 `}
//               >
//                 {/* Doctor header */}
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="flex items-center gap-3">
//                     <div className="w-12 h-12 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center text-xl font-bold text-teal-700">
//                       {doctor.user?.name?.[0]}
//                     </div>
//                     <div>
//                       <p className="font-bold text-slate-800 leading-tight">Dr. {doctor.user?.name}</p>
//                       <p className="text-xs text-teal-600 font-semibold mt-0.5">{doctor.specialization}</p>
//                     </div>
//                   </div>
//                   <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border flex-shrink-0 ${
//                     doctor.isAvailableToday
//                       ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
//                       : 'bg-slate-50 text-slate-500 border-slate-200'
//                   }`}>
//                     <div className={`w-1.5 h-1.5 rounded-full ${doctor.isAvailableToday ? 'bg-emerald-500' : 'bg-slate-400'}`} />
//                     {doctor.isAvailableToday ? 'Available' : 'Unavailable'}
//                   </div>
//                 </div>

//                 {/* Info rows */}
//                 <div className="space-y-1.5 mb-4">
//                   <div className="flex items-center gap-2 text-sm text-slate-500">
//                     <Star size={12} className="text-amber-400 fill-amber-400 flex-shrink-0" />
//                     <span>{doctor.rating || '4.5'} rating · {doctor.experience || 0} yrs experience</span>
//                   </div>
//                   <div className="flex items-center gap-2 text-sm text-slate-500">
//                     <Clock size={12} className="text-slate-400 flex-shrink-0" />
//                     <span>{doctor.availability?.startTime || '09:00'} – {doctor.availability?.endTime || '17:00'}</span>
//                   </div>
//                   {doctor.room && (
//                     <div className="flex items-center gap-2 text-sm text-slate-500">
//                       <MapPin size={12} className="text-slate-400 flex-shrink-0" />
//                       <span>{doctor.room}</span>
//                     </div>
//                   )}
//                 </div>

//                 {/* Fee + selection indicator */}
//                 <div className="flex items-center justify-between pt-3 border-t border-slate-100">
//                   <div className="flex items-center gap-1 text-sky-700 font-bold text-base">
//                     <IndianRupee size={14} />{doctor.fees}
//                   </div>
//                   {isSelected ? (
//                     <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full flex items-center gap-1">
//                       <CheckCircle size={11} /> Selected
//                     </span>
//                   ) : unavailable ? (
//                     <span className="text-xs text-slate-400">Not available</span>
//                   ) : (
//                     <span className="text-xs text-slate-400 flex items-center gap-1">Select <ChevronRight size={11} /></span>
//                   )}
//                 </div>
//               </div>
//             );
//           })}

//           {filtered.length === 0 && (
//             <div className="col-span-3 card p-16 text-center">
//               <Stethoscope size={36} className="text-slate-200 mx-auto mb-3" />
//               <p className="text-slate-400 font-medium">No doctors found</p>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Booking form */}
//       {selected && (
//         <div className="card p-6 border-t-4 border-t-sky-500">
//           <div className="flex items-center gap-3 mb-5">
//             <div className="w-10 h-10 bg-sky-50 border border-sky-100 rounded-xl flex items-center justify-center">
//               <Stethoscope size={18} className="text-sky-600" />
//             </div>
//             <div>
//               <h2 className="font-bold text-slate-900">Book with Dr. {selected.user?.name}</h2>
//               <p className="text-xs text-slate-500">{selected.specialization} · ₹{selected.fees} consultation fee</p>
//             </div>
//           </div>

//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-bold text-slate-700 mb-1.5">Reason for Visit / Chief Complaint</label>
//               <textarea
//                 className="input-field resize-none h-20"
//                 placeholder="Describe your symptoms or reason for visiting..."
//                 value={form.problemDescription}
//                 onChange={e => setForm({ ...form, problemDescription: e.target.value })}
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-bold text-slate-700 mb-1.5">Symptoms <span className="text-slate-400 font-normal">(comma-separated)</span></label>
//               <input
//                 className="input-field"
//                 placeholder="e.g., fever, headache, fatigue"
//                 value={form.symptoms}
//                 onChange={e => setForm({ ...form, symptoms: e.target.value })}
//               />
//             </div>

//             {/* Emergency toggle */}
//             <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.isEmergency ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
//               <input
//                 type="checkbox"
//                 className="hidden"
//                 checked={form.isEmergency}
//                 onChange={e => setForm({ ...form, isEmergency: e.target.checked })}
//               />
//               <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${form.isEmergency ? 'bg-red-500 border-red-500' : 'border-slate-300 bg-white'}`}>
//                 {form.isEmergency && <span className="text-white text-xs font-bold">✓</span>}
//               </div>
//               <div>
//                 <div className="flex items-center gap-2">
//                   <AlertTriangle size={15} className="text-red-500" />
//                   <span className="font-bold text-slate-800 text-sm">This is an emergency</span>
//                 </div>
//                 <p className="text-xs text-slate-500 mt-0.5">Emergency cases are moved to the front of the queue</p>
//               </div>
//             </label>

//             <button
//               onClick={handleBook}
//               disabled={booking}
//               className="btn-primary w-full py-3 text-base"
//             >
//               {booking
//                 ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
//                 : 'Confirm & Get Token'
//               }
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }





import React, { useState, useEffect } from 'react';
import { Stethoscope, Clock, IndianRupee, AlertTriangle, CheckCircle, Search, Star, MapPin, ChevronRight } from 'lucide-react';
import { doctorsAPI, queueAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function BookToken() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ problemDescription: '', symptoms: '', isEmergency: false });
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    try { const res = await doctorsAPI.getAll(); setDoctors(res.data); }
    catch { toast.error('Failed to load doctors'); }
    finally { setLoading(false); }
  };

  const handleBook = async () => {
    if (!selected) return toast.error('Please select a doctor first');
    setBooking(true);
    try {
      const res = await queueAPI.bookToken({
        doctorId: selected._id,
        problemDescription: form.problemDescription,
        symptoms: form.symptoms.split(',').map(s => s.trim()).filter(Boolean),
        isEmergency: form.isEmergency,
      });
      setBooked(res.data);
      toast.success(`Token #${res.data.tokenNumber} booked successfully!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book token');
    } finally { setBooking(false); }
  };

  const filtered = doctors.filter(d =>
    d.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Success screen ──────────────────────────────────────────────────────────
  if (booked) {
    return (
      <div className="max-w-md mx-auto">
        <div className="card p-8 text-center border-t-4 border-t-emerald-500">
          <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={36} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Booking Confirmed!</h2>
          <p className="text-slate-500 text-sm mb-6">Your appointment has been successfully booked</p>

          <div className="bg-slate-50 rounded-2xl p-6 mb-6 border border-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Token Number</p>
            <div className="token-display text-center my-2">#{booked.tokenNumber}</div>
            {booked.isEmergency && (
              <div className="mt-2">
                <span className="badge-emergency">🚨 Emergency Priority</span>
              </div>
            )}
            <div className="mt-4 space-y-2 divide-y divide-slate-200">
              <div className="flex justify-between py-2 text-sm">
                <span className="text-slate-500">Estimated Wait</span>
                <span className="font-semibold text-slate-800">{booked.estimatedWaitTime || 0} minutes</span>
              </div>
              <div className="flex justify-between py-2 text-sm">
                <span className="text-slate-500">Date</span>
                <span className="font-semibold text-slate-800">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => navigate('/patient/live-queue')} className="btn-primary flex-1 py-3">
              Track Live Queue
            </button>
            <button
              onClick={() => { setBooked(null); setSelected(null); setForm({ problemDescription: '', symptoms: '', isEmergency: false }); }}
              className="btn-secondary flex-1 py-3"
            >
              Book Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main screen ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 max-w-8xl">
      <div>
        <h1 className="page-title">Book Appointment</h1>
        <p className="text-slate-500 text-sm mt-0.5">Choose a doctor and get your queue token</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input-field pl-10"
          placeholder="Search by doctor name or specialization..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Doctor grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(doctor => {
            const isSelected = selected?._id === doctor._id;
            const unavailable = !doctor.isAvailableToday;
            return (
              <div
                key={doctor._id}
                onClick={() => unavailable ? null : setSelected(isSelected ? null : doctor)}
                className={`card p-5 transition-all duration-200
                  ${unavailable ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-md hover:-translate-y-0.5'}
                  ${isSelected ? 'ring-2 ring-sky-500 ring-offset-1 border-sky-300' : ''}
                `}
              >
                {/* Doctor header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center text-xl font-bold text-teal-700">
                      {doctor.user?.name?.[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 leading-tight">Dr. {doctor.user?.name}</p>
                      <p className="text-xs text-teal-600 font-semibold mt-0.5">{doctor.specialization}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border flex-shrink-0 ${
                    doctor.isAvailableToday
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${doctor.isAvailableToday ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {doctor.isAvailableToday ? 'Available' : 'Unavailable'}
                  </div>
                </div>

                {/* Info rows */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Star size={12} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                    <span>{doctor.rating || '4.5'} rating · {doctor.experience || 0} yrs experience</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock size={12} className="text-slate-400 flex-shrink-0" />
                    <span>{doctor.availability?.startTime || '09:00'} – {doctor.availability?.endTime || '17:00'}</span>
                  </div>
                  {doctor.room && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                      <span>{doctor.room}</span>
                    </div>
                  )}
                </div>

                {/* Fee + selection indicator */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-sky-700 font-bold text-base">
                    <IndianRupee size={14} />{doctor.fees}
                  </div>
                  {isSelected ? (
                    <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle size={11} /> Selected
                    </span>
                  ) : unavailable ? (
                    <span className="text-xs text-slate-400">Not available</span>
                  ) : (
                    <span className="text-xs text-slate-400 flex items-center gap-1">Select <ChevronRight size={11} /></span>
                  )}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-3 card p-16 text-center">
              <Stethoscope size={36} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No doctors found</p>
            </div>
          )}
        </div>
      )}

      {/* Booking form */}
      {selected && (
        <div className="card p-6 border-t-4 border-t-sky-500">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-sky-50 border border-sky-100 rounded-xl flex items-center justify-center">
              <Stethoscope size={18} className="text-sky-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Book with Dr. {selected.user?.name}</h2>
              <p className="text-xs text-slate-500">{selected.specialization} · ₹{selected.fees} consultation fee</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Reason for Visit / Chief Complaint</label>
              <textarea
                className="input-field resize-none h-20"
                placeholder="Describe your symptoms or reason for visiting..."
                value={form.problemDescription}
                onChange={e => setForm({ ...form, problemDescription: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Symptoms <span className="text-slate-400 font-normal">(comma-separated)</span></label>
              <input
                className="input-field"
                placeholder="e.g., fever, headache, fatigue"
                value={form.symptoms}
                onChange={e => setForm({ ...form, symptoms: e.target.value })}
              />
            </div>

            {/* Emergency toggle */}
            <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.isEmergency ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
              <input
                type="checkbox"
                className="hidden"
                checked={form.isEmergency}
                onChange={e => setForm({ ...form, isEmergency: e.target.checked })}
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${form.isEmergency ? 'bg-red-500 border-red-500' : 'border-slate-300 bg-white'}`}>
                {form.isEmergency && <span className="text-white text-xs font-bold">✓</span>}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={15} className="text-red-500" />
                  <span className="font-bold text-slate-800 text-sm">This is an emergency</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Emergency cases are moved to the front of the queue</p>
              </div>
            </label>

            <button
              onClick={handleBook}
              disabled={booking}
              className="btn-primary w-full py-3 text-base"
            >
              {booking
                ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : 'Confirm & Get Token'
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

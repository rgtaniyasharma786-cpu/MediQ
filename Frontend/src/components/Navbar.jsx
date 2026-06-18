// // import React from 'react';
// // import { Menu, X, Stethoscope } from 'lucide-react';
// // import { useAuth } from '../context/AuthContext';
// // import NotificationBell from './NotificationBell';
// // import ProfileDropdown from './ProfileDropdown';

// // export default function Navbar({ sidebarOpen, setSidebarOpen }) {
// //   const { user } = useAuth();

// //   const roleConfig = {
// //     admin: { label: 'Admin', color: 'bg-violet-100 text-violet-700 border-violet-200' },
// //     doctor: { label: 'Doctor', color: 'bg-teal-100 text-teal-700 border-teal-200' },
// //     patient: { label: 'Patient', color: 'bg-sky-100 text-sky-700 border-sky-200' },
// //   };
// //   const role = roleConfig[user?.role] || roleConfig.patient;

// //   return (
// //     <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-slate-200" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
// //       <div className="flex items-center justify-between h-full px-4 max-w-screen-2xl mx-auto">
// //         {/* Left */}
// //         <div className="flex items-center gap-3">
// //           <button
// //             onClick={() => setSidebarOpen(!sidebarOpen)}
// //             className="p-2 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-all"
// //           >
// //             {sidebarOpen ? <X size={19} /> : <Menu size={19} />}
// //           </button>
// //           <div className="flex items-center gap-2.5">
// //             <div className="w-8 h-8 rounded-lg flex items-center justify-center gradient-header">
// //               <Stethoscope size={16} className="text-white" />
// //             </div>
// //             <div className="hidden sm:block">
// //               <span className="font-bold text-slate-900 text-base tracking-tight">Medi</span>
// //               <span className="font-bold text-sky-600 text-base tracking-tight">Queue</span>
// //             </div>
// //           </div>
// //         </div>

// //         {/* Right */}
// //         <div className="flex items-center gap-2">
// //           <span className={`hidden sm:inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${role.color}`}>
// //             {role.label}
// //           </span>
// //           <NotificationBell />
// //           <ProfileDropdown />
// //         </div>
// //       </div>
// //     </header>
// //   );
// // }







// import React from 'react';
// import { Menu } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';
// import NotificationBell from './NotificationBell';
// import ProfileDropdown from './ProfileDropdown';

// export default function Navbar({ onMenuClick }) {
//   const { user } = useAuth();

//   const roleConfig = {
//     admin:   { label: 'Admin',   color: 'bg-violet-100 text-violet-700 border-violet-200' },
//     doctor:  { label: 'Doctor',  color: 'bg-teal-100   text-teal-700   border-teal-200'   },
//     patient: { label: 'Patient', color: 'bg-sky-100    text-sky-700    border-sky-200'    },
//   };
//   const role = roleConfig[user?.role] || roleConfig.patient;

//   return (
//     <header
//       className="fixed top-0 left-0 right-0 z-30 h-16 bg-white border-b border-slate-200"
//       style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.06)' }}
//     >
//       <div className="flex items-center justify-between h-full px-4">

//         {/* Left: hamburger (mobile) + spacer for sidebar width (desktop) */}
//         <div className="flex items-center">
//           {/* Hamburger — visible on mobile only */}
//           <button
//             onClick={onMenuClick}
//             className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-all mr-2"
//           >
//             <Menu size={20} />
//           </button>
//           {/* On desktop, this 256px spacer aligns content with the sidebar */}
//           <div className="hidden lg:block w-64" />
//         </div>

//         {/* Right: role badge + notifications + profile */}
//         <div className="flex items-center gap-2">
//           <span className={`hidden sm:inline-flex items-center text-xs font-semibold
//                             px-2.5 py-1 rounded-full border ${role.color}`}>
//             {role.label}
//           </span>
//           <NotificationBell />
//           <ProfileDropdown />
//         </div>

//       </div>
//     </header>
//   );
// }





import React from 'react';
import { Menu, X, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import ProfileDropdown from './ProfileDropdown';

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const { user } = useAuth();

  const roleConfig = {
    admin:   { label: 'Admin',   color: 'bg-violet-100 text-violet-700 border-violet-200' },
    doctor:  { label: 'Doctor',  color: 'bg-teal-100   text-teal-700   border-teal-200'   },
    patient: { label: 'Patient', color: 'bg-sky-100    text-sky-700    border-sky-200'    },
  };
  const role = roleConfig[user?.role] || roleConfig.patient;

  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-16 bg-white border-b border-slate-200"
      style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.06)' }}>
      <div className="flex items-center justify-between h-full px-4">

        {/* Left: hamburger + logo when collapsed */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-all"
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <span className={`hidden sm:inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${role.color}`}>
            {role.label}
          </span>
          <NotificationBell />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}
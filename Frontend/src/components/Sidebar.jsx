// import React from 'react';
// import { NavLink, useNavigate } from 'react-router-dom';
// import {
//   LayoutDashboard, Users, BarChart3, CalendarClock,
//   UserCircle, ClipboardList, FileText, Stethoscope,
//   HeartPulse, User, LogOut, ShieldCheck, Eye,
//   Activity, Settings, AlertTriangle, X
// } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';

// const adminLinks = [
//   { to: '/admin',               label: 'Dashboard',        icon: LayoutDashboard },
//   { to: '/admin/doctors',       label: 'Manage Doctors',   icon: Stethoscope     },
//   { to: '/admin/queue-monitor', label: 'Queue Monitor',    icon: Eye             },
//   { to: '/admin/emergency',     label: 'Emergency Control',icon: AlertTriangle   },
//   { to: '/admin/analytics',     label: 'Analytics',        icon: BarChart3       },
//   { to: '/admin/users',         label: 'User Management',  icon: Users           },
//   { to: '/admin/settings',      label: 'System Settings',  icon: Settings        },
// ];

// const doctorLinks = [
//   { to: '/doctor',               label: 'Dashboard',      icon: LayoutDashboard },
//   { to: '/doctor/queue',         label: "Today's Queue",  icon: CalendarClock   },
//   { to: '/doctor/patients',      label: 'Patient Details',icon: UserCircle      },
//   { to: '/doctor/prescriptions', label: 'Prescriptions',  icon: FileText        },
// ];

// const patientLinks = [
//   { to: '/patient',               label: 'Dashboard',     icon: LayoutDashboard },
//   { to: '/patient/book',          label: 'Book Token',    icon: CalendarClock   },
//   { to: '/patient/live-queue',    label: 'Live Queue',    icon: Activity        },
//   { to: '/patient/prescriptions', label: 'Prescriptions', icon: ClipboardList   },
//   { to: '/patient/profile',       label: 'My Profile',    icon: User            },
// ];

// const roleConfig = {
//   admin:   { icon: ShieldCheck, color: 'text-violet-600 bg-violet-50 border-violet-100', label: 'Administrator' },
//   doctor:  { icon: HeartPulse,  color: 'text-teal-600   bg-teal-50   border-teal-100',   label: 'Physician'     },
//   patient: { icon: User,        color: 'text-sky-600    bg-sky-50    border-sky-100',    label: 'Patient'       },
// };

// export default function Sidebar({ open, setSidebarOpen }) {
//   const { user, logout } = useAuth();
//   const navigate         = useNavigate();

//   const links    = user?.role === 'admin'  ? adminLinks
//                  : user?.role === 'doctor' ? doctorLinks
//                  : patientLinks;
//   const rc       = roleConfig[user?.role] || roleConfig.patient;
//   const RoleIcon = rc.icon;

//   const handleLogout = () => { logout(); navigate('/login'); };

//   // Close sidebar on mobile when a link is clicked
//   const handleLinkClick = () => {
//     if (window.innerWidth < 1024) setSidebarOpen(false);
//   };

//   return (
//     <>
//       {/* Mobile backdrop */}
//       {open && (
//         <div
//           className="fixed inset-0 bg-slate-900/30 z-20 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       <aside
//         className={`
//           fixed top-0 left-0 bottom-0 z-40 bg-white border-r border-slate-200
//           flex flex-col transition-all duration-300 ease-in-out overflow-hidden
//           ${open ? 'w-64' : 'w-0 lg:w-[68px]'}
//         `}
//         style={{ boxShadow: '2px 0 8px rgba(15,23,42,0.06)' }}
//       >
//         {/* ── Logo header ── */}
//         <div className={`flex items-center h-16 border-b border-slate-100 flex-shrink-0 px-4 ${!open && 'lg:justify-center'}`}>
//           {open ? (
//             <div className="flex items-center justify-between w-full">
//               <div className="flex items-center gap-2.5">
//                 <div className="w-8 h-8 rounded-lg flex items-center justify-center gradient-header flex-shrink-0">
//                   <Stethoscope size={16} className="text-white" />
//                 </div>
//                 <span className="font-bold text-slate-900">Medi<span className="text-sky-600">Queue</span></span>
//               </div>
//             </div>
//           ) : (
//             <div className="hidden lg:flex w-8 h-8 rounded-lg items-center justify-center gradient-header">
//               <Stethoscope size={16} className="text-white" />
//             </div>
//           )}
//         </div>

//         {/* ── Role badge ── */}
//         <div className={`px-3 py-3 border-b border-slate-100 flex-shrink-0 ${!open && 'lg:flex lg:justify-center'}`}>
//           {open ? (
//             <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${rc.color}`}>
//               <RoleIcon size={16} className="flex-shrink-0" />
//               <div className="min-w-0">
//                 <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 leading-none">Role</p>
//                 <p className="text-sm font-bold leading-tight mt-0.5 truncate">{rc.label}</p>
//               </div>
//             </div>
//           ) : (
//             <div className={`hidden lg:flex w-9 h-9 rounded-xl border items-center justify-center ${rc.color}`}>
//               <RoleIcon size={16} />
//             </div>
//           )}
//         </div>

//         {/* ── Navigation ── */}
//         <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">
//           {links.map(({ to, label, icon: Icon }) => (
//             <NavLink
//               key={to}
//               to={to}
//               end={to === '/admin' || to === '/doctor' || to === '/patient'}
//               onClick={handleLinkClick}
//               title={!open ? label : undefined}
//               className={({ isActive }) =>
//                 `${isActive ? 'nav-link-active' : 'nav-link'}
//                  ${!open ? 'lg:justify-center lg:px-2' : ''}`
//               }
//             >
//               <Icon size={17} className="flex-shrink-0" />
//               {open && <span className="truncate">{label}</span>}
//             </NavLink>
//           ))}
//         </nav>

//         {/* ── User info + logout ── */}
//         <div className="flex-shrink-0 border-t border-slate-100 p-2.5 space-y-1">
//           {open && (
//             <div className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
//               <p className="text-xs font-bold text-slate-700 truncate">{user?.name}</p>
//               <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email}</p>
//             </div>
//           )}
//           <button
//             onClick={handleLogout}
//             title={!open ? 'Logout' : undefined}
//             className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
//                         text-red-500 hover:text-red-700 hover:bg-red-50
//                         font-semibold text-sm transition-all
//                         ${!open ? 'lg:justify-center lg:px-2' : ''}`}
//           >
//             <LogOut size={17} className="flex-shrink-0" />
//             {open && <span>Logout</span>}
//           </button>
//         </div>
//       </aside>
//     </>
//   );
// }




import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BarChart3, CalendarClock,
  UserCircle, ClipboardList, FileText, Stethoscope,
  HeartPulse, User, LogOut, ShieldCheck, Eye,
  Activity, Settings, AlertTriangle, ChevronLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const adminLinks = [
  { to: '/admin',               label: 'Dashboard',        icon: LayoutDashboard },
  { to: '/admin/doctors',       label: 'Manage Doctors',   icon: Stethoscope     },
  { to: '/admin/queue-monitor', label: 'Queue Monitor',    icon: Eye             },
  { to: '/admin/emergency',     label: 'Emergency Control',icon: AlertTriangle   },
  { to: '/admin/analytics',     label: 'Analytics',        icon: BarChart3       },
  { to: '/admin/users',         label: 'User Management',  icon: Users           },
  { to: '/admin/settings',      label: 'System Settings',  icon: Settings        },
];

const doctorLinks = [
  { to: '/doctor',               label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/doctor/queue',         label: "Today's Queue",  icon: CalendarClock   },
  { to: '/doctor/patients',      label: 'Patient Details',icon: UserCircle      },
  { to: '/doctor/prescriptions', label: 'Prescriptions',  icon: FileText        },
];

const patientLinks = [
  { to: '/patient',               label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/patient/book',          label: 'Book Token',    icon: CalendarClock   },
  { to: '/patient/live-queue',    label: 'Live Queue',    icon: Activity        },
  { to: '/patient/prescriptions', label: 'Prescriptions', icon: ClipboardList   },
  { to: '/patient/profile',       label: 'My Profile',    icon: User            },
];

const roleConfig = {
  admin:   { icon: ShieldCheck, color: 'text-violet-600 bg-violet-50 border-violet-100', label: 'Administrator' },
  doctor:  { icon: HeartPulse,  color: 'text-teal-600   bg-teal-50   border-teal-100',   label: 'Physician'     },
  patient: { icon: User,        color: 'text-sky-600    bg-sky-50    border-sky-100',    label: 'Patient'       },
};

export default function Sidebar({ open, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const links    = user?.role === 'admin'  ? adminLinks
                 : user?.role === 'doctor' ? doctorLinks
                 : patientLinks;
  const rc       = roleConfig[user?.role] || roleConfig.patient;
  const RoleIcon = rc.icon;

  const handleLogout    = () => { logout(); navigate('/login'); };
  const handleLinkClick = () => { if (window.innerWidth < 1024) setSidebarOpen(false); };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-40 bg-white border-r border-slate-200
          flex flex-col transition-all duration-300 ease-in-out overflow-hidden
          ${open ? 'w-64' : 'w-0 lg:w-[68px]'}
        `}
        style={{ boxShadow: '2px 0 8px rgba(15,23,42,0.06)' }}
      >
        {/* ── Logo header ── */}
        <div className={`
          flex items-center h-16 border-b border-slate-100 flex-shrink-0 px-4
          ${!open ? 'lg:justify-center lg:px-0' : ''}
        `}>
          {open ? (
            <div className="flex items-center justify-between w-full">
              {/* Logo */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center gradient-header flex-shrink-0">
                  <Stethoscope size={16} className="text-white" />
                </div>
                <span className="font-bold text-slate-900">
                  Medi<span className="text-sky-600">Queue</span>
                </span>
              </div>

              {/* ── Collapse button (desktop only, visible when open) ── */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg
                           border border-slate-200 text-slate-400
                           hover:text-slate-700 hover:bg-slate-100
                           transition-all flex-shrink-0"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft size={15} />
              </button>
            </div>
          ) : (
            // ── Expand button (desktop only, visible when collapsed) ──
            <button
              onClick={() => setSidebarOpen(true)}
              className="hidden lg:flex w-8 h-8 rounded-lg items-center justify-center
                         gradient-header hover:opacity-80 transition-opacity"
              aria-label="Expand sidebar"
            >
              <Stethoscope size={16} className="text-white" />
            </button>
          )}
        </div>

        {/* ── Role badge ── */}
        <div className={`px-3 py-3 border-b border-slate-100 flex-shrink-0 ${!open && 'lg:flex lg:justify-center'}`}>
          {open ? (
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${rc.color}`}>
              <RoleIcon size={16} className="flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 leading-none">Role</p>
                <p className="text-sm font-bold leading-tight mt-0.5 truncate">{rc.label}</p>
              </div>
            </div>
          ) : (
            <div className={`hidden lg:flex w-9 h-9 rounded-xl border items-center justify-center ${rc.color}`}
                 title={rc.label}>
              <RoleIcon size={16} />
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin' || to === '/doctor' || to === '/patient'}
              onClick={handleLinkClick}
              title={!open ? label : undefined}
              className={({ isActive }) =>
                `${isActive ? 'nav-link-active' : 'nav-link'}
                 ${!open ? 'lg:justify-center lg:px-2' : ''}`
              }
            >
              <Icon size={17} className="flex-shrink-0" />
              {open && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* ── User info + logout ── */}
        <div className="flex-shrink-0 border-t border-slate-100 p-2.5 space-y-1">
          {open && (
            <div className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold text-slate-700 truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={!open ? 'Logout' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                        text-red-500 hover:text-red-700 hover:bg-red-50
                        font-semibold text-sm transition-all
                        ${!open ? 'lg:justify-center lg:px-2' : ''}`}
          >
            <LogOut size={17} className="flex-shrink-0" />
            {open && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import AdminLayout        from './components/layouts/AdminLayout';
import DoctorLayout       from './components/layouts/DoctorLayout';
import PatientLayout      from './components/layouts/PatientLayout';

// Auth pages
import Login    from './pages/Login';
import Register from './pages/Register';

// Admin pages
import AdminDashboard   from './pages/admin/Dashboard';
import ManageDoctors    from './pages/admin/ManageDoctors';
import QueueMonitoring  from './pages/admin/QueueMonitoring';
import Analytics        from './pages/admin/Analytics';
import UserManagement   from './pages/admin/Users';
import SystemSettings   from './pages/admin/Settings';
import EmergencyControl from './pages/admin/EmergencyControl';

// Doctor pages
import DoctorDashboard     from './pages/doctor/Dashboard';
import TodayQueue          from './pages/doctor/TodayQueue';
import PatientDetails      from './pages/doctor/PatientDetails';
import DoctorPrescriptions from './pages/doctor/Prescriptions';

// Patient pages
import PatientDashboard    from './pages/patient/Dashboard';
import BookToken           from './pages/patient/BookToken';
import LiveQueue           from './pages/patient/LiveQueue';
import PrescriptionHistory from './pages/patient/PrescriptionHistory';
import PatientProfile      from './pages/patient/Profile';

// ─────────────────────────────────────────────────────────────────────────────
// Shared loading spinner
// ─────────────────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm font-medium">Loading MediQueue…</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProtectedRoute — must be logged in + correct role
// ─────────────────────────────────────────────────────────────────────────────
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  // Not logged in → go to login
  if (!user) return <Navigate to="/login" replace />;
  // Wrong role → go to their own dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  return children;
}

// ─────────────────────────────────────────────────────────────────────────────
// PublicRoute — only for guests (login / register)
// If already logged in → redirect to their dashboard
// ─────────────────────────────────────────────────────────────────────────────
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-50" />;
  if (user) return <Navigate to={`/${user.role}`} replace />;
  return children;
}

// ─────────────────────────────────────────────────────────────────────────────
// 404 page
// ─────────────────────────────────────────────────────────────────────────────
function NotFound() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-center p-4">
      <div>
        <div className="text-9xl font-bold text-slate-200 font-mono mb-4">404</div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Page Not Found</h1>
        <p className="text-slate-500 mb-6">The page you're looking for doesn't exist.</p>
        <a
          href={user ? `/${user.role}` : '/login'}
          className="btn-primary inline-flex"
        >
          {user ? 'Go to Dashboard' : 'Go to Login'}
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// All routes
// ─────────────────────────────────────────────────────────────────────────────
function AppRoutes() {
  const { user, loading } = useAuth();

  // While checking auth state — show spinner
  if (loading) return <Spinner />;

  return (
    <Routes>
      {/*
        ROOT ( / )
        ─────────────────────────────────────────────────────────────────
        • Not logged in  → /login   (Login is the default entry point)
        • Logged in      → /role dashboard
      */}
      <Route
        path="/"
        element={
          user
            ? <Navigate to={`/${user.role}`} replace />
            : <Navigate to="/login" replace />
        }
      />

      {/* ── Public auth routes (guests only) ─────────────────────────── */}
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* ── Admin panel ──────────────────────────────────────────────── */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index              element={<AdminDashboard />} />
        <Route path="doctors"     element={<ManageDoctors />} />
        <Route path="queue-monitor" element={<QueueMonitoring />} />
        <Route path="emergency"   element={<EmergencyControl />} />
        <Route path="analytics"   element={<Analytics />} />
        <Route path="users"       element={<UserManagement />} />
        <Route path="settings"    element={<SystemSettings />} />
      </Route>

      {/* ── Doctor panel ─────────────────────────────────────────────── */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorLayout />
          </ProtectedRoute>
        }
      >
        <Route index                    element={<DoctorDashboard />} />
        <Route path="queue"             element={<TodayQueue />} />
        <Route path="patients"          element={<TodayQueue />} />
        <Route path="patients/:tokenId" element={<PatientDetails />} />
        <Route path="prescriptions"     element={<DoctorPrescriptions />} />
      </Route>

      {/* ── Patient panel ────────────────────────────────────────────── */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientLayout />
          </ProtectedRoute>
        }
      >
        <Route index                element={<PatientDashboard />} />
        <Route path="book"          element={<BookToken />} />
        <Route path="live-queue"    element={<LiveQueue />} />
        <Route path="prescriptions" element={<PrescriptionHistory />} />
        <Route path="profile"       element={<PatientProfile />} />
      </Route>

      {/* ── Catch-all 404 ────────────────────────────────────────────── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// App root
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 500,
              boxShadow: '0 10px 25px rgba(15,23,42,0.10)',
            },
            success: { iconTheme: { primary: '#059669', secondary: '#ffffff' } },
            error:   { iconTheme: { primary: '#dc2626', secondary: '#ffffff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

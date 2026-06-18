<!-- # React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project. -->




# 🏥 MediQueue — Doctor Queue Management System

A full-stack MERN application for managing doctor queues with real-time updates via Socket.io.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Real-time | Socket.io |
| Charts | Recharts |
| Notifications | react-hot-toast |

---

## 📁 Project Structure

```
doctor-queue/
├── backend/
│   ├── models/          # Mongoose schemas
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   ├── Patient.js
│   │   ├── Queue.js
│   │   ├── Prescription.js
│   │   └── Notification.js
│   ├── routes/          # Express API routes
│   │   ├── auth.js
│   │   ├── doctors.js
│   │   ├── patients.js
│   │   ├── queue.js
│   │   ├── prescriptions.js
│   │   ├── admin.js
│   │   └── analytics.js
│   ├── middleware/
│   │   └── auth.js      # JWT protect + role restrict
│   ├── socket/
│   │   └── socketHandler.js
│   ├── server.js        # Entry point
│   └── seed.js          # Demo data seeder
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Sidebar.jsx
        │   ├── NotificationBell.jsx
        │   ├── ProfileDropdown.jsx
        │   └── layouts/
        │       ├── AdminLayout.jsx
        │       ├── DoctorLayout.jsx
        │       └── PatientLayout.jsx
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── admin/
        │   │   ├── Dashboard.jsx
        │   │   ├── ManageDoctors.jsx
        │   │   ├── QueueMonitoring.jsx
        │   │   ├── Analytics.jsx
        │   │   └── Users.jsx
        │   ├── doctor/
        │   │   ├── Dashboard.jsx
        │   │   ├── TodayQueue.jsx
        │   │   ├── PatientDetails.jsx
        │   │   └── Prescriptions.jsx
        │   └── patient/
        │       ├── Dashboard.jsx
        │       ├── BookToken.jsx
        │       ├── LiveQueue.jsx
        │       ├── PrescriptionHistory.jsx
        │       └── Profile.jsx
        ├── services/
        │   ├── api.js       # Axios instance + all API calls
        │   └── socket.js    # Socket.io client
        ├── context/
        │   └── AuthContext.jsx
        └── App.jsx          # Routes
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### Step 1 — Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2 — Environment

```bash
# Copy and configure backend env
cd backend
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/doctor-queue
JWT_SECRET=your_super_secret_key_change_this
CLIENT_URL=http://localhost:5173
```

### Step 3 — Run the backend (admin auto-created on first start)

```bash
cd backend
npm run dev
```

On first startup the server **automatically creates the default admin account**:

| Field    | Default value              |
|----------|---------------------------|
| Email    | admin@mediqueue.com        |
| Password | Admin@123                  |

> ⚠️ Change these in your `.env` file before going to production.

### Step 4 — (Optional) Seed sample doctors & patient

```bash
cd backend
node seed.js
```

This adds 5 sample doctors and 1 test patient.
**The admin account is NOT touched by the seed script** — it is always created automatically by the server.

### Step 5 — Run the frontend

```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

---

## 👤 User Flow

| Role    | How account is created                          | Login |
|---------|-------------------------------------------------|-------|
| Admin   | **Auto-created** by server on first startup     | `/login` |
| Doctor  | **Created by Admin** via Manage Doctors panel   | `/login` |
| Patient | **Self-registers** at `/register`               | `/login` after registration |

> Patients register themselves → redirected to `/login` → must sign in manually.
> Doctors **cannot** self-register. Only the admin can add doctor accounts.

---

## ✨ Features

### 👤 Admin Panel
- **Dashboard** — System stats: total doctors, patients, today's tokens, completions, emergencies
- **Manage Doctors** — Full CRUD: add, edit, delete doctors with specialization, fees, availability, room
- **Queue Monitoring** — Real-time view of all doctor queues, per-doctor stats, progress bars, reset queue
- **Analytics** — Area charts (patients/day), pie chart (status distribution), bar chart (by specialization), KPI cards
- **User Management** — View all users, activate/deactivate accounts

### 🩺 Doctor Panel
- **Dashboard** — Current token display, queue stats, call-next button with socket broadcast
- **Today's Queue** — Patient list sorted by token (emergency first), filter by status, mark emergency, complete/cancel
- **Patient Details** — Full patient info, medical history, write and save prescriptions with medicines
- **Prescriptions** — All issued prescriptions with expandable details

### 🧑‍🤝‍🧑 Patient Panel
- **Dashboard** — Quick actions, today's appointments, recent prescriptions
- **Book Token** — Browse doctors by specialization/availability, problem description, emergency flag
- **Live Queue (Real-time 🔥)** — Socket.io powered queue view, position tracking, now-serving indicator, turn alert
- **Prescription History** — Downloadable prescriptions with full medicine details
- **Profile** — Edit personal info, emergency contact, allergies

---

## 🔌 API Reference

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/profile
```

### Queue
```
POST   /api/queue/book              # Book token
GET    /api/queue/doctor/:id        # Get doctor's queue
GET    /api/queue/current/:id       # Currently serving
POST   /api/queue/next/:id          # Call next patient
PATCH  /api/queue/:id/status        # Update status
PATCH  /api/queue/:id/emergency     # Mark emergency
GET    /api/queue/patient/today     # My today's tokens
GET    /api/queue/patient/history   # My history
DELETE /api/queue/:id               # Cancel token
POST   /api/queue/reset/:doctorId   # Admin: reset queue
```

### Doctors
```
GET    /api/doctors                 # All doctors
GET    /api/doctors/:id             # Single doctor
GET    /api/doctors/profile/me      # My doctor profile
PUT    /api/doctors/profile/update  # Update profile
PATCH  /api/doctors/availability    # Toggle availability
```

### Admin
```
GET    /api/admin/dashboard         # Stats summary
GET    /api/admin/users             # All users
PATCH  /api/admin/users/:id/toggle  # Toggle active
POST   /api/admin/doctors           # Create doctor
PUT    /api/admin/doctors/:id       # Update doctor
DELETE /api/admin/doctors/:id       # Delete doctor
GET    /api/admin/queue-monitor     # All queues monitor
```

### Analytics
```
GET    /api/analytics/patients-per-day
GET    /api/analytics/avg-wait-time
GET    /api/analytics/status-distribution
GET    /api/analytics/by-specialization
```

---

## 🔴 Socket.io Events

### Client → Server
| Event | Payload | Description |
|---|---|---|
| `joinDoctorRoom` | doctorId | Doctor joins their room |
| `joinQueueRoom` | {doctorId, date} | Join queue room for live updates |
| `joinPatientRoom` | patientId | Patient listens for their turn |
| `joinAdminRoom` | — | Admin monitors all queues |

### Server → Client
| Event | Payload | Description |
|---|---|---|
| `newPatient` | queue entry | New patient booked |
| `tokenCalled` | queue entry | Doctor called next patient |
| `statusUpdated` | queue entry | Token status changed |
| `tokenCancelled` | tokenId | Token was cancelled |
| `queueUpdated` | queue entry | General queue update |
| `yourTurn` | queue entry | Sent to specific patient |
| `emergencyAlert` | queue entry | Emergency patient alert |
| `queueEmpty` | — | No more patients |

---

## 🎨 Design System

- **Color palette:** Dark slate (`#0a0f1e`) + Teal accent (`#14b8a6`)
- **Typography:** DM Sans (UI) + JetBrains Mono (token numbers)
- **Theme:** Clinical dark — professional medical aesthetic
- **Components:** `glass-card`, `btn-primary`, `btn-secondary`, `badge-*`, `input-field`
- **Animations:** Fade-in, slide-in, emergency pulse, live indicator pulse

---

## 🔐 Security

- JWT tokens stored in localStorage with 7-day expiry
- Bcrypt password hashing (12 rounds)
- Role-based route protection (admin/doctor/patient)
- API middleware enforces role restrictions on every protected endpoint
- Auto-logout on 401 responses

---

## 📱 Responsive Design

- Collapsible sidebar (icon-only on desktop when collapsed, full overlay on mobile)
- Responsive grid layouts that stack on smaller screens
- Mobile-optimized touch targets

---

## 🚧 Production Checklist

- [ ] Change `JWT_SECRET` to a strong random key
- [ ] Set `MONGO_URI` to MongoDB Atlas connection string
- [ ] Set `CLIENT_URL` to your deployed frontend domain
- [ ] Enable HTTPS
- [ ] Add rate limiting (`express-rate-limit`)
- [ ] Configure CORS for production domain only
- [ ] Implement actual PDF generation for prescriptions
- [ ] Add SMS/WhatsApp integration (Twilio/MSG91)
- [ ] Add file upload for profile pictures (AWS S3/Cloudinary)
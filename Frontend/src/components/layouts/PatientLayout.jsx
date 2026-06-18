import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';

export default function PatientLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className={`pt-16 min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-[68px]'}`}>
        <div className="p-6 page-enter"><Outlet /></div>
      </main>
    </div>
  );
}
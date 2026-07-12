import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-surface-base">
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 ml-[260px] transition-all duration-300">
        {/* Top bar */}
        <header className="sticky top-0 z-40 h-16 flex items-center justify-between px-8 glass">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Welcome back, <span className="text-eco-green">{user?.name || 'User'}</span>
            </h2>
            <p className="text-xs text-text-muted">EcoSphere ESG Management Platform</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-xl hover:bg-white/5 transition-all text-text-secondary hover:text-text-primary">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-eco-rose rounded-full"></span>
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-eco-green to-eco-blue flex items-center justify-center text-sm font-bold text-white">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

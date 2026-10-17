import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  IconDashboard,
  IconFolder,
  IconFileText,
  IconFiles,
  IconLogout,
} from '@tabler/icons-react';
import { Button } from '../ui';
import { useAuthStore } from '../../store/authStore';

const ClientLayout = () => {
  const { user, currentBusiness, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Overview', path: '/client/dashboard', icon: IconDashboard },
    { label: 'My Projects', path: '/client/projects', icon: IconFolder },
    { label: 'Invoices', path: '/client/invoices', icon: IconFileText },
    { label: 'Documents', path: '/client/files', icon: IconFiles },
  ];

  return (
    <div className="min-h-screen bg-[var(--surface-primary)] text-[var(--text-primary)] flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[var(--surface-primary)] border-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Logo & Context */}
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm tracking-tight text-[var(--text-primary)]">
              {currentBusiness?.name || 'Bizora'}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider bg-[var(--surface-secondary)] text-[var(--text-muted)]">
              Client Portal
            </span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      isActive
                        ? 'bg-[var(--surface-secondary)] text-[#2563EB] font-semibold'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 stroke-[1.75]" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User profile & logout */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-[var(--text-primary)] leading-none">
                {user?.fullName || user?.name || user?.email}
              </p>
              <span className="text-[10px] text-[var(--text-muted)]">Authorized Client</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-xs text-[var(--text-muted)] hover:text-rose-500"
              title="Sign Out"
            >
              <IconLogout className="w-4 h-4 stroke-[1.75] mr-1" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around px-2 py-1.5 bg-[var(--surface-secondary)]">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${
                    isActive ? 'text-[#2563EB] font-semibold' : 'text-[var(--text-muted)]'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[var(--text-muted)]">
        Bizora Secure Client Session
      </footer>
    </div>
  );
};

export default ClientLayout;

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileSidebar from './MobileSidebar';

/**
 * AppShell — Main authenticated B2B workspace layout.
 * Monochrome minimal: Sidebar + MobileSidebar + Topbar + Page content.
 * NO container borders, NO aurora backgrounds, NO decorative glass.
 */
const AppShell = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--surface-primary)]">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar drawer */}
      <MobileSidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 min-h-full max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;

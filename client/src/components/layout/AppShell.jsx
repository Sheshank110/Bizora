import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileSidebar from './MobileSidebar';

/**
 * AppShell — The main authenticated application layout.
 * Renders: Sidebar (desktop) + MobileSidebar (mobile drawer) + Topbar + Page Content.
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
          <motion.div
            key={window.location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="p-4 sm:p-6 lg:p-8 min-h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;

import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AppShell from '../components/layout/AppShell';
import AdminLayout from '../components/layout/AdminLayout';

// Public pages
import LandingPage from '../pages/public/LandingPage';
import PricingPage from '../pages/public/PricingPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage';
import OnboardingPage from '../pages/auth/OnboardingPage';

// App pages
import DashboardPage from '../pages/app/DashboardPage';
import ComingSoonPage from '../pages/app/ComingSoonPage';

// Admin pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminComingSoonPage from '../pages/admin/AdminComingSoonPage';

import { ROUTES } from '../constants';

const AppRouter = () => {
  return (
    <Routes>
      {/* ─── Public Routes ──────────────────────────── */}
      <Route path={ROUTES.HOME} element={<LandingPage />} />
      <Route path={ROUTES.PRICING} element={<PricingPage />} />

      {/* Auth routes */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
      <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
      <Route path={ROUTES.ONBOARDING} element={<OnboardingPage />} />

      {/* ─── App Routes ─────────────────────────────── */}
      <Route path="/app" element={<AppShell />}>
        <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Phase 2+ modules — clean placeholder */}
        <Route path="customers"    element={<ComingSoonPage module="Customers" icon="Users" />} />
        <Route path="employees"    element={<ComingSoonPage module="Employees" icon="UserCog" />} />
        <Route path="projects"     element={<ComingSoonPage module="Projects" icon="FolderKanban" />} />
        <Route path="tasks"        element={<ComingSoonPage module="Tasks" icon="CheckSquare" />} />
        <Route path="services"     element={<ComingSoonPage module="Services" icon="Briefcase" />} />
        <Route path="invoices"     element={<ComingSoonPage module="Invoices" icon="FileText" />} />
        <Route path="payments"     element={<ComingSoonPage module="Payments" icon="CreditCard" />} />
        <Route path="expenses"     element={<ComingSoonPage module="Expenses" icon="Receipt" />} />
        <Route path="inventory"    element={<ComingSoonPage module="Inventory" icon="Package" />} />
        <Route path="reports"      element={<ComingSoonPage module="Reports" icon="BarChart3" />} />
        <Route path="notifications" element={<ComingSoonPage module="Notifications" icon="Bell" />} />
        <Route path="files"        element={<ComingSoonPage module="Files" icon="FolderOpen" />} />
        <Route path="activity"     element={<ComingSoonPage module="Activity" icon="Activity" />} />
        <Route path="settings"     element={<ComingSoonPage module="Settings" icon="Settings" />} />
        <Route path="billing"      element={<ComingSoonPage module="Billing" icon="Wallet" />} />
      </Route>

      {/* ─── Admin Routes ───────────────────────────── */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />
        <Route path="dashboard"     element={<AdminDashboardPage />} />
        <Route path="businesses"    element={<AdminComingSoonPage module="Business Management" />} />
        <Route path="users"         element={<AdminComingSoonPage module="User Management" />} />
        <Route path="subscriptions" element={<AdminComingSoonPage module="Subscriptions" />} />
        <Route path="plans"         element={<AdminComingSoonPage module="Plan Management" />} />
        <Route path="audit-logs"    element={<AdminComingSoonPage module="Audit Logs" />} />
        <Route path="settings"      element={<AdminComingSoonPage module="Platform Settings" />} />
      </Route>

      {/* ─── Catch-all ──────────────────────────────── */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
};

export default AppRouter;

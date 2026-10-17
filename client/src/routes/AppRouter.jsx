import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AppShell from '../components/layout/AppShell';
import AdminLayout from '../components/layout/AdminLayout';
import ClientLayout from '../components/layout/ClientLayout';

// Route Guards
import { RequireAuth, RequireGuest } from './guards/RouteGuards';

// Public pages
import LandingPage from '../pages/public/LandingPage';
import PricingPage from '../pages/public/PricingPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage';
import AcceptInvitePage from '../pages/auth/AcceptInvitePage';
import OnboardingPage from '../pages/auth/OnboardingPage';

// App pages
import DashboardPage from '../pages/app/DashboardPage';
import ProfilePage from '../pages/app/ProfilePage';
import CustomersPage from '../pages/app/CustomersPage';
import CustomerDetailPage from '../pages/app/CustomerDetailPage';
import EmployeesPage from '../pages/app/EmployeesPage';
import EmployeeDetailPage from '../pages/app/EmployeeDetailPage';
import TeamPage from '../pages/app/TeamPage';
import SettingsPage from '../pages/app/SettingsPage';

// Phase 4 & Milestones 1-8 modules
import ProjectsPage from '../pages/app/ProjectsPage';
import ProjectDetailPage from '../pages/app/ProjectDetailPage';
import TasksPage from '../pages/app/TasksPage';
import ServicesPage from '../pages/app/ServicesPage';
import InvoicesPage from '../pages/app/InvoicesPage';
import InvoiceDetailPage from '../pages/app/InvoiceDetailPage';
import PaymentsPage from '../pages/app/PaymentsPage';
import ExpensesPage from '../pages/app/ExpensesPage';
import InventoryPage from '../pages/app/InventoryPage';
import InventoryDetailPage from '../pages/app/InventoryDetailPage';
import ReportsPage from '../pages/app/ReportsPage';
import NotificationsPage from '../pages/app/NotificationsPage';
import FilesPage from '../pages/app/FilesPage';
import ActivityPage from '../pages/app/ActivityPage';
import BillingPage from '../pages/app/BillingPage';

// Admin pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminBusinessesPage from '../pages/admin/AdminBusinessesPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminSubscriptionsPage from '../pages/admin/AdminSubscriptionsPage';
import AdminPlansPage from '../pages/admin/AdminPlansPage';
import AdminComingSoonPage from '../pages/admin/AdminComingSoonPage';

// Client Portal pages
import ClientDashboardPage from '../pages/client/ClientDashboardPage';
import ClientProjectsPage from '../pages/client/ClientProjectsPage';
import ClientInvoicesPage from '../pages/client/ClientInvoicesPage';
import ClientFilesPage from '../pages/client/ClientFilesPage';

import { ROUTES } from '../constants';

const AppRouter = () => {
  return (
    <Routes>
      {/* ─── Public Routes ──────────────────────────── */}
      <Route path={ROUTES.HOME} element={<LandingPage />} />
      <Route path={ROUTES.PRICING} element={<PricingPage />} />
      <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
      <Route path={ROUTES.ACCEPT_INVITE} element={<AcceptInvitePage />} />

      {/* ─── Guest Only Routes (redirect to /app if authenticated) ─ */}
      <Route element={<RequireGuest />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
      </Route>

      {/* ─── Onboarding Route (requires auth) ───────── */}
      <Route element={<RequireAuth />}>
        <Route path={ROUTES.ONBOARDING} element={<OnboardingPage />} />
      </Route>

      {/* ─── Protected App Routes ───────────────────── */}
      <Route element={<RequireAuth />}>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="customers/:customerId" element={<CustomerDetailPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="employees/:employeeId" element={<EmployeeDetailPage />} />
          <Route path="team" element={<EmployeesPage />} />
          <Route path="settings" element={<SettingsPage />} />

          {/* Phase 4 & Milestone App modules */}
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="invoices/:invoiceId" element={<InvoiceDetailPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="inventory/:itemId" element={<InventoryDetailPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="files" element={<FilesPage />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="billing" element={<BillingPage />} />
        </Route>
      </Route>

      {/* ─── Admin Routes ───────────────────────────── */}
      <Route element={<RequireAuth />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="businesses" element={<AdminBusinessesPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
          <Route path="plans" element={<AdminPlansPage />} />
          <Route path="audit-logs" element={<ActivityPage />} />
          <Route path="settings" element={<AdminComingSoonPage module="Platform Settings" />} />
        </Route>
      </Route>

      {/* ─── Client Portal Routes ───────────────────── */}
      <Route element={<RequireAuth />}>
        <Route path="/client" element={<ClientLayout />}>
          <Route index element={<Navigate to="/client/dashboard" replace />} />
          <Route path="dashboard" element={<ClientDashboardPage />} />
          <Route path="projects" element={<ClientProjectsPage />} />
          <Route path="invoices" element={<ClientInvoicesPage />} />
          <Route path="files" element={<ClientFilesPage />} />
        </Route>
      </Route>

      {/* ─── Catch-all ──────────────────────────────── */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
};

export default AppRouter;

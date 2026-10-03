/**
 * Application-wide constants.
 */

export const APP_NAME = 'Bizora';
export const APP_TAGLINE = 'Business management, simplified.';

export const ROUTES = {
  // Public
  HOME: '/',
  PRICING: '/pricing',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  ONBOARDING: '/onboarding',

  // App
  APP: '/app',
  DASHBOARD: '/app/dashboard',
  CUSTOMERS: '/app/customers',
  EMPLOYEES: '/app/employees',
  PROJECTS: '/app/projects',
  TASKS: '/app/tasks',
  SERVICES: '/app/services',
  INVOICES: '/app/invoices',
  PAYMENTS: '/app/payments',
  EXPENSES: '/app/expenses',
  INVENTORY: '/app/inventory',
  REPORTS: '/app/reports',
  NOTIFICATIONS: '/app/notifications',
  FILES: '/app/files',
  ACTIVITY: '/app/activity',
  SETTINGS: '/app/settings',
  BILLING: '/app/billing',

  // Admin
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_BUSINESSES: '/admin/businesses',
  ADMIN_USERS: '/admin/users',
  ADMIN_SUBSCRIPTIONS: '/admin/subscriptions',
  ADMIN_PLANS: '/admin/plans',
  ADMIN_AUDIT_LOGS: '/admin/audit-logs',
  ADMIN_SETTINGS: '/admin/settings',
};

export const NAV_ITEMS = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: 'LayoutDashboard' },
  { label: 'Customers', path: ROUTES.CUSTOMERS, icon: 'Users' },
  { label: 'Employees', path: ROUTES.EMPLOYEES, icon: 'UserCog' },
  { label: 'Projects', path: ROUTES.PROJECTS, icon: 'FolderKanban' },
  { label: 'Tasks', path: ROUTES.TASKS, icon: 'CheckSquare' },
  { label: 'Services', path: ROUTES.SERVICES, icon: 'Briefcase' },
  { label: 'Invoices', path: ROUTES.INVOICES, icon: 'FileText' },
  { label: 'Payments', path: ROUTES.PAYMENTS, icon: 'CreditCard' },
  { label: 'Expenses', path: ROUTES.EXPENSES, icon: 'Receipt' },
  { label: 'Inventory', path: ROUTES.INVENTORY, icon: 'Package' },
  { label: 'Reports', path: ROUTES.REPORTS, icon: 'BarChart3' },
];

export const NAV_SECONDARY = [
  { label: 'Notifications', path: ROUTES.NOTIFICATIONS, icon: 'Bell' },
  { label: 'Files', path: ROUTES.FILES, icon: 'FolderOpen' },
  { label: 'Activity', path: ROUTES.ACTIVITY, icon: 'Activity' },
];

export const NAV_BOTTOM = [
  { label: 'Settings', path: ROUTES.SETTINGS, icon: 'Settings' },
  { label: 'Billing', path: ROUTES.BILLING, icon: 'Wallet' },
];

export const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', path: ROUTES.ADMIN_DASHBOARD, icon: 'LayoutDashboard' },
  { label: 'Businesses', path: ROUTES.ADMIN_BUSINESSES, icon: 'Building2' },
  { label: 'Users', path: ROUTES.ADMIN_USERS, icon: 'Users' },
  { label: 'Subscriptions', path: ROUTES.ADMIN_SUBSCRIPTIONS, icon: 'CreditCard' },
  { label: 'Plans', path: ROUTES.ADMIN_PLANS, icon: 'Layers' },
  { label: 'Audit Logs', path: ROUTES.ADMIN_AUDIT_LOGS, icon: 'ScrollText' },
  { label: 'Settings', path: ROUTES.ADMIN_SETTINGS, icon: 'Settings' },
];

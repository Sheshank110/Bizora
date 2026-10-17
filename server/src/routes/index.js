import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import businessRoutes from './businessRoutes.js';
import customerRoutes from './customerRoutes.js';
import employeeRoutes from './employeeRoutes.js';
import invitationRoutes from './invitationRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import projectRoutes from './projectRoutes.js';
import taskRoutes from './taskRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import invoiceRoutes from './invoiceRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import expenseRoutes from './expenseRoutes.js';
import inventoryRoutes from './inventoryRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import fileRoutes from './fileRoutes.js';
import auditLogRoutes from './auditLogRoutes.js';
import reportRoutes from './reportRoutes.js';
import subscriptionRoutes from './subscriptionRoutes.js';
import adminRoutes from './adminRoutes.js';
import clientPortalRoutes from './clientPortalRoutes.js';

const router = Router();

// Health check
router.use('/health', healthRoutes);

// Auth & Workspace (Phase 2)
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/businesses', businessRoutes);

// Customer CRM & Team Management (Phase 3)
router.use('/customers', customerRoutes);
router.use('/employees', employeeRoutes);
router.use('/invitations', invitationRoutes);
router.use('/dashboard', dashboardRoutes);

// Projects, Tasks & Services (Phase 4 & Milestone 1)
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/services', serviceRoutes);

// Finance: Invoices, Payments, Expenses (Milestones 2 & 3)
router.use('/invoices', invoiceRoutes);
router.use('/payments', paymentRoutes);
router.use('/expenses', expenseRoutes);

// Operations: Inventory (Milestone 4)
router.use('/inventory', inventoryRoutes);

// Realtime & Communications: Notifications (Milestone 5)
router.use('/notifications', notificationRoutes);

// Storage & Audit: Files, Activity (Milestone 6)
router.use('/files', fileRoutes);
router.use('/activity', auditLogRoutes);
router.use('/audit-logs', auditLogRoutes);

// Analytics & Reports (Milestone 7)
router.use('/reports', reportRoutes);

// SaaS Subscriptions & Platform Admin (Milestone 8)
router.use('/subscription', subscriptionRoutes);
router.use('/admin', adminRoutes);

// Client Portal (Milestone 9)
router.use('/client', clientPortalRoutes);

export default router;

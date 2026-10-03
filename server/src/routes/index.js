import { Router } from 'express';
import healthRoutes from './health.routes.js';

const router = Router();

// Health check
router.use('/health', healthRoutes);

// Future route groups will be registered here:
// router.use('/auth', authRoutes);
// router.use('/team', teamRoutes);
// router.use('/clients', clientRoutes);
// router.use('/invoices', invoiceRoutes);
// router.use('/expenses', expenseRoutes);
// router.use('/projects', projectRoutes);
// router.use('/tasks', taskRoutes);
// router.use('/dashboard', dashboardRoutes);
// router.use('/reports', reportRoutes);
// router.use('/categories', categoryRoutes);
// router.use('/settings', settingsRoutes);

export default router;

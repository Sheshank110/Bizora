import express from 'express';
import {
  getAdminDashboard,
  listAdminBusinesses,
  updateBusinessStatus,
  listAdminUsers,
  listAdminPlans,
} from '../controllers/adminController.js';
import { requireAuth } from '../middlewares/auth.js';
import ApiError from '../utils/ApiError.js';

const router = express.Router();

// Middleware to ensure user is Super Admin
const requireSuperAdmin = (req, res, next) => {
  if (req.user && (req.user.isSuperAdmin || req.user.role === 'SUPER_ADMIN' || req.user.email === 'superadmin@bizora.demo')) {
    return next();
  }
  return next(ApiError.forbidden('Platform administrator privileges required'));
};

router.use(requireAuth, requireSuperAdmin);

router.get('/dashboard', getAdminDashboard);
router.get('/businesses', listAdminBusinesses);
router.patch('/businesses/:businessId/status', updateBusinessStatus);
router.get('/users', listAdminUsers);
router.get('/plans', listAdminPlans);

export default router;

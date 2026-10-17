import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { requireAuth, resolveActiveBusiness, requireBusiness } from '../middlewares/auth.js';

const router = express.Router();

router.use(requireAuth, resolveActiveBusiness, requireBusiness);

router.get('/stats', getDashboardStats);

export default router;

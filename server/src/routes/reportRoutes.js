import express from 'express';
import { getAnalyticsSummary, exportReportCsv } from '../controllers/reportController.js';
import { requireAuth, resolveActiveBusiness, requireBusiness, requireRole } from '../middlewares/auth.js';
import { USER_ROLES } from '../constants/index.js';

const router = express.Router();
router.use(requireAuth, resolveActiveBusiness, requireBusiness);

router.get('/summary', requireRole(USER_ROLES.OWNER, USER_ROLES.ADMIN, USER_ROLES.MANAGER), getAnalyticsSummary);
router.get('/export', requireRole(USER_ROLES.OWNER, USER_ROLES.ADMIN, USER_ROLES.MANAGER), exportReportCsv);

export default router;

import express from 'express';
import { listAuditLogs } from '../controllers/auditLogController.js';
import { requireAuth, resolveActiveBusiness, requireBusiness, requireRole } from '../middlewares/auth.js';
import { USER_ROLES } from '../constants/index.js';

const router = express.Router();
router.use(requireAuth, resolveActiveBusiness, requireBusiness);

router.get('/', requireRole(USER_ROLES.OWNER, USER_ROLES.ADMIN, USER_ROLES.MANAGER), listAuditLogs);

export default router;

import express from 'express';
import {
  getSubscription,
  changePlan,
  cancelSubscription,
} from '../controllers/subscriptionController.js';
import { requireAuth, resolveActiveBusiness, requireBusiness, requireRole } from '../middlewares/auth.js';
import { USER_ROLES } from '../constants/index.js';

const router = express.Router();
router.use(requireAuth, resolveActiveBusiness, requireBusiness);

router.get('/', getSubscription);
router.post('/change-plan', requireRole(USER_ROLES.OWNER, USER_ROLES.ADMIN), changePlan);
router.post('/cancel', requireRole(USER_ROLES.OWNER, USER_ROLES.ADMIN), cancelSubscription);

export default router;

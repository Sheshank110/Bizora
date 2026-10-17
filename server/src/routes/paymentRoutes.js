import express from 'express';
import {
  listPayments,
  processPayment,
  handleWebhook,
} from '../controllers/paymentController.js';
import { requireAuth, resolveActiveBusiness, requireBusiness, requireRole } from '../middlewares/auth.js';
import { USER_ROLES } from '../constants/index.js';

const router = express.Router();

// Public webhook endpoint
router.post('/webhook', handleWebhook);

// Protected routes
router.use(requireAuth, resolveActiveBusiness, requireBusiness);

router.get('/', listPayments);
router.post('/checkout', processPayment);

export default router;

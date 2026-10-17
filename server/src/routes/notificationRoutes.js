import express from 'express';
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController.js';
import { requireAuth, resolveActiveBusiness, requireBusiness } from '../middlewares/auth.js';

const router = express.Router();
router.use(requireAuth, resolveActiveBusiness, requireBusiness);

router.get('/', listNotifications);
router.patch('/:notificationId/read', markAsRead);
router.post('/read-all', markAllAsRead);

export default router;

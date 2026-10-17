import express from 'express';
import {
  listInventory,
  getInventoryItemById,
  createInventoryItem,
  adjustStock,
  getItemTransactions,
} from '../controllers/inventoryController.js';
import { requireAuth, resolveActiveBusiness, requireBusiness, requireRole } from '../middlewares/auth.js';
import { USER_ROLES } from '../constants/index.js';

const router = express.Router();
router.use(requireAuth, resolveActiveBusiness, requireBusiness);

router.get('/', listInventory);
router.post('/', requireRole(USER_ROLES.OWNER, USER_ROLES.ADMIN, USER_ROLES.MANAGER), createInventoryItem);
router.get('/:itemId', getInventoryItemById);
router.get('/:itemId/transactions', getItemTransactions);
router.post('/:itemId/adjust', requireRole(USER_ROLES.OWNER, USER_ROLES.ADMIN, USER_ROLES.MANAGER), adjustStock);

export default router;

import express from 'express';
import {
  listInvoices,
  getInvoiceById,
  createInvoice,
  sendInvoice,
  markInvoicePaid,
  cancelInvoice,
} from '../controllers/invoiceController.js';
import { requireAuth, resolveActiveBusiness, requireBusiness, requireRole } from '../middlewares/auth.js';
import { USER_ROLES } from '../constants/index.js';

const router = express.Router();
router.use(requireAuth, resolveActiveBusiness, requireBusiness);

router.get('/', listInvoices);
router.post('/', requireRole(USER_ROLES.OWNER, USER_ROLES.ADMIN, USER_ROLES.MANAGER), createInvoice);
router.get('/:invoiceId', getInvoiceById);
router.post('/:invoiceId/send', requireRole(USER_ROLES.OWNER, USER_ROLES.ADMIN, USER_ROLES.MANAGER), sendInvoice);
router.post('/:invoiceId/mark-paid', requireRole(USER_ROLES.OWNER, USER_ROLES.ADMIN, USER_ROLES.MANAGER), markInvoicePaid);
router.post('/:invoiceId/cancel', requireRole(USER_ROLES.OWNER, USER_ROLES.ADMIN, USER_ROLES.MANAGER), cancelInvoice);

export default router;

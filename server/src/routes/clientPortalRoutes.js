import express from 'express';
import {
  getClientDashboard,
  getClientProjects,
  getClientProjectDetails,
  getClientInvoices,
  getClientFiles,
} from '../controllers/clientPortalController.js';
import { requireAuth, resolveActiveBusiness, requireBusiness } from '../middlewares/auth.js';

const router = express.Router();
router.use(requireAuth, resolveActiveBusiness, requireBusiness);

router.get('/dashboard', getClientDashboard);
router.get('/projects', getClientProjects);
router.get('/projects/:projectId', getClientProjectDetails);
router.get('/invoices', getClientInvoices);
router.get('/files', getClientFiles);

export default router;

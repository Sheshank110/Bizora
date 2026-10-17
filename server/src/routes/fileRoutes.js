import express from 'express';
import {
  listFiles,
  uploadFile,
  deleteFile,
} from '../controllers/fileController.js';
import { requireAuth, resolveActiveBusiness, requireBusiness, requireRole } from '../middlewares/auth.js';
import { USER_ROLES } from '../constants/index.js';

const router = express.Router();
router.use(requireAuth, resolveActiveBusiness, requireBusiness);

router.get('/', listFiles);
router.post('/', requireRole(USER_ROLES.OWNER, USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE), uploadFile);
router.delete('/:fileId', requireRole(USER_ROLES.OWNER, USER_ROLES.ADMIN, USER_ROLES.MANAGER), deleteFile);

export default router;

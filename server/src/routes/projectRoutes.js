import express from 'express';
import {
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { requireAuth, resolveActiveBusiness, requireBusiness, requireRole } from '../middlewares/auth.js';
import { USER_ROLES } from '../constants/index.js';

const router = express.Router();
router.use(requireAuth, resolveActiveBusiness, requireBusiness);

router.get('/', listProjects);
router.post('/', requireRole(USER_ROLES.OWNER, USER_ROLES.ADMIN, USER_ROLES.MANAGER), createProject);
router.get('/:projectId', getProjectById);
router.patch('/:projectId', requireRole(USER_ROLES.OWNER, USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE), updateProject);
router.delete('/:projectId', requireRole(USER_ROLES.OWNER, USER_ROLES.ADMIN, USER_ROLES.MANAGER), deleteProject);

export default router;

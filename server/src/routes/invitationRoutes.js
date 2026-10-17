import express from 'express';
import {
  listInvitations,
  inviteEmployee,
  resendInvitation,
  revokeInvitation,
  acceptInvitation,
} from '../controllers/invitationController.js';
import { requireAuth, resolveActiveBusiness, requireBusiness, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { inviteEmployeeValidator } from '../validators/employeeValidators.js';
import { USER_ROLES } from '../constants/index.js';

const router = express.Router();

// Public: Accept invitation token
router.post('/accept', acceptInvitation);
router.post('/:token/accept', acceptInvitation);

// Protected: Workspace member operations
router.use(requireAuth, resolveActiveBusiness, requireBusiness);

router.get(
  '/',
  requireRole(USER_ROLES.OWNER, USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  listInvitations
);

router.post(
  '/',
  requireRole(USER_ROLES.OWNER, USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validate(inviteEmployeeValidator),
  inviteEmployee
);

router.post(
  '/:invitationId/resend',
  requireRole(USER_ROLES.OWNER, USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  resendInvitation
);

router.delete(
  '/:invitationId',
  requireRole(USER_ROLES.OWNER, USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  revokeInvitation
);

export default router;

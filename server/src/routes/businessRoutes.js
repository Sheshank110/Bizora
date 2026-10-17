import express from 'express';
import {
  listMyBusinesses,
  createBusiness,
  getBusinessDetails,
  updateBusiness,
  listMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
  acceptInvite,
} from '../controllers/businessController.js';
import { requireAuth, resolveActiveBusiness, requireBusiness, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createBusinessValidator,
  updateBusinessValidator,
  inviteMemberValidator,
  updateMemberRoleValidator,
} from '../validators/businessValidators.js';
import { USER_ROLES } from '../constants/index.js';

const router = express.Router();

// Public route to accept workspace invite
router.post('/accept-invite', acceptInvite);

// All subsequent routes require authentication
router.use(requireAuth);

router.get('/', listMyBusinesses);
router.post('/', validate(createBusinessValidator), createBusiness);

// Scoped to active business workspace
router.use('/current', resolveActiveBusiness, requireBusiness);

router.get('/current', getBusinessDetails);
router.patch('/current', requireRole(USER_ROLES.OWNER, USER_ROLES.ADMIN), validate(updateBusinessValidator), updateBusiness);

// Member management
router.get('/current/members', listMembers);
router.post(
  '/current/members/invite',
  requireRole(USER_ROLES.OWNER, USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validate(inviteMemberValidator),
  inviteMember
);
router.patch(
  '/current/members/:memberId',
  requireRole(USER_ROLES.OWNER, USER_ROLES.ADMIN),
  validate(updateMemberRoleValidator),
  updateMemberRole
);
router.delete(
  '/current/members/:memberId',
  requireRole(USER_ROLES.OWNER, USER_ROLES.ADMIN),
  removeMember
);

export default router;

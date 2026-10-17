import crypto from 'crypto';
import mongoose from 'mongoose';
import Invitation, { INVITATION_STATUS } from '../models/Invitation.js';
import User from '../models/User.js';
import Membership from '../models/Membership.js';
import EmployeeProfile, { EMPLOYEE_STATUS } from '../models/EmployeeProfile.js';
import Business from '../models/Business.js';
import devMockDb from '../services/devMockDb.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendWorkspaceInviteEmail } from '../services/emailService.js';
import { USER_ROLES, MEMBERSHIP_STATUS } from '../constants/index.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * List pending and active invitations for the current workspace
 */
export const listInvitations = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;

  if (isMongoConnected()) {
    const invitations = await Invitation.find({
      businessId,
      status: INVITATION_STATUS.PENDING,
    })
      .sort({ createdAt: -1 })
      .populate('invitedBy', 'firstName lastName email');

    return ApiResponse.success(res, invitations, 'Invitations fetched');
  } else {
    const list = devMockDb.findInvitationsByBusiness(businessId);
    const populated = list.map((inv) => {
      const inviter = devMockDb.findUserById(inv.invitedBy);
      return {
        ...inv,
        invitedBy: inviter
          ? {
              id: inviter._id || inviter.id,
              firstName: inviter.firstName,
              lastName: inviter.lastName,
              email: inviter.email,
            }
          : null,
      };
    });

    return ApiResponse.success(res, populated, 'Invitations fetched');
  }
});

/**
 * Send an invitation to join workspace as employee or manager
 */
export const inviteEmployee = asyncHandler(async (req, res) => {
  const business = req.business;
  const businessId = business._id || business.id;
  const inviterId = req.user._id || req.user.id;
  const { email, role, jobTitle, department } = req.body;

  // Cannot invite as Owner
  if (role === USER_ROLES.OWNER) {
    throw ApiError.badRequest('Cannot invite user with Owner role');
  }

  // Managers cannot invite other Managers
  if (req.role === USER_ROLES.MANAGER && role === USER_ROLES.MANAGER) {
    throw ApiError.forbidden('Managers can only invite Employees');
  }

  // Raw secret token sent in email, hashed version saved in database
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  if (isMongoConnected()) {
    // Check if user is already an active member of this business
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const existingMembership = await Membership.findOne({
        userId: existingUser._id,
        businessId,
        status: MEMBERSHIP_STATUS.ACTIVE,
      });

      if (existingMembership) {
        throw ApiError.conflict('User is already an active member of this workspace');
      }
    }

    // Check for existing pending invitation
    const existingInv = await Invitation.findOne({
      businessId,
      email,
      status: INVITATION_STATUS.PENDING,
    });

    if (existingInv) {
      throw ApiError.conflict('An active invitation is already pending for this email');
    }

    const invitation = await Invitation.create({
      businessId,
      email,
      role: role || USER_ROLES.EMPLOYEE,
      jobTitle: jobTitle || '',
      department: department || '',
      invitedBy: inviterId,
      token: hashedToken,
      expiresAt,
      status: INVITATION_STATUS.PENDING,
    });

    // Send invitation email (dev fallback logs link to console)
    sendWorkspaceInviteEmail({
      email,
      inviterName: req.user.fullName || `${req.user.firstName} ${req.user.lastName}`,
      businessName: business.name,
      inviteToken: rawToken,
      role: role || USER_ROLES.EMPLOYEE,
    }).catch((err) => console.error('Invite email error:', err.message));

    return ApiResponse.created(
      res,
      {
        invitationId: invitation._id,
        email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      },
      `Invitation sent to ${email}`
    );
  } else {
    // In-memory dual-mode
    const existingMems = devMockDb.findMembershipsByBusiness(businessId);
    const user = devMockDb.findUserByEmail(email);
    if (user && existingMems.some((m) => String(m.userId) === String(user._id || user.id))) {
      throw ApiError.conflict('User is already an active member of this workspace');
    }

    const existingInv = devMockDb.invitations.find(
      (i) =>
        String(i.businessId) === String(businessId) &&
        i.email.toLowerCase() === email.toLowerCase() &&
        i.status === INVITATION_STATUS.PENDING
    );

    if (existingInv) {
      throw ApiError.conflict('An active invitation is already pending for this email');
    }

    const invId = `inv_${Date.now()}`;
    const newInv = {
      _id: invId,
      id: invId,
      businessId,
      email,
      role: role || USER_ROLES.EMPLOYEE,
      jobTitle: jobTitle || '',
      department: department || '',
      invitedBy: inviterId,
      token: hashedToken,
      rawToken, // Kept in dev mock for test convenience
      expiresAt,
      status: INVITATION_STATUS.PENDING,
      createdAt: new Date(),
    };

    devMockDb.invitations.unshift(newInv);

    sendWorkspaceInviteEmail({
      email,
      inviterName: req.user.fullName || `${req.user.firstName} ${req.user.lastName}`,
      businessName: business.name,
      inviteToken: rawToken,
      role: role || USER_ROLES.EMPLOYEE,
    }).catch((err) => console.error('Invite email error:', err.message));

    return ApiResponse.created(
      res,
      {
        invitationId: invId,
        email,
        role: newInv.role,
        rawToken,
        expiresAt,
      },
      `Invitation sent to ${email}`
    );
  }
});

/**
 * Revoke invitation
 */
export const revokeInvitation = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const { invitationId } = req.params;

  if (isMongoConnected()) {
    const inv = await Invitation.findOne({
      _id: invitationId,
      businessId,
      status: INVITATION_STATUS.PENDING,
    });

    if (!inv) {
      throw ApiError.notFound('Pending invitation not found');
    }

    inv.status = INVITATION_STATUS.REVOKED;
    await inv.save();

    return ApiResponse.success(res, null, 'Invitation revoked successfully');
  } else {
    const inv = devMockDb.invitations.find(
      (i) =>
        String(i._id) === String(invitationId) &&
        String(i.businessId) === String(businessId) &&
        i.status === INVITATION_STATUS.PENDING
    );

    if (!inv) {
      throw ApiError.notFound('Pending invitation not found');
    }

    inv.status = INVITATION_STATUS.REVOKED;
    return ApiResponse.success(res, null, 'Invitation revoked successfully');
  }
});

/**
 * Resend invitation
 */
export const resendInvitation = asyncHandler(async (req, res) => {
  const business = req.business;
  const businessId = business._id || business.id;
  const { invitationId } = req.params;

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  if (isMongoConnected()) {
    const inv = await Invitation.findOne({
      _id: invitationId,
      businessId,
    });

    if (!inv) {
      throw ApiError.notFound('Invitation not found');
    }

    inv.token = hashedToken;
    inv.expiresAt = expiresAt;
    inv.status = INVITATION_STATUS.PENDING;
    await inv.save();

    sendWorkspaceInviteEmail({
      email: inv.email,
      inviterName: req.user.fullName || `${req.user.firstName} ${req.user.lastName}`,
      businessName: business.name,
      inviteToken: rawToken,
      role: inv.role,
    }).catch((err) => console.error('Resend invite error:', err.message));

    return ApiResponse.success(res, null, `Invitation resent to ${inv.email}`);
  } else {
    const inv = devMockDb.invitations.find(
      (i) => String(i._id) === String(invitationId) && String(i.businessId) === String(businessId)
    );

    if (!inv) {
      throw ApiError.notFound('Invitation not found');
    }

    inv.token = hashedToken;
    inv.rawToken = rawToken;
    inv.expiresAt = expiresAt;
    inv.status = INVITATION_STATUS.PENDING;

    sendWorkspaceInviteEmail({
      email: inv.email,
      inviterName: req.user.fullName || `${req.user.firstName} ${req.user.lastName}`,
      businessName: business.name,
      inviteToken: rawToken,
      role: inv.role,
    }).catch((err) => console.error('Resend invite error:', err.message));

    return ApiResponse.success(res, { rawToken }, `Invitation resent to ${inv.email}`);
  }
});

/**
 * Accept invitation (Public or Authenticated)
 */
export const acceptInvitation = asyncHandler(async (req, res) => {
  const token = req.body.token || req.params.token;
  const { password, firstName, lastName } = req.body;
  if (!token) {
    throw ApiError.badRequest('Invitation token is required');
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  if (isMongoConnected()) {
    const invitation = await Invitation.findOne({
      $or: [{ token: hashedToken }, { token }],
      status: INVITATION_STATUS.PENDING,
    }).populate('businessId');

    if (!invitation) {
      throw ApiError.badRequest('Invitation link is invalid or has already been accepted/revoked');
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = INVITATION_STATUS.EXPIRED;
      await invitation.save();
      throw ApiError.badRequest('Invitation has expired. Please ask an administrator to resend it.');
    }

    // Find or create User
    let user = await User.findOne({ email: invitation.email });

    if (!user) {
      if (!password || password.length < 8) {
        throw ApiError.badRequest('Password of at least 8 characters is required to complete account creation');
      }

      user = await User.create({
        firstName: firstName || invitation.email.split('@')[0],
        lastName: lastName || '',
        email: invitation.email,
        password,
        status: 'active',
        isEmailVerified: true,
      });
    }

    // Create Membership
    const existingMembership = await Membership.findOne({
      userId: user._id,
      businessId: invitation.businessId._id,
    });

    if (existingMembership) {
      existingMembership.status = MEMBERSHIP_STATUS.ACTIVE;
      existingMembership.role = invitation.role;
      existingMembership.title = invitation.jobTitle || existingMembership.title;
      existingMembership.department = invitation.department || existingMembership.department;
      await existingMembership.save();
    } else {
      await Membership.create({
        userId: user._id,
        businessId: invitation.businessId._id,
        role: invitation.role,
        title: invitation.jobTitle,
        department: invitation.department,
        status: MEMBERSHIP_STATUS.ACTIVE,
        invitedBy: invitation.invitedBy,
      });
    }

    // Create or update EmployeeProfile
    let profile = await EmployeeProfile.findOne({
      userId: user._id,
      businessId: invitation.businessId._id,
    });

    if (!profile) {
      await EmployeeProfile.create({
        userId: user._id,
        businessId: invitation.businessId._id,
        jobTitle: invitation.jobTitle,
        department: invitation.department,
        status: EMPLOYEE_STATUS.ACTIVE,
      });
    } else {
      profile.status = EMPLOYEE_STATUS.ACTIVE;
      if (invitation.jobTitle) profile.jobTitle = invitation.jobTitle;
      if (invitation.department) profile.department = invitation.department;
      await profile.save();
    }

    // Mark invitation accepted
    invitation.status = INVITATION_STATUS.ACCEPTED;
    invitation.acceptedAt = new Date();
    await invitation.save();

    return ApiResponse.success(
      res,
      {
        businessName: invitation.businessId.name,
        role: invitation.role,
      },
      `Successfully joined ${invitation.businessId.name}`
    );
  } else {
    // In-memory acceptance
    const invitation = devMockDb.invitations.find(
      (i) =>
        (i.token === hashedToken || i.rawToken === token || i.token === token) &&
        i.status === INVITATION_STATUS.PENDING
    );

    if (!invitation) {
      throw ApiError.badRequest('Invitation link is invalid or has already been accepted');
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = INVITATION_STATUS.EXPIRED;
      throw ApiError.badRequest('Invitation has expired');
    }

    const business = devMockDb.findBusinessById(invitation.businessId);

    let user = devMockDb.findUserByEmail(invitation.email);
    if (!user) {
      const userId = `usr_${Date.now()}`;
      user = {
        _id: userId,
        id: userId,
        firstName: firstName || invitation.email.split('@')[0],
        lastName: lastName || '',
        fullName: `${firstName || ''} ${lastName || ''}`.trim() || invitation.email.split('@')[0],
        email: invitation.email,
        password: 'Password123!',
        avatar: '',
        status: 'active',
        isEmailVerified: true,
      };
      devMockDb.users.push(user);
    }

    const userId = user._id || user.id;

    // Check or create membership
    let mem = devMockDb.memberships.find(
      (m) => String(m.userId) === String(userId) && String(m.businessId) === String(invitation.businessId)
    );

    if (mem) {
      mem.status = MEMBERSHIP_STATUS.ACTIVE;
      mem.role = invitation.role;
    } else {
      mem = {
        _id: `mem_${Date.now()}`,
        userId,
        businessId: invitation.businessId,
        role: invitation.role,
        title: invitation.jobTitle,
        department: invitation.department,
        status: MEMBERSHIP_STATUS.ACTIVE,
        joinedAt: new Date(),
      };
      devMockDb.memberships.push(mem);
    }

    let profile = devMockDb.employeeProfiles.find(
      (p) => String(p.userId) === String(userId) && String(p.businessId) === String(invitation.businessId)
    );

    if (!profile) {
      devMockDb.employeeProfiles.push({
        _id: `emp_p_${Date.now()}`,
        userId,
        businessId: invitation.businessId,
        jobTitle: invitation.jobTitle,
        department: invitation.department,
        phone: '',
        status: 'ACTIVE',
        joiningDate: new Date(),
      });
    }

    invitation.status = INVITATION_STATUS.ACCEPTED;
    invitation.acceptedAt = new Date();

    return ApiResponse.success(
      res,
      {
        businessName: business?.name || 'Workspace',
        role: invitation.role,
      },
      `Successfully joined ${business?.name || 'Workspace'}`
    );
  }
});

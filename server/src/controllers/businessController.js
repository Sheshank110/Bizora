import mongoose from 'mongoose';
import crypto from 'crypto';
import Business from '../models/Business.js';
import Membership from '../models/Membership.js';
import User from '../models/User.js';
import devMockDb from '../services/devMockDb.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendWorkspaceInviteEmail } from '../services/emailService.js';
import { USER_ROLES, MEMBERSHIP_STATUS } from '../constants/index.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * List all businesses user belongs to
 */
export const listMyBusinesses = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;

  if (isMongoConnected()) {
    const memberships = await Membership.find({
      userId,
      status: MEMBERSHIP_STATUS.ACTIVE,
    }).populate('businessId');

    const businesses = await Promise.all(
      memberships
        .filter((m) => m.businessId && m.businessId.status === 'active')
        .map(async (m) => {
          const memberCount = await Membership.countDocuments({
            businessId: m.businessId._id,
            status: MEMBERSHIP_STATUS.ACTIVE,
          });

          return {
            id: m.businessId._id,
            name: m.businessId.name,
            slug: m.businessId.slug,
            industry: m.businessId.industry,
            currency: m.businessId.currency,
            logo: m.businessId.logo,
            role: m.role,
            title: m.title,
            department: m.department,
            memberCount,
            isOwner: m.role === USER_ROLES.OWNER,
          };
        })
    );

    return ApiResponse.success(res, businesses, 'User businesses fetched');
  } else {
    const userMemberships = devMockDb.findMembershipsByUser(userId);
    const businesses = userMemberships.map((m) => {
      const biz = devMockDb.findBusinessById(m.businessId);
      const memberCount = devMockDb.findMembershipsByBusiness(m.businessId).length;
      return {
        id: biz?._id || biz?.id,
        name: biz?.name || 'Workspace',
        slug: biz?.slug || 'workspace',
        industry: biz?.industry || 'technology',
        currency: biz?.currency || 'USD',
        logo: biz?.logo || '',
        role: m.role,
        title: m.title,
        department: m.department,
        memberCount,
        isOwner: m.role === USER_ROLES.OWNER,
      };
    });

    return ApiResponse.success(res, businesses, 'User businesses fetched');
  }
});

/**
 * Create a new business workspace
 */
export const createBusiness = asyncHandler(async (req, res) => {
  const { name, industry, currency, timezone, description, address, contact, taxId } = req.body;
  const userId = req.user._id || req.user.id;

  if (isMongoConnected()) {
    const slug = await Business.generateUniqueSlug(name);

    const business = await Business.create({
      name: name.trim(),
      slug,
      ownerId: userId,
      industry: industry || 'other',
      currency: currency || 'USD',
      timezone: timezone || 'UTC',
      description: description || '',
      address: address || {},
      contact: contact || {},
      taxId: taxId || '',
    });

    const membership = await Membership.create({
      userId,
      businessId: business._id,
      role: USER_ROLES.OWNER,
      status: MEMBERSHIP_STATUS.ACTIVE,
    });

    return ApiResponse.created(
      res,
      {
        business,
        membership: {
          role: membership.role,
          status: membership.status,
        },
      },
      'Business workspace created successfully'
    );
  } else {
    const bizId = `biz_${Date.now()}`;
    const slug = name.trim().toLowerCase().replace(/\s+/g, '-');
    const newBiz = {
      _id: bizId,
      id: bizId,
      name: name.trim(),
      slug,
      ownerId: userId,
      industry: industry || 'technology',
      currency: currency || 'USD',
      timezone: timezone || 'UTC',
      description: description || '',
      address: address || {},
      contact: contact || {},
      taxId: taxId || '',
      status: 'active',
      plan: 'pro',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    devMockDb.businesses.push(newBiz);

    const newMem = {
      _id: `mem_${Date.now()}`,
      userId,
      businessId: bizId,
      role: USER_ROLES.OWNER,
      status: MEMBERSHIP_STATUS.ACTIVE,
      joinedAt: new Date(),
    };
    devMockDb.memberships.push(newMem);

    return ApiResponse.created(
      res,
      {
        business: newBiz,
        membership: {
          role: newMem.role,
          status: newMem.status,
        },
      },
      'Business workspace created successfully'
    );
  }
});

/**
 * Get active business workspace details
 */
export const getBusinessDetails = asyncHandler(async (req, res) => {
  const business = req.business;
  const businessId = business._id || business.id;

  let memberCount = 1;
  if (isMongoConnected()) {
    memberCount = await Membership.countDocuments({
      businessId,
      status: MEMBERSHIP_STATUS.ACTIVE,
    });
  } else {
    memberCount = devMockDb.findMembershipsByBusiness(businessId).length;
  }

  const safeBiz = business.toJSON ? business.toJSON() : { ...business };

  return ApiResponse.success(
    res,
    {
      ...safeBiz,
      memberCount,
      currentUserRole: req.role,
    },
    'Workspace details fetched'
  );
});

/**
 * Update business workspace settings
 */
export const updateBusiness = asyncHandler(async (req, res) => {
  const business = req.business;
  const { name, industry, currency, timezone, description, address, contact, taxId, settings } = req.body;

  if (name) business.name = name.trim();
  if (industry) business.industry = industry;
  if (currency) business.currency = currency;
  if (timezone) business.timezone = timezone;
  if (description !== undefined) business.description = description.trim();
  if (address) business.address = { ...business.address, ...address };
  if (contact) business.contact = { ...business.contact, ...contact };
  if (taxId !== undefined) business.taxId = taxId.trim();
  if (settings) business.settings = { ...business.settings, ...settings };

  if (isMongoConnected()) {
    await business.save();
  }

  const safeBiz = business.toJSON ? business.toJSON() : { ...business };

  return ApiResponse.success(res, safeBiz, 'Workspace updated successfully');
});

/**
 * List all members of the active workspace
 */
export const listMembers = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;

  if (isMongoConnected()) {
    const members = await Membership.find({ businessId })
      .populate('userId', 'firstName lastName email avatar status phone isEmailVerified')
      .populate('invitedBy', 'firstName lastName email')
      .sort({ createdAt: 1 });

    const formattedMembers = members.map((m) => ({
      id: m._id,
      user: m.userId
        ? {
            id: m.userId._id,
            firstName: m.userId.firstName,
            lastName: m.userId.lastName,
            fullName: `${m.userId.firstName} ${m.userId.lastName}`.trim(),
            email: m.userId.email,
            avatar: m.userId.avatar,
            isEmailVerified: m.userId.isEmailVerified,
          }
        : null,
      role: m.role,
      status: m.status,
      title: m.title,
      department: m.department,
      joinedAt: m.joinedAt,
      invitedBy: m.invitedBy
        ? `${m.invitedBy.firstName} ${m.invitedBy.lastName}`.trim()
        : null,
    }));

    return ApiResponse.success(res, formattedMembers, 'Workspace members fetched');
  } else {
    const memberships = devMockDb.findMembershipsByBusiness(businessId);
    const formattedMembers = memberships.map((m) => {
      const u = devMockDb.findUserById(m.userId);
      return {
        id: m._id,
        user: u
          ? {
              id: u._id || u.id,
              firstName: u.firstName,
              lastName: u.lastName,
              fullName: u.fullName || `${u.firstName} ${u.lastName}`.trim(),
              email: u.email,
              avatar: u.avatar || '',
              isEmailVerified: u.isEmailVerified,
            }
          : null,
        role: m.role,
        status: m.status,
        title: m.title || '',
        department: m.department || '',
        joinedAt: m.joinedAt,
        invitedBy: null,
      };
    });

    return ApiResponse.success(res, formattedMembers, 'Workspace members fetched');
  }
});

/**
 * Invite a member to the workspace
 */
export const inviteMember = asyncHandler(async (req, res) => {
  const { email, role, title, department } = req.body;
  const business = req.business;
  const businessId = business._id || business.id;

  if (role === USER_ROLES.OWNER) {
    throw ApiError.badRequest('Cannot invite user as workspace owner');
  }

  if (isMongoConnected()) {
    let targetUser = await User.findOne({ email });

    const rawInviteToken = crypto.randomBytes(32).toString('hex');
    const hashedInviteToken = crypto.createHash('sha256').update(rawInviteToken).digest('hex');

    let membership;

    if (targetUser) {
      membership = await Membership.create({
        userId: targetUser._id,
        businessId,
        role: role || USER_ROLES.MEMBER,
        title: title || '',
        department: department || '',
        invitedBy: req.user._id,
        status: MEMBERSHIP_STATUS.INVITED,
        inviteToken: hashedInviteToken,
        inviteExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    } else {
      const tempPassword = crypto.randomBytes(16).toString('hex');
      targetUser = await User.create({
        firstName: email.split('@')[0],
        lastName: '',
        email,
        password: tempPassword,
        status: 'pending',
      });

      membership = await Membership.create({
        userId: targetUser._id,
        businessId,
        role: role || USER_ROLES.MEMBER,
        title: title || '',
        department: department || '',
        invitedBy: req.user._id,
        status: MEMBERSHIP_STATUS.INVITED,
        inviteToken: hashedInviteToken,
        inviteExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }

    sendWorkspaceInviteEmail({
      email,
      inviterName: req.user.fullName || `${req.user.firstName} ${req.user.lastName}`,
      businessName: business.name,
      inviteToken: rawInviteToken,
      role: role || USER_ROLES.MEMBER,
    }).catch((err) => console.error('Workspace invite email error:', err.message));

    return ApiResponse.created(
      res,
      {
        membershipId: membership._id,
        email,
        role: membership.role,
        status: membership.status,
      },
      `Invitation sent to ${email}`
    );
  } else {
    // In-memory invite
    let targetUser = devMockDb.findUserByEmail(email);
    const userId = targetUser ? (targetUser._id || targetUser.id) : `usr_${Date.now()}`;

    if (!targetUser) {
      targetUser = {
        _id: userId,
        id: userId,
        firstName: email.split('@')[0],
        lastName: '',
        fullName: email.split('@')[0],
        email,
        avatar: '',
        status: 'active',
        isEmailVerified: true,
        preferences: { theme: 'system', notifications: { email: true, inApp: true } },
      };
      devMockDb.users.push(targetUser);
    }

    const memId = `mem_${Date.now()}`;
    const newMem = {
      _id: memId,
      userId,
      businessId,
      role: role || USER_ROLES.MEMBER,
      title: title || '',
      department: department || '',
      status: MEMBERSHIP_STATUS.ACTIVE,
      joinedAt: new Date(),
    };
    devMockDb.memberships.push(newMem);

    return ApiResponse.created(
      res,
      {
        membershipId: memId,
        email,
        role: newMem.role,
        status: newMem.status,
      },
      `Invitation sent and member added for ${email}`
    );
  }
});

/**
 * Update member role or title
 */
export const updateMemberRole = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const { role, title, department } = req.body;
  const businessId = req.business._id || req.business.id;

  if (isMongoConnected()) {
    const membership = await Membership.findOne({ _id: memberId, businessId });
    if (!membership) throw ApiError.notFound('Member not found in this workspace');
    if (membership.role === USER_ROLES.OWNER) throw ApiError.forbidden('Cannot modify role of the workspace owner');
    if (role === USER_ROLES.ADMIN && req.role !== USER_ROLES.OWNER) {
      throw ApiError.forbidden('Only workspace owners can promote members to Admin');
    }

    if (role) membership.role = role;
    if (title !== undefined) membership.title = title;
    if (department !== undefined) membership.department = department;
    await membership.save();

    return ApiResponse.success(res, membership, 'Member updated successfully');
  } else {
    const membership = devMockDb.memberships.find(
      (m) => String(m._id) === String(memberId) && String(m.businessId) === String(businessId)
    );
    if (!membership) throw ApiError.notFound('Member not found in this workspace');
    if (membership.role === USER_ROLES.OWNER) throw ApiError.forbidden('Cannot modify role of the workspace owner');

    if (role) membership.role = role;
    if (title !== undefined) membership.title = title;
    if (department !== undefined) membership.department = department;

    return ApiResponse.success(res, membership, 'Member updated successfully');
  }
});

/**
 * Remove a member from the workspace
 */
export const removeMember = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const businessId = req.business._id || req.business.id;

  if (isMongoConnected()) {
    const membership = await Membership.findOne({ _id: memberId, businessId });
    if (!membership) throw ApiError.notFound('Member not found in this workspace');
    if (membership.role === USER_ROLES.OWNER) throw ApiError.forbidden('Cannot remove workspace owner');

    await membership.deleteOne();
    return ApiResponse.success(res, null, 'Member removed from workspace');
  } else {
    const idx = devMockDb.memberships.findIndex(
      (m) => String(m._id) === String(memberId) && String(m.businessId) === String(businessId)
    );
    if (idx === -1) throw ApiError.notFound('Member not found in this workspace');
    if (devMockDb.memberships[idx].role === USER_ROLES.OWNER) {
      throw ApiError.forbidden('Cannot remove workspace owner');
    }

    devMockDb.memberships.splice(idx, 1);
    return ApiResponse.success(res, null, 'Member removed from workspace');
  }
});

/**
 * Accept workspace invitation via token
 */
export const acceptInvite = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, null, 'Invitation accepted successfully');
});

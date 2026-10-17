import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { verifyAccessToken } from '../utils/token.js';
import User from '../models/User.js';
import Business from '../models/Business.js';
import Membership from '../models/Membership.js';
import devMockDb from '../services/devMockDb.js';
import { USER_STATUS, MEMBERSHIP_STATUS, ROLE_HIERARCHY, USER_ROLES } from '../constants/index.js';

/**
 * Require valid Access Token
 */
export const requireAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Authentication token missing or invalid');
  }

  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Access token has expired');
    }
    throw ApiError.unauthorized('Invalid access token');
  }

  let user = null;
  if (mongoose.connection.readyState === 1) {
    user = await User.findById(decoded.userId);
  } else {
    user = devMockDb.findUserById(decoded.userId);
  }

  if (!user) {
    throw ApiError.unauthorized('User not found');
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    throw ApiError.forbidden(`Your account has been ${user.status}. Please contact support.`);
  }

  req.user = user;
  next();
});

/**
 * Resolve and verify the active business workspace for tenant isolation
 * Reads from X-Business-ID header or query param. Verifies membership in database.
 */
export const resolveActiveBusiness = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required to resolve business');
  }

  const requestedBusinessId = req.headers['x-business-id'] || req.query.businessId;

  if (mongoose.connection.readyState === 1) {
    let membership = null;
    if (requestedBusinessId) {
      membership = await Membership.findOne({
        userId: req.user._id,
        businessId: requestedBusinessId,
        status: MEMBERSHIP_STATUS.ACTIVE,
      }).populate('businessId');
    } else {
      membership = await Membership.findOne({
        userId: req.user._id,
        status: MEMBERSHIP_STATUS.ACTIVE,
      })
        .sort({ createdAt: 1 })
        .populate('businessId');
    }

    if (membership && membership.businessId && membership.businessId.status === 'active') {
      req.business = membership.businessId;
      req.membership = membership;
      req.role = membership.role;
    } else {
      req.business = null;
      req.membership = null;
      req.role = null;
    }
  } else {
    // In-memory fallback
    const userMemberships = devMockDb.findMembershipsByUser(req.user._id || req.user.id);
    let membership = null;

    if (requestedBusinessId) {
      membership = userMemberships.find(
        (m) =>
          (String(m.businessId) === String(requestedBusinessId) ||
            String(m.businessId?._id) === String(requestedBusinessId)) &&
          m.status === MEMBERSHIP_STATUS.ACTIVE
      );
    } else {
      membership = userMemberships[0] || null;
    }

    if (membership) {
      const biz = devMockDb.findBusinessById(membership.businessId);
      req.business = biz || null;
      req.membership = membership;
      req.role = membership.role;
    } else {
      req.business = null;
      req.membership = null;
      req.role = null;
    }
  }

  next();
});

/**
 * Enforces that an active business is selected and verified
 */
export const requireBusiness = asyncHandler(async (req, res, next) => {
  if (!req.business || !req.membership) {
    throw ApiError.forbidden('No active business workspace found or access denied');
  }
  next();
});

/**
 * Enforce exact allowed roles (e.g. ['owner', 'admin'])
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.role) {
      return next(ApiError.forbidden('No role assigned for this business workspace'));
    }

    // Owner always has access
    if (req.role === USER_ROLES.OWNER || allowedRoles.includes(req.role)) {
      return next();
    }

    return next(ApiError.forbidden(`Access restricted to roles: ${allowedRoles.join(', ')}`));
  };
};

/**
 * Enforce minimum role in the hierarchy
 */
export const requireMinRole = (minRole) => {
  return (req, res, next) => {
    if (!req.role) {
      return next(ApiError.forbidden('No role assigned for this business workspace'));
    }

    const userRoleIndex = ROLE_HIERARCHY.indexOf(req.role);
    const minRoleIndex = ROLE_HIERARCHY.indexOf(minRole);

    if (userRoleIndex === -1 || minRoleIndex === -1) {
      return next(ApiError.forbidden('Invalid role definition'));
    }

    if (userRoleIndex >= minRoleIndex) {
      return next();
    }

    return next(ApiError.forbidden(`Insufficient permissions. Requires at least ${minRole} level.`));
  };
};

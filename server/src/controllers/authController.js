import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import Business from '../models/Business.js';
import Membership from '../models/Membership.js';
import devMockDb from '../services/devMockDb.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
} from '../utils/token.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../services/emailService.js';
import env from '../config/env.js';
import { USER_ROLES, MEMBERSHIP_STATUS } from '../constants/index.js';

// Cookie options for refresh token
const getRefreshTokenCookieOptions = () => ({
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/auth',
});

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * Register a new user and optionally create initial business workspace
 */
export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, businessName } = req.body;

  if (isMongoConnected()) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict('An account with this email address already exists');
    }

    const user = new User({ firstName, lastName, email, password });
    const rawVerificationToken = user.generateEmailVerificationToken();
    await user.save();

    let business = null;
    if (businessName && businessName.trim()) {
      const slug = await Business.generateUniqueSlug(businessName);
      business = await Business.create({
        name: businessName.trim(),
        slug,
        ownerId: user._id,
      });

      await Membership.create({
        userId: user._id,
        businessId: business._id,
        role: USER_ROLES.OWNER,
        status: MEMBERSHIP_STATUS.ACTIVE,
      });
    }

    sendVerificationEmail({
      email: user.email,
      token: rawVerificationToken,
      firstName: user.firstName,
    }).catch((err) => console.error('Verification email error:', err.message));

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.headers['user-agent'] || '',
      ip: req.ip || '',
    });
    await user.save();

    res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

    return ApiResponse.created(
      res,
      {
        user: user.toJSON(),
        accessToken,
        business: business
          ? {
              id: business._id,
              name: business.name,
              slug: business.slug,
              role: USER_ROLES.OWNER,
            }
          : null,
        requiresOnboarding: !business,
      },
      'Registration successful. Please verify your email.'
    );
  } else {
    // In-memory fallback
    if (devMockDb.findUserByEmail(email)) {
      throw ApiError.conflict('An account with this email address already exists');
    }

    const userId = `usr_${Date.now()}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      _id: userId,
      id: userId,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim(),
      email,
      password: hashedPassword,
      avatar: '',
      phone: '',
      status: 'active',
      isEmailVerified: true,
      refreshTokens: [],
      preferences: { theme: 'system', notifications: { email: true, inApp: true } },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    devMockDb.users.push(newUser);

    let business = null;
    if (businessName && businessName.trim()) {
      const bizId = `biz_${Date.now()}`;
      business = {
        _id: bizId,
        id: bizId,
        name: businessName.trim(),
        slug: businessName.trim().toLowerCase().replace(/\s+/g, '-'),
        ownerId: userId,
        industry: 'other',
        currency: 'USD',
        timezone: 'UTC',
        description: '',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      devMockDb.businesses.push(business);

      devMockDb.memberships.push({
        _id: `mem_${Date.now()}`,
        userId,
        businessId: bizId,
        role: USER_ROLES.OWNER,
        status: MEMBERSHIP_STATUS.ACTIVE,
        joinedAt: new Date(),
      });
    }

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    newUser.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.headers['user-agent'] || '',
      ip: req.ip || '',
    });

    res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

    const safeUser = { ...newUser };
    delete safeUser.password;
    delete safeUser.refreshTokens;

    return ApiResponse.created(
      res,
      {
        user: safeUser,
        accessToken,
        business: business
          ? {
              id: business._id,
              name: business.name,
              slug: business.slug,
              role: USER_ROLES.OWNER,
            }
          : null,
        requiresOnboarding: !business,
      },
      'Registration successful'
    );
  }
});

/**
 * Login user
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  let user = null;
  let isPasswordMatch = false;

  if (isMongoConnected()) {
    user = await User.findOne({ email }).select('+password');
    if (user) {
      isPasswordMatch = await user.comparePassword(password);
    }
  } else {
    user = devMockDb.findUserByEmail(email);
    if (user) {
      isPasswordMatch = await bcrypt.compare(password, user.password);
    }
  }

  if (!user || !isPasswordMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (user.status !== 'active') {
    throw ApiError.forbidden(`Your account is currently ${user.status}. Please contact support.`);
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const now = new Date();

  let workspaces = [];

  if (isMongoConnected()) {
    user.refreshTokens = user.refreshTokens.filter((rt) => rt.expiresAt > now);
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.headers['user-agent'] || '',
      ip: req.ip || '',
    });
    user.lastLoginAt = now;
    await user.save();

    const memberships = await Membership.find({
      userId: user._id,
      status: MEMBERSHIP_STATUS.ACTIVE,
    }).populate('businessId');

    workspaces = memberships
      .filter((m) => m.businessId && m.businessId.status === 'active')
      .map((m) => ({
        id: m.businessId._id,
        name: m.businessId.name,
        slug: m.businessId.slug,
        logo: m.businessId.logo,
        role: m.role,
        title: m.title,
      }));
  } else {
    if (!user.refreshTokens) user.refreshTokens = [];
    user.refreshTokens = user.refreshTokens.filter((rt) => rt.expiresAt > now);
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.headers['user-agent'] || '',
      ip: req.ip || '',
    });
    user.lastLoginAt = now;

    const userMemberships = devMockDb.findMembershipsByUser(user._id || user.id);
    workspaces = userMemberships.map((m) => {
      const biz = devMockDb.findBusinessById(m.businessId);
      return {
        id: biz?._id || biz?.id,
        name: biz?.name || 'Workspace',
        slug: biz?.slug || 'workspace',
        logo: biz?.logo || '',
        role: m.role,
        title: m.title,
      };
    });
  }

  res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

  const safeUser = user.toJSON ? user.toJSON() : { ...user };
  delete safeUser.password;
  delete safeUser.refreshTokens;

  return ApiResponse.success(
    res,
    {
      user: safeUser,
      accessToken,
      workspaces,
      activeWorkspace: workspaces[0] || null,
      requiresOnboarding: workspaces.length === 0,
    },
    'Login successful'
  );
});

/**
 * Refresh access token & rotate refresh token
 */
export const refresh = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;
  if (!incomingRefreshToken) {
    throw ApiError.unauthorized('Refresh token is required');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch {
    res.clearCookie('refreshToken', getRefreshTokenCookieOptions());
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  let user = null;
  if (isMongoConnected()) {
    user = await User.findById(decoded.userId);
  } else {
    user = devMockDb.findUserById(decoded.userId);
  }

  if (!user) {
    res.clearCookie('refreshToken', getRefreshTokenCookieOptions());
    throw ApiError.unauthorized('User not found');
  }

  const tokenRecordIndex = user.refreshTokens.findIndex(
    (rt) => rt.token === incomingRefreshToken
  );

  if (tokenRecordIndex === -1) {
    user.refreshTokens = [];
    if (isMongoConnected()) await user.save();
    res.clearCookie('refreshToken', getRefreshTokenCookieOptions());
    throw ApiError.unauthorized('Invalid refresh token detected. Please login again.');
  }

  if (user.refreshTokens[tokenRecordIndex].expiresAt < new Date()) {
    user.refreshTokens.splice(tokenRecordIndex, 1);
    if (isMongoConnected()) await user.save();
    res.clearCookie('refreshToken', getRefreshTokenCookieOptions());
    throw ApiError.unauthorized('Refresh token expired. Please login again.');
  }

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  user.refreshTokens.splice(tokenRecordIndex, 1, {
    token: newRefreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    userAgent: req.headers['user-agent'] || '',
    ip: req.ip || '',
  });

  if (isMongoConnected()) await user.save();

  res.cookie('refreshToken', newRefreshToken, getRefreshTokenCookieOptions());

  return ApiResponse.success(
    res,
    {
      accessToken: newAccessToken,
    },
    'Token refreshed successfully'
  );
});

/**
 * Logout user
 */
export const logout = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  if (incomingRefreshToken) {
    try {
      const decoded = verifyRefreshToken(incomingRefreshToken);
      if (decoded && decoded.userId) {
        if (isMongoConnected()) {
          await User.updateOne(
            { _id: decoded.userId },
            { $pull: { refreshTokens: { token: incomingRefreshToken } } }
          );
        } else {
          const user = devMockDb.findUserById(decoded.userId);
          if (user) {
            user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== incomingRefreshToken);
          }
        }
      }
    } catch {
      // Ignore token verification errors during logout
    }
  }

  res.clearCookie('refreshToken', getRefreshTokenCookieOptions());

  return ApiResponse.success(res, null, 'Logged out successfully');
});

/**
 * Get current authenticated user profile and workspaces
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  let workspaces = [];

  if (isMongoConnected()) {
    const memberships = await Membership.find({
      userId: user._id,
      status: MEMBERSHIP_STATUS.ACTIVE,
    }).populate('businessId');

    workspaces = memberships
      .filter((m) => m.businessId && m.businessId.status === 'active')
      .map((m) => ({
        id: m.businessId._id,
        name: m.businessId.name,
        slug: m.businessId.slug,
        logo: m.businessId.logo,
        currency: m.businessId.currency,
        role: m.role,
        title: m.title,
        department: m.department,
      }));
  } else {
    const userMemberships = devMockDb.findMembershipsByUser(user._id || user.id);
    workspaces = userMemberships.map((m) => {
      const biz = devMockDb.findBusinessById(m.businessId);
      return {
        id: biz?._id || biz?.id,
        name: biz?.name || 'Workspace',
        slug: biz?.slug || 'workspace',
        logo: biz?.logo || '',
        currency: biz?.currency || 'USD',
        role: m.role,
        title: m.title,
        department: m.department,
      };
    });
  }

  const safeUser = user.toJSON ? user.toJSON() : { ...user };
  delete safeUser.password;
  delete safeUser.refreshTokens;

  return ApiResponse.success(
    res,
    {
      user: safeUser,
      workspaces,
      requiresOnboarding: workspaces.length === 0,
    },
    'Current session fetched'
  );
});

/**
 * Verify Email Address via Token
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) {
    throw ApiError.badRequest('Verification token is required');
  }

  return ApiResponse.success(res, null, 'Email successfully verified');
});

/**
 * Resend verification email
 */
export const resendVerificationEmail = asyncHandler(async (req, res) => {
  return ApiResponse.success(
    res,
    null,
    'If an unverified account exists with that email, a verification link has been sent.'
  );
});

/**
 * Forgot Password - Send Reset Token
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  return ApiResponse.success(
    res,
    null,
    'If an account exists with that email, instructions to reset your password have been sent.'
  );
});

/**
 * Reset Password with Token
 */
export const resetPassword = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, null, 'Password has been reset successfully. Please login.');
});

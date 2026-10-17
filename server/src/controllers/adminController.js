import mongoose from 'mongoose';
import Business from '../models/Business.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import Plan, { DEFAULT_PLANS } from '../models/Plan.js';
import devMockDb from '../services/devMockDb.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * Super Admin Overview Metrics
 */
export const getAdminDashboard = asyncHandler(async (req, res) => {
  if (isMongoConnected()) {
    const [bizCount, userCount, subCount] = await Promise.all([
      Business.countDocuments(),
      User.countDocuments(),
      Subscription.countDocuments({ status: 'active' }),
    ]);

    // Calculate approximate MRR
    const subs = await Subscription.find({ status: 'active' });
    const mrr = subs.reduce((sum, s) => {
      const plan = DEFAULT_PLANS.find((p) => p.slug === s.planSlug);
      return sum + (plan ? plan.price : 0);
    }, 0);

    return ApiResponse.success(res, {
      totalBusinesses: bizCount,
      activeBusinesses: bizCount,
      totalUsers: userCount,
      paidSubscriptions: subCount,
      mrr,
      currency: 'USD',
    }, 'Admin dashboard metrics');
  } else {
    const bizCount = devMockDb.businesses.length;
    const userCount = devMockDb.users.length;
    const subCount = devMockDb.subscriptions.filter((s) => s.status === 'active').length;

    const mrr = devMockDb.subscriptions
      .filter((s) => s.status === 'active')
      .reduce((sum, s) => {
        const plan = DEFAULT_PLANS.find((p) => p.slug === s.planSlug);
        return sum + (plan ? plan.price : 0);
      }, 0);

    return ApiResponse.success(res, {
      totalBusinesses: bizCount,
      activeBusinesses: bizCount,
      totalUsers: userCount,
      paidSubscriptions: subCount,
      mrr: mrr || 108,
      currency: 'USD',
    }, 'Admin dashboard metrics');
  }
});

/**
 * Super Admin List Businesses
 */
export const listAdminBusinesses = asyncHandler(async (req, res) => {
  const { search, status } = req.query;

  if (isMongoConnected()) {
    const query = {};
    if (status && status !== 'ALL') query.status = status;
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { slug: regex }, { taxId: regex }];
    }

    const businesses = await Business.find(query).sort({ createdAt: -1 }).populate('ownerId', 'firstName lastName email');
    return ApiResponse.success(res, businesses, 'Businesses fetched');
  } else {
    let list = devMockDb.businesses;
    if (status && status !== 'ALL') list = list.filter((b) => b.status === status);
    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      list = list.filter((b) => b.name.toLowerCase().includes(term) || b.slug.toLowerCase().includes(term));
    }

    const populated = list.map((b) => {
      const owner = devMockDb.findUserById(b.ownerId);
      return {
        ...b,
        ownerId: owner ? { id: owner._id || owner.id, firstName: owner.firstName, lastName: owner.lastName, email: owner.email } : null,
      };
    });

    return ApiResponse.success(res, populated, 'Businesses fetched');
  }
});

/**
 * Super Admin Update Business Status (e.g. suspend or reactivate)
 */
export const updateBusinessStatus = asyncHandler(async (req, res) => {
  const { businessId } = req.params;
  const { status } = req.body;

  if (!['active', 'suspended'].includes(status)) {
    throw ApiError.badRequest('Invalid status');
  }

  if (isMongoConnected()) {
    const biz = await Business.findByIdAndUpdate(businessId, { $set: { status } }, { new: true });
    if (!biz) throw ApiError.notFound('Business not found');
    return ApiResponse.success(res, biz, `Business status set to ${status}`);
  } else {
    const biz = devMockDb.findBusinessById(businessId);
    if (!biz) throw ApiError.notFound('Business not found');
    biz.status = status;
    return ApiResponse.success(res, biz, `Business status set to ${status}`);
  }
});

/**
 * Super Admin List Users
 */
export const listAdminUsers = asyncHandler(async (req, res) => {
  const { search } = req.query;

  if (isMongoConnected()) {
    const query = {};
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ firstName: regex }, { lastName: regex }, { email: regex }];
    }
    const users = await User.find(query).select('-password -refreshTokens').sort({ createdAt: -1 });
    return ApiResponse.success(res, users, 'Users fetched');
  } else {
    let list = devMockDb.users.map((u) => {
      const safe = { ...u };
      delete safe.password;
      delete safe.refreshTokens;
      return safe;
    });

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      list = list.filter((u) => u.fullName.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
    }

    return ApiResponse.success(res, list, 'Users fetched');
  }
});

/**
 * Super Admin List Plans
 */
export const listAdminPlans = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, DEFAULT_PLANS, 'Platform plans fetched');
});

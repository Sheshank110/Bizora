import mongoose from 'mongoose';
import Subscription, { SUBSCRIPTION_STATUS } from '../models/Subscription.js';
import Plan, { DEFAULT_PLANS } from '../models/Plan.js';
import Customer from '../models/Customer.js';
import Membership from '../models/Membership.js';
import Project from '../models/Project.js';
import Invoice from '../models/Invoice.js';
import devMockDb from '../services/devMockDb.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * Get active business subscription & plan limits
 */
export const getSubscription = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;

  let currentPlanSlug = 'pro';
  let status = 'active';
  let periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  let currentUsage = {
    employees: 0,
    customers: 0,
    projects: 0,
    invoices: 0,
  };

  if (isMongoConnected()) {
    const sub = await Subscription.findOne({ businessId });
    if (sub) {
      currentPlanSlug = sub.planSlug;
      status = sub.status;
      periodEnd = sub.currentPeriodEnd;
    }

    const [empCount, custCount, projCount, invCount] = await Promise.all([
      Membership.countDocuments({ businessId, status: 'active' }),
      Customer.countDocuments({ businessId, status: { $ne: 'ARCHIVED' } }),
      Project.countDocuments({ businessId }),
      Invoice.countDocuments({ businessId }),
    ]);

    currentUsage = {
      employees: empCount,
      customers: custCount,
      projects: projCount,
      invoices: invCount,
    };
  } else {
    const sub = devMockDb.findSubscriptionByBusiness(businessId);
    if (sub) {
      currentPlanSlug = sub.planSlug;
      status = sub.status;
      periodEnd = sub.currentPeriodEnd;
    }

    currentUsage = {
      employees: devMockDb.findMembershipsByBusiness(businessId).length,
      customers: devMockDb.findCustomersByBusiness(businessId).filter((c) => c.status !== 'ARCHIVED').length,
      projects: devMockDb.findProjectsByBusiness(businessId).length,
      invoices: devMockDb.findInvoicesByBusiness(businessId).length,
    };
  }

  const currentPlan = DEFAULT_PLANS.find((p) => p.slug === currentPlanSlug) || DEFAULT_PLANS[2];

  return ApiResponse.success(
    res,
    {
      plan: currentPlan.slug,
      status,
      limits: currentPlan.limits,
      subscription: {
        planSlug: currentPlanSlug,
        planName: currentPlan.name,
        price: currentPlan.price,
        status,
        currentPeriodEnd: periodEnd,
      },
      currentPlan,
      usage: currentUsage,
      availablePlans: DEFAULT_PLANS,
    },
    'Subscription fetched successfully'
  );
});

/**
 * Change or Upgrade plan
 */
export const changePlan = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const { planSlug } = req.body;

  const validPlan = DEFAULT_PLANS.find((p) => p.slug === planSlug?.toLowerCase());
  if (!validPlan) throw ApiError.badRequest('Invalid plan selection');

  if (isMongoConnected()) {
    let sub = await Subscription.findOne({ businessId });
    if (!sub) {
      sub = new Subscription({ businessId, planSlug: validPlan.slug });
    } else {
      sub.planSlug = validPlan.slug;
      sub.status = SUBSCRIPTION_STATUS.ACTIVE;
    }
    await sub.save();

    return ApiResponse.success(res, { plan: validPlan, status: 'active' }, `Upgraded to ${validPlan.name} plan`);
  } else {
    let sub = devMockDb.findSubscriptionByBusiness(businessId);
    if (!sub) {
      sub = {
        _id: `sub_${Date.now()}`,
        businessId,
        planSlug: validPlan.slug,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
      devMockDb.subscriptions.push(sub);
    } else {
      sub.planSlug = validPlan.slug;
      sub.status = 'active';
    }

    return ApiResponse.success(res, { plan: validPlan, status: 'active' }, `Upgraded to ${validPlan.name} plan`);
  }
});

/**
 * Cancel subscription
 */
export const cancelSubscription = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;

  if (isMongoConnected()) {
    const sub = await Subscription.findOneAndUpdate(
      { businessId },
      { $set: { cancelAtPeriodEnd: true, status: SUBSCRIPTION_STATUS.CANCELLED } },
      { new: true }
    );
    return ApiResponse.success(res, sub, 'Subscription set to cancel at end of billing cycle');
  } else {
    const sub = devMockDb.findSubscriptionByBusiness(businessId);
    if (sub) {
      sub.cancelAtPeriodEnd = true;
      sub.status = 'cancelled';
    }
    return ApiResponse.success(res, sub, 'Subscription set to cancel at end of billing cycle');
  }
});

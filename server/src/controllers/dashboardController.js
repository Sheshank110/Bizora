import mongoose from 'mongoose';
import Customer from '../models/Customer.js';
import Membership from '../models/Membership.js';
import devMockDb from '../services/devMockDb.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * Get real metrics for the active business dashboard
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;

  let totalCustomers = 0;
  let activeEmployees = 0;
  let newCustomersThisMonth = 0;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  if (isMongoConnected()) {
    const [custCount, memCount, newCustCount] = await Promise.all([
      Customer.countDocuments({ businessId, status: { $ne: 'ARCHIVED' } }),
      Membership.countDocuments({ businessId, status: 'active' }),
      Customer.countDocuments({
        businessId,
        status: { $ne: 'ARCHIVED' },
        createdAt: { $gte: startOfMonth },
      }),
    ]);

    totalCustomers = custCount;
    activeEmployees = memCount;
    newCustomersThisMonth = newCustCount;
  } else {
    const customers = devMockDb.findCustomersByBusiness(businessId).filter((c) => c.status !== 'ARCHIVED');
    const members = devMockDb.findMembershipsByBusiness(businessId);

    totalCustomers = customers.length;
    activeEmployees = members.length;
    newCustomersThisMonth = customers.filter((c) => new Date(c.createdAt) >= startOfMonth).length;
  }

  return ApiResponse.success(
    res,
    {
      totalCustomers,
      activeEmployees,
      newCustomersThisMonth,
      customers: {
        total: totalCustomers,
        active: totalCustomers,
        newThisMonth: newCustomersThisMonth,
      },
      employees: {
        active: activeEmployees,
        total: activeEmployees,
      },
      currency: req.business.currency || 'USD',
    },
    'Dashboard statistics fetched'
  );
});

import mongoose from 'mongoose';
import Customer, { CUSTOMER_STATUS } from '../models/Customer.js';
import CustomerActivity, { ACTIVITY_TYPES } from '../models/CustomerActivity.js';
import Membership from '../models/Membership.js';
import User from '../models/User.js';
import devMockDb from '../services/devMockDb.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * List customers with server-side pagination, search, filter, and sorting
 */
export const listCustomers = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const { search, status, assignedEmployee, source, tag, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const allowedSortFields = ['createdAt', 'updatedAt', 'firstName', 'lastName', 'company'];
  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  if (isMongoConnected()) {
    const query = { businessId };

    // Status filter (default excludes ARCHIVED unless explicitly requested)
    if (status && status !== 'ALL') {
      query.status = status;
    } else if (!status) {
      query.status = { $ne: CUSTOMER_STATUS.ARCHIVED };
    }

    if (assignedEmployee) {
      query.assignedEmployee = assignedEmployee;
    }

    if (source) {
      query.source = source;
    }

    if (tag) {
      query.tags = tag;
    }

    if (search && search.trim()) {
      const s = search.trim();
      const regex = new RegExp(s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
      query.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { phone: regex },
        { company: regex },
      ];
    }

    const [total, customers] = await Promise.all([
      Customer.countDocuments(query),
      Customer.find(query)
        .sort({ [safeSortBy]: sortDirection })
        .skip(skip)
        .limit(limit)
        .populate('assignedEmployee', 'firstName lastName email avatar')
        .populate('createdBy', 'firstName lastName email'),
    ]);

    return ApiResponse.success(
      res,
      customers,
      'Customers fetched successfully',
      200,
      {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      }
    );
  } else {
    // In-memory dual-mode filter
    let list = devMockDb.findCustomersByBusiness(businessId);

    if (status && status !== 'ALL') {
      list = list.filter((c) => c.status === status);
    } else if (!status) {
      list = list.filter((c) => c.status !== CUSTOMER_STATUS.ARCHIVED);
    }

    if (assignedEmployee) {
      list = list.filter((c) => String(c.assignedEmployee) === String(assignedEmployee));
    }

    if (source) {
      list = list.filter((c) => c.source === source);
    }

    if (tag) {
      list = list.filter((c) => Array.isArray(c.tags) && c.tags.includes(tag));
    }

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.firstName.toLowerCase().includes(term) ||
          c.lastName.toLowerCase().includes(term) ||
          (c.email && c.email.toLowerCase().includes(term)) ||
          (c.phone && c.phone.includes(term)) ||
          (c.company && c.company.toLowerCase().includes(term))
      );
    }

    list.sort((a, b) => {
      let valA = a[safeSortBy] || '';
      let valB = b[safeSortBy] || '';
      if (valA instanceof Date) valA = valA.getTime();
      if (valB instanceof Date) valB = valB.getTime();
      if (valA < valB) return -1 * sortDirection;
      if (valA > valB) return 1 * sortDirection;
      return 0;
    });

    const total = list.length;
    const paginated = list.slice(skip, skip + limit).map((c) => {
      const assigned = c.assignedEmployee ? devMockDb.findUserById(c.assignedEmployee) : null;
      const creator = c.createdBy ? devMockDb.findUserById(c.createdBy) : null;
      return {
        ...c,
        assignedEmployee: assigned
          ? {
              id: assigned._id || assigned.id,
              firstName: assigned.firstName,
              lastName: assigned.lastName,
              email: assigned.email,
              avatar: assigned.avatar || '',
            }
          : null,
        createdBy: creator
          ? {
              id: creator._id || creator.id,
              firstName: creator.firstName,
              lastName: creator.lastName,
              email: creator.email,
            }
          : null,
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Customers fetched successfully',
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  }
});

/**
 * Create a new customer
 */
export const createCustomer = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const userId = req.user._id || req.user.id;
  const {
    firstName,
    lastName,
    phone,
    email,
    company,
    jobTitle,
    address,
    tags,
    status,
    source,
    assignedEmployee,
    notesSummary,
  } = req.body;

  // Validate assignedEmployee belongs to business if supplied
  if (assignedEmployee) {
    if (isMongoConnected()) {
      const mem = await Membership.findOne({
        userId: assignedEmployee,
        businessId,
        status: 'active',
      });
      if (!mem) {
        throw ApiError.badRequest('Assigned employee does not belong to this active workspace');
      }
    } else {
      const mems = devMockDb.findMembershipsByBusiness(businessId);
      const isMember = mems.some((m) => String(m.userId) === String(assignedEmployee));
      if (!isMember) {
        throw ApiError.badRequest('Assigned employee does not belong to this active workspace');
      }
    }
  }

  if (isMongoConnected()) {
    const customer = await Customer.create({
      businessId,
      firstName,
      lastName,
      phone,
      email: email || '',
      company: company || '',
      jobTitle: jobTitle || '',
      address: address || {},
      tags: tags || [],
      status: status || CUSTOMER_STATUS.ACTIVE,
      source: source || 'OTHER',
      assignedEmployee: assignedEmployee || null,
      notesSummary: notesSummary || '',
      createdBy: userId,
    });

    // Record Activity
    await CustomerActivity.create({
      businessId,
      customerId: customer._id,
      userId,
      type: ACTIVITY_TYPES.CREATED,
      metadata: {
        name: `${customer.firstName} ${customer.lastName}`,
        company: customer.company,
      },
    });

    return ApiResponse.created(res, customer, 'Customer created successfully');
  } else {
    const custId = `cust_${Date.now()}`;
    const newCust = {
      _id: custId,
      id: custId,
      businessId,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim(),
      phone,
      email: email || '',
      company: company || '',
      jobTitle: jobTitle || '',
      address: address || {},
      tags: tags || [],
      status: status || CUSTOMER_STATUS.ACTIVE,
      source: source || 'OTHER',
      assignedEmployee: assignedEmployee || null,
      notesSummary: notesSummary || '',
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    devMockDb.customers.unshift(newCust);

    devMockDb.customerActivities.unshift({
      _id: `act_${Date.now()}`,
      id: `act_${Date.now()}`,
      businessId,
      customerId: custId,
      userId,
      type: ACTIVITY_TYPES.CREATED,
      metadata: {
        name: `${firstName} ${lastName}`,
        company: company || '',
      },
      createdAt: new Date(),
    });

    return ApiResponse.created(res, newCust, 'Customer created successfully');
  }
});

/**
 * Get customer by ID (strict tenant isolation)
 */
export const getCustomerById = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const { customerId } = req.params;

  if (isMongoConnected()) {
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      throw ApiError.badRequest('Invalid customer ID format');
    }

    const customer = await Customer.findOne({
      _id: customerId,
      businessId,
    })
      .populate('assignedEmployee', 'firstName lastName email avatar')
      .populate('createdBy', 'firstName lastName email');

    if (!customer) {
      throw ApiError.notFound('Customer not found in this workspace');
    }

    return ApiResponse.success(res, customer, 'Customer details fetched');
  } else {
    const customer = devMockDb.findCustomerById(customerId, businessId);
    if (!customer) {
      throw ApiError.notFound('Customer not found in this workspace');
    }

    const assigned = customer.assignedEmployee ? devMockDb.findUserById(customer.assignedEmployee) : null;
    const creator = customer.createdBy ? devMockDb.findUserById(customer.createdBy) : null;

    return ApiResponse.success(
      res,
      {
        ...customer,
        assignedEmployee: assigned
          ? {
              id: assigned._id || assigned.id,
              firstName: assigned.firstName,
              lastName: assigned.lastName,
              email: assigned.email,
              avatar: assigned.avatar || '',
            }
          : null,
        createdBy: creator
          ? {
              id: creator._id || creator.id,
              firstName: creator.firstName,
              lastName: creator.lastName,
              email: creator.email,
            }
          : null,
      },
      'Customer details fetched'
    );
  }
});

/**
 * Update customer details
 */
export const updateCustomer = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const userId = req.user._id || req.user.id;
  const { customerId } = req.params;
  const updates = req.body;

  if (isMongoConnected()) {
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      throw ApiError.badRequest('Invalid customer ID format');
    }

    const customer = await Customer.findOne({ _id: customerId, businessId });
    if (!customer) {
      throw ApiError.notFound('Customer not found in this workspace');
    }

    const oldStatus = customer.status;
    const oldAssigned = customer.assignedEmployee ? customer.assignedEmployee.toString() : null;

    // Apply updates
    Object.keys(updates).forEach((key) => {
      if (key !== '_id' && key !== 'businessId' && key !== 'createdBy') {
        customer[key] = updates[key];
      }
    });

    await customer.save();

    // Log Activity for status change or assignment change
    if (updates.status && updates.status !== oldStatus) {
      await CustomerActivity.create({
        businessId,
        customerId: customer._id,
        userId,
        type: ACTIVITY_TYPES.STATUS_CHANGED,
        metadata: { from: oldStatus, to: updates.status },
      });
    }

    if (updates.assignedEmployee !== undefined && updates.assignedEmployee !== oldAssigned) {
      let assigneeName = 'Unassigned';
      if (updates.assignedEmployee) {
        const u = await User.findById(updates.assignedEmployee);
        if (u) assigneeName = `${u.firstName} ${u.lastName}`.trim();
      }
      await CustomerActivity.create({
        businessId,
        customerId: customer._id,
        userId,
        type: ACTIVITY_TYPES.ASSIGNED,
        metadata: { assignedToName: assigneeName },
      });
    }

    return ApiResponse.success(res, customer, 'Customer updated successfully');
  } else {
    const customer = devMockDb.findCustomerById(customerId, businessId);
    if (!customer) {
      throw ApiError.notFound('Customer not found in this workspace');
    }

    const oldStatus = customer.status;
    const oldAssigned = customer.assignedEmployee;

    Object.assign(customer, updates, { updatedAt: new Date() });
    if (updates.firstName || updates.lastName) {
      customer.fullName = `${customer.firstName} ${customer.lastName}`.trim();
    }

    if (updates.status && updates.status !== oldStatus) {
      devMockDb.customerActivities.unshift({
        _id: `act_${Date.now()}`,
        businessId,
        customerId,
        userId,
        type: ACTIVITY_TYPES.STATUS_CHANGED,
        metadata: { from: oldStatus, to: updates.status },
        createdAt: new Date(),
      });
    }

    if (updates.assignedEmployee !== undefined && updates.assignedEmployee !== oldAssigned) {
      let assigneeName = 'Unassigned';
      if (updates.assignedEmployee) {
        const u = devMockDb.findUserById(updates.assignedEmployee);
        if (u) assigneeName = u.fullName || `${u.firstName} ${u.lastName}`;
      }
      devMockDb.customerActivities.unshift({
        _id: `act_${Date.now()}`,
        businessId,
        customerId,
        userId,
        type: ACTIVITY_TYPES.ASSIGNED,
        metadata: { assignedToName: assigneeName },
        createdAt: new Date(),
      });
    }

    return ApiResponse.success(res, customer, 'Customer updated successfully');
  }
});

/**
 * Archive customer (soft delete)
 */
export const archiveCustomer = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const userId = req.user._id || req.user.id;
  const { customerId } = req.params;

  if (isMongoConnected()) {
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      throw ApiError.badRequest('Invalid customer ID format');
    }

    const customer = await Customer.findOne({ _id: customerId, businessId });
    if (!customer) {
      throw ApiError.notFound('Customer not found in this workspace');
    }

    customer.status = CUSTOMER_STATUS.ARCHIVED;
    await customer.save();

    await CustomerActivity.create({
      businessId,
      customerId: customer._id,
      userId,
      type: ACTIVITY_TYPES.ARCHIVED,
      metadata: { name: `${customer.firstName} ${customer.lastName}` },
    });

    return ApiResponse.success(res, customer, 'Customer archived successfully');
  } else {
    const customer = devMockDb.findCustomerById(customerId, businessId);
    if (!customer) {
      throw ApiError.notFound('Customer not found in this workspace');
    }

    customer.status = CUSTOMER_STATUS.ARCHIVED;
    customer.updatedAt = new Date();

    devMockDb.customerActivities.unshift({
      _id: `act_${Date.now()}`,
      businessId,
      customerId,
      userId,
      type: ACTIVITY_TYPES.ARCHIVED,
      metadata: { name: customer.fullName },
      createdAt: new Date(),
    });

    return ApiResponse.success(res, customer, 'Customer archived successfully');
  }
});

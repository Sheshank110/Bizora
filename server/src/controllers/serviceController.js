import mongoose from 'mongoose';
import Service, { SERVICE_STATUS } from '../models/Service.js';
import devMockDb from '../services/devMockDb.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * List services with search, category, status & pagination
 */
export const listServices = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const { search, category, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  if (isMongoConnected()) {
    const query = { businessId };
    if (status && status !== 'ALL') {
      query.status = status;
    } else if (!status) {
      query.status = { $ne: SERVICE_STATUS.ARCHIVED };
    }

    if (category && category !== 'ALL') {
      query.category = category;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
      query.$or = [{ name: regex }, { description: regex }, { category: regex }];
    }

    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const allowedSort = ['createdAt', 'updatedAt', 'name', 'price', 'category'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'createdAt';

    const [total, services] = await Promise.all([
      Service.countDocuments(query),
      Service.find(query).sort({ [safeSort]: sortDirection }).skip(skip).limit(limit),
    ]);

    return ApiResponse.success(res, services, 'Services fetched successfully', {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } else {
    let list = devMockDb.findServicesByBusiness(businessId);
    if (status && status !== 'ALL') {
      list = list.filter((s) => s.status === status);
    } else if (!status) {
      list = list.filter((s) => s.status !== SERVICE_STATUS.ARCHIVED);
    }

    if (category && category !== 'ALL') {
      list = list.filter((s) => s.category.toLowerCase() === category.toLowerCase());
    }

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          (s.name || '').toLowerCase().includes(term) ||
          (s.description || '').toLowerCase().includes(term) ||
          (s.category || '').toLowerCase().includes(term)
      );
    }

    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      let valA = a[sortBy] ?? '';
      let valB = b[sortBy] ?? '';
      if (valA < valB) return -1 * sortDirection;
      if (valA > valB) return 1 * sortDirection;
      return 0;
    });

    const total = list.length;
    const paginated = list.slice(skip, skip + limit);

    return ApiResponse.success(res, paginated, 'Services fetched successfully', {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  }
});

/**
 * Get service by ID
 */
export const getServiceById = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const { serviceId } = req.params;

  if (isMongoConnected()) {
    const service = await Service.findOne({ _id: serviceId, businessId });
    if (!service) throw ApiError.notFound('Service not found in this workspace');
    return ApiResponse.success(res, service, 'Service fetched successfully');
  } else {
    const s = devMockDb.findServiceById(serviceId, businessId);
    if (!s) throw ApiError.notFound('Service not found in this workspace');
    return ApiResponse.success(res, s, 'Service fetched successfully');
  }
});

/**
 * Create service
 */
export const createService = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const userId = req.user._id || req.user.id;
  const { name, description, category, price, currency, duration, tax, status, image } = req.body;

  if (!name || !name.trim()) throw ApiError.badRequest('Service name is required');
  if (price === undefined || price === null || price < 0) throw ApiError.badRequest('Valid price is required');

  if (isMongoConnected()) {
    const service = await Service.create({
      businessId,
      name: name.trim(),
      description: description || '',
      category: category || 'General',
      price: Number(price),
      currency: currency || req.business.currency || 'USD',
      duration: Number(duration) || 60,
      tax: Number(tax) || 0,
      status: status || SERVICE_STATUS.ACTIVE,
      image: image || '',
      createdBy: userId,
    });
    return ApiResponse.created(res, service, 'Service created successfully');
  } else {
    const newService = {
      _id: `srv_${Date.now()}`,
      id: `srv_${Date.now()}`,
      businessId,
      name: name.trim(),
      description: description || '',
      category: category || 'General',
      price: Number(price),
      currency: currency || req.business.currency || 'USD',
      duration: Number(duration) || 60,
      tax: Number(tax) || 0,
      status: status || SERVICE_STATUS.ACTIVE,
      image: image || '',
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    devMockDb.services.unshift(newService);
    return ApiResponse.created(res, newService, 'Service created successfully');
  }
});

/**
 * Update service
 */
export const updateService = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const { serviceId } = req.params;

  if (isMongoConnected()) {
    const service = await Service.findOneAndUpdate(
      { _id: serviceId, businessId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!service) throw ApiError.notFound('Service not found');
    return ApiResponse.success(res, service, 'Service updated successfully');
  } else {
    const idx = devMockDb.services.findIndex((s) => (s._id === serviceId || s.id === serviceId) && String(s.businessId) === String(businessId));
    if (idx === -1) throw ApiError.notFound('Service not found');

    devMockDb.services[idx] = {
      ...devMockDb.services[idx],
      ...req.body,
      updatedAt: new Date(),
    };
    return ApiResponse.success(res, devMockDb.services[idx], 'Service updated successfully');
  }
});

/**
 * Soft delete / Archive service
 */
export const deleteService = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const { serviceId } = req.params;

  if (isMongoConnected()) {
    const service = await Service.findOneAndUpdate(
      { _id: serviceId, businessId },
      { $set: { status: SERVICE_STATUS.ARCHIVED } },
      { new: true }
    );
    if (!service) throw ApiError.notFound('Service not found');
    return ApiResponse.success(res, service, 'Service archived successfully');
  } else {
    const s = devMockDb.findServiceById(serviceId, businessId);
    if (!s) throw ApiError.notFound('Service not found');
    s.status = SERVICE_STATUS.ARCHIVED;
    return ApiResponse.success(res, s, 'Service archived successfully');
  }
});

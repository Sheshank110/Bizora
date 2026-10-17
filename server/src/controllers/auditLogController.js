import mongoose from 'mongoose';
import AuditLog from '../models/AuditLog.js';
import devMockDb from '../services/devMockDb.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * List audit logs with entity, action & pagination
 */
export const listAuditLogs = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const { entity, action, search } = req.query;

  if (isMongoConnected()) {
    const query = { businessId };
    if (entity && entity !== 'ALL') query.entity = entity;
    if (action && action !== 'ALL') query.action = action;

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ action: regex }, { entity: regex }, { ipAddress: regex }];
    }

    const [total, logs] = await Promise.all([
      AuditLog.countDocuments(query),
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'firstName lastName email avatar'),
    ]);

    return ApiResponse.success(res, logs, 'Audit logs fetched', {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } else {
    let list = devMockDb.findAuditLogsByBusiness(businessId);
    if (entity && entity !== 'ALL') list = list.filter((a) => a.entity === entity);
    if (action && action !== 'ALL') list = list.filter((a) => a.action === action);

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      list = list.filter(
        (a) =>
          (a.action || '').toLowerCase().includes(term) ||
          (a.entity || '').toLowerCase().includes(term) ||
          (a.ipAddress || '').includes(term)
      );
    }

    const total = list.length;
    const paginated = list.slice(skip, skip + limit).map((a) => {
      const u = a.userId ? devMockDb.findUserById(a.userId) : null;
      return {
        ...a,
        userId: u ? { id: u._id || u.id, firstName: u.firstName, lastName: u.lastName, email: u.email } : null,
      };
    });

    return ApiResponse.success(res, paginated, 'Audit logs fetched', {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  }
});

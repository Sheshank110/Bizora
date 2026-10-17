import mongoose from 'mongoose';
import FileRecord from '../models/FileRecord.js';
import devMockDb from '../services/devMockDb.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * List files for business
 */
export const listFiles = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const { entityType, entityId, search } = req.query;

  if (isMongoConnected()) {
    const query = { businessId };
    if (entityType) query.entityType = entityType;
    if (entityId) query.entityId = entityId;
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ filename: regex }, { originalName: regex }];
    }

    const files = await FileRecord.find(query).sort({ createdAt: -1 }).populate('uploadedBy', 'firstName lastName email');
    return ApiResponse.success(res, files, 'Files fetched successfully');
  } else {
    let list = devMockDb.findFilesByBusiness(businessId);
    if (entityType) list = list.filter((f) => f.entityType === entityType);
    if (entityId) list = list.filter((f) => String(f.entityId) === String(entityId));
    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      list = list.filter((f) => (f.filename || '').toLowerCase().includes(term) || (f.originalName || '').toLowerCase().includes(term));
    }

    const populated = list.map((f) => {
      const u = devMockDb.findUserById(f.uploadedBy);
      return {
        ...f,
        uploadedBy: u ? { id: u._id || u.id, firstName: u.firstName, lastName: u.lastName } : null,
      };
    });

    return ApiResponse.success(res, populated, 'Files fetched successfully');
  }
});

/**
 * Upload / Register file metadata
 */
export const uploadFile = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const userId = req.user._id || req.user.id;
  const { filename, originalName, mimeType, size, url, entityType, entityId, clientVisible } = req.body;

  if (!filename || !url) throw ApiError.badRequest('Filename and URL are required');

  if (isMongoConnected()) {
    const file = await FileRecord.create({
      businessId,
      uploadedBy: userId,
      filename: filename.trim(),
      originalName: originalName || filename.trim(),
      mimeType: mimeType || 'application/octet-stream',
      size: Number(size) || 1024,
      url,
      entityType: entityType || 'General',
      entityId: entityId || null,
      clientVisible: !!clientVisible,
    });
    return ApiResponse.created(res, file, 'File registered successfully');
  } else {
    const newFile = {
      _id: `file_${Date.now()}`,
      id: `file_${Date.now()}`,
      businessId,
      uploadedBy: userId,
      filename: filename.trim(),
      originalName: originalName || filename.trim(),
      mimeType: mimeType || 'application/octet-stream',
      size: Number(size) || 1024,
      url,
      entityType: entityType || 'General',
      entityId: entityId || null,
      clientVisible: !!clientVisible,
      createdAt: new Date(),
    };
    devMockDb.files.unshift(newFile);
    return ApiResponse.created(res, newFile, 'File registered successfully');
  }
});

/**
 * Delete file
 */
export const deleteFile = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const { fileId } = req.params;

  if (isMongoConnected()) {
    const result = await FileRecord.findOneAndDelete({ _id: fileId, businessId });
    if (!result) throw ApiError.notFound('File not found');
    return ApiResponse.success(res, null, 'File deleted successfully');
  } else {
    const idx = devMockDb.files.findIndex((f) => (f._id === fileId || f.id === fileId) && String(f.businessId) === String(businessId));
    if (idx === -1) throw ApiError.notFound('File not found');
    devMockDb.files.splice(idx, 1);
    return ApiResponse.success(res, null, 'File deleted successfully');
  }
});

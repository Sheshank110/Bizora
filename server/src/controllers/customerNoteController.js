import mongoose from 'mongoose';
import Customer from '../models/Customer.js';
import CustomerNote from '../models/CustomerNote.js';
import CustomerActivity, { ACTIVITY_TYPES } from '../models/CustomerActivity.js';
import devMockDb from '../services/devMockDb.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * List notes for a specific customer
 */
export const listNotes = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const { customerId } = req.params;

  if (isMongoConnected()) {
    // Verify customer belongs to business
    const customer = await Customer.findOne({ _id: customerId, businessId });
    if (!customer) {
      throw ApiError.notFound('Customer not found in this workspace');
    }

    const notes = await CustomerNote.find({ customerId, businessId })
      .sort({ createdAt: -1 })
      .populate('authorId', 'firstName lastName email avatar');

    return ApiResponse.success(res, notes, 'Customer notes fetched');
  } else {
    const customer = devMockDb.findCustomerById(customerId, businessId);
    if (!customer) {
      throw ApiError.notFound('Customer not found in this workspace');
    }

    const notes = devMockDb.findNotesByCustomer(customerId, businessId);
    const populated = notes.map((n) => {
      const author = devMockDb.findUserById(n.authorId);
      return {
        ...n,
        authorId: author
          ? {
              id: author._id || author.id,
              firstName: author.firstName,
              lastName: author.lastName,
              email: author.email,
              avatar: author.avatar || '',
            }
          : null,
      };
    });

    return ApiResponse.success(res, populated, 'Customer notes fetched');
  }
});

/**
 * Add a note to a customer
 */
export const createNote = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const userId = req.user._id || req.user.id;
  const { customerId } = req.params;
  const { content } = req.body;

  if (isMongoConnected()) {
    const customer = await Customer.findOne({ _id: customerId, businessId });
    if (!customer) {
      throw ApiError.notFound('Customer not found in this workspace');
    }

    const note = await CustomerNote.create({
      businessId,
      customerId,
      authorId: userId,
      content,
    });

    await note.populate('authorId', 'firstName lastName email avatar');

    // Log activity
    await CustomerActivity.create({
      businessId,
      customerId,
      userId,
      type: ACTIVITY_TYPES.NOTE_ADDED,
      metadata: {
        notePreview: content.slice(0, 80) + (content.length > 80 ? '...' : ''),
      },
    });

    return ApiResponse.created(res, note, 'Note added successfully');
  } else {
    const customer = devMockDb.findCustomerById(customerId, businessId);
    if (!customer) {
      throw ApiError.notFound('Customer not found in this workspace');
    }

    const noteId = `note_${Date.now()}`;
    const author = devMockDb.findUserById(userId);
    const newNote = {
      _id: noteId,
      id: noteId,
      businessId,
      customerId,
      authorId: author
        ? {
            id: author._id || author.id,
            firstName: author.firstName,
            lastName: author.lastName,
            email: author.email,
            avatar: author.avatar || '',
          }
        : userId,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    devMockDb.customerNotes.unshift(newNote);

    devMockDb.customerActivities.unshift({
      _id: `act_${Date.now()}`,
      businessId,
      customerId,
      userId,
      type: ACTIVITY_TYPES.NOTE_ADDED,
      metadata: {
        notePreview: content.slice(0, 80) + (content.length > 80 ? '...' : ''),
      },
      createdAt: new Date(),
    });

    return ApiResponse.created(res, newNote, 'Note added successfully');
  }
});

/**
 * Delete a customer note
 */
export const deleteNote = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const userId = req.user._id || req.user.id;
  const { customerId, noteId } = req.params;

  if (isMongoConnected()) {
    const note = await CustomerNote.findOne({
      _id: noteId,
      customerId,
      businessId,
    });

    if (!note) {
      throw ApiError.notFound('Note not found');
    }

    // Role check: Only author, manager, or owner can delete
    const isAuthor = note.authorId.toString() === userId.toString();
    const canDelete = isAuthor || req.role === 'owner' || req.role === 'manager';

    if (!canDelete) {
      throw ApiError.forbidden('You do not have permission to delete this note');
    }

    await note.deleteOne();

    await CustomerActivity.create({
      businessId,
      customerId,
      userId,
      type: ACTIVITY_TYPES.NOTE_DELETED,
      metadata: {},
    });

    return ApiResponse.success(res, null, 'Note deleted successfully');
  } else {
    const idx = devMockDb.customerNotes.findIndex(
      (n) => String(n._id) === String(noteId) && String(n.businessId) === String(businessId)
    );

    if (idx === -1) {
      throw ApiError.notFound('Note not found');
    }

    devMockDb.customerNotes.splice(idx, 1);

    devMockDb.customerActivities.unshift({
      _id: `act_${Date.now()}`,
      businessId,
      customerId,
      userId,
      type: ACTIVITY_TYPES.NOTE_DELETED,
      metadata: {},
      createdAt: new Date(),
    });

    return ApiResponse.success(res, null, 'Note deleted successfully');
  }
});

/**
 * Get customer activity timeline
 */
export const getActivityTimeline = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const { customerId } = req.params;

  if (isMongoConnected()) {
    const customer = await Customer.findOne({ _id: customerId, businessId });
    if (!customer) {
      throw ApiError.notFound('Customer not found in this workspace');
    }

    const activities = await CustomerActivity.find({ customerId, businessId })
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName avatar email');

    return ApiResponse.success(res, activities, 'Customer activity timeline fetched');
  } else {
    const customer = devMockDb.findCustomerById(customerId, businessId);
    if (!customer) {
      throw ApiError.notFound('Customer not found in this workspace');
    }

    const activities = devMockDb.findActivitiesByCustomer(customerId, businessId);
    const populated = activities.map((a) => {
      const u = devMockDb.findUserById(a.userId);
      return {
        ...a,
        userId: u
          ? {
              id: u._id || u.id,
              firstName: u.firstName,
              lastName: u.lastName,
              avatar: u.avatar || '',
              email: u.email,
            }
          : null,
      };
    });

    return ApiResponse.success(res, populated, 'Customer activity timeline fetched');
  }
});

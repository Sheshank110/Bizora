import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import devMockDb from '../services/devMockDb.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * Get user notifications in current workspace
 */
export const listNotifications = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const userId = req.user._id || req.user.id;

  if (isMongoConnected()) {
    const notifications = await Notification.find({ userId, businessId })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ userId, businessId, read: false });

    return ApiResponse.success(res, { notifications, unreadCount }, 'Notifications fetched');
  } else {
    const list = devMockDb.findNotificationsByUser(userId, businessId);
    const unreadCount = list.filter((n) => !n.read).length;
    return ApiResponse.success(res, { notifications: list, unreadCount }, 'Notifications fetched');
  }
});

/**
 * Mark notification as read
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const userId = req.user._id || req.user.id;
  const { notificationId } = req.params;

  if (isMongoConnected()) {
    const notif = await Notification.findOneAndUpdate(
      { _id: notificationId, userId, businessId },
      { $set: { read: true, readAt: new Date() } },
      { new: true }
    );
    if (!notif) throw ApiError.notFound('Notification not found');
    return ApiResponse.success(res, notif, 'Notification marked as read');
  } else {
    const notif = devMockDb.notifications.find(
      (n) =>
        (n._id === notificationId || n.id === notificationId) &&
        String(n.userId) === String(userId) &&
        String(n.businessId) === String(businessId)
    );
    if (!notif) throw ApiError.notFound('Notification not found');
    notif.read = true;
    notif.readAt = new Date();
    return ApiResponse.success(res, notif, 'Notification marked as read');
  }
});

/**
 * Mark all notifications as read
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const userId = req.user._id || req.user.id;

  if (isMongoConnected()) {
    await Notification.updateMany(
      { userId, businessId, read: false },
      { $set: { read: true, readAt: new Date() } }
    );
    return ApiResponse.success(res, null, 'All notifications marked as read');
  } else {
    devMockDb.notifications
      .filter((n) => String(n.userId) === String(userId) && String(n.businessId) === String(businessId))
      .forEach((n) => {
        n.read = true;
        n.readAt = new Date();
      });
    return ApiResponse.success(res, null, 'All notifications marked as read');
  }
});

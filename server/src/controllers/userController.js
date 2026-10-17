import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import devMockDb from '../services/devMockDb.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * Get current user profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  const safeUser = req.user.toJSON ? req.user.toJSON() : { ...req.user };
  delete safeUser.password;
  delete safeUser.refreshTokens;
  return ApiResponse.success(res, safeUser, 'User profile fetched');
});

/**
 * Update current user profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, avatar, preferences } = req.body;
  const user = req.user;

  if (isMongoConnected()) {
    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (avatar !== undefined) user.avatar = avatar.trim();
    if (preferences) {
      user.preferences = {
        ...user.preferences,
        ...preferences,
      };
    }

    await user.save();
    return ApiResponse.success(res, user.toJSON(), 'Profile updated successfully');
  } else {
    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (avatar !== undefined) user.avatar = avatar.trim();
    if (preferences) {
      user.preferences = {
        ...user.preferences,
        ...preferences,
      };
    }
    user.fullName = `${user.firstName} ${user.lastName}`.trim();

    const safeUser = { ...user };
    delete safeUser.password;
    delete safeUser.refreshTokens;
    return ApiResponse.success(res, safeUser, 'Profile updated successfully');
  }
});

/**
 * Change current user password
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id || req.user.id;

  if (isMongoConnected()) {
    const user = await User.findById(userId).select('+password');
    if (!user) throw ApiError.notFound('User not found');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw ApiError.badRequest('Current password is incorrect');

    user.password = newPassword;
    await user.save();

    return ApiResponse.success(res, null, 'Password changed successfully');
  } else {
    const user = devMockDb.findUserById(userId);
    if (!user) throw ApiError.notFound('User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw ApiError.badRequest('Current password is incorrect');

    user.password = await bcrypt.hash(newPassword, 10);
    return ApiResponse.success(res, null, 'Password changed successfully');
  }
});

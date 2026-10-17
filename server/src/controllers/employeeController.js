import mongoose from 'mongoose';
import User from '../models/User.js';
import Membership from '../models/Membership.js';
import EmployeeProfile, { EMPLOYEE_STATUS } from '../models/EmployeeProfile.js';
import devMockDb from '../services/devMockDb.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { USER_ROLES } from '../constants/index.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * List employees with search, role filter, department filter, and status filter
 */
export const listEmployees = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const { search, role, department, status } = req.query;

  if (isMongoConnected()) {
    // Query memberships for this business
    const memQuery = { businessId, status: 'active' };
    if (role && role !== 'ALL') {
      memQuery.role = role;
    }

    const memberships = await Membership.find(memQuery)
      .populate('userId', 'firstName lastName email avatar phone status')
      .sort({ createdAt: 1 });

    // Fetch corresponding EmployeeProfiles
    const userIds = memberships.map((m) => m.userId?._id).filter(Boolean);
    const profiles = await EmployeeProfile.find({
      businessId,
      userId: { $in: userIds },
    });

    const profileMap = new Map();
    profiles.forEach((p) => {
      profileMap.set(p.userId.toString(), p);
    });

    let combined = memberships
      .filter((m) => m.userId)
      .map((m) => {
        const u = m.userId;
        const profile = profileMap.get(u._id.toString()) || {};
        return {
          id: profile._id || m._id,
          profileId: profile._id || null,
          membershipId: m._id,
          userId: u._id,
          firstName: u.firstName,
          lastName: u.lastName,
          fullName: `${u.firstName} ${u.lastName}`.trim(),
          email: u.email,
          avatar: u.avatar || profile.avatar || '',
          phone: profile.phone || u.phone || '',
          role: m.role,
          jobTitle: profile.jobTitle || m.title || '',
          department: profile.department || m.department || '',
          employeeCode: profile.employeeCode || '',
          joiningDate: profile.joiningDate || m.joinedAt || m.createdAt,
          status: profile.status || EMPLOYEE_STATUS.ACTIVE,
          bio: profile.bio || '',
        };
      });

    // Apply department filter
    if (department && department !== 'ALL') {
      combined = combined.filter((e) => e.department.toLowerCase() === department.toLowerCase());
    }

    // Apply status filter
    if (status && status !== 'ALL') {
      combined = combined.filter((e) => e.status === status);
    }

    // Apply search filter
    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      combined = combined.filter(
        (e) =>
          e.fullName.toLowerCase().includes(term) ||
          e.email.toLowerCase().includes(term) ||
          e.jobTitle.toLowerCase().includes(term) ||
          e.department.toLowerCase().includes(term)
      );
    }

    const total = combined.length;
    const paginated = combined.slice(skip, skip + limit);

    return res.status(200).json({
      success: true,
      message: 'Employees fetched successfully',
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } else {
    // In-memory fallback
    const mems = devMockDb.findMembershipsByBusiness(businessId);
    const profiles = devMockDb.findEmployeesByBusiness(businessId);

    let combined = mems.map((m) => {
      const u = devMockDb.findUserById(m.userId);
      const profile = profiles.find((p) => String(p.userId) === String(m.userId)) || {};

      return {
        id: profile._id || m._id,
        profileId: profile._id || null,
        membershipId: m._id,
        userId: m.userId,
        firstName: u?.firstName || '',
        lastName: u?.lastName || '',
        fullName: u?.fullName || `${u?.firstName || ''} ${u?.lastName || ''}`.trim(),
        email: u?.email || '',
        avatar: u?.avatar || profile.avatar || '',
        phone: profile.phone || u?.phone || '',
        role: m.role,
        jobTitle: profile.jobTitle || m.title || '',
        department: profile.department || m.department || '',
        employeeCode: profile.employeeCode || '',
        joiningDate: profile.joiningDate || m.joinedAt,
        status: profile.status || EMPLOYEE_STATUS.ACTIVE,
        bio: profile.bio || '',
      };
    });

    if (role && role !== 'ALL') {
      combined = combined.filter((e) => e.role === role);
    }

    if (department && department !== 'ALL') {
      combined = combined.filter((e) => e.department.toLowerCase() === department.toLowerCase());
    }

    if (status && status !== 'ALL') {
      combined = combined.filter((e) => e.status === status);
    }

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      combined = combined.filter(
        (e) =>
          e.fullName.toLowerCase().includes(term) ||
          e.email.toLowerCase().includes(term) ||
          e.jobTitle.toLowerCase().includes(term) ||
          e.department.toLowerCase().includes(term)
      );
    }

    const total = combined.length;
    const paginated = combined.slice(skip, skip + limit);

    return res.status(200).json({
      success: true,
      message: 'Employees fetched successfully',
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
 * Get employee profile by ID
 */
export const getEmployeeById = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const { employeeId } = req.params;

  if (isMongoConnected()) {
    // employeeId might be Profile ID or Membership ID or User ID
    let profile = await EmployeeProfile.findOne({
      $or: [{ _id: employeeId }, { userId: employeeId }],
      businessId,
    }).populate('userId', 'firstName lastName email avatar phone');

    let membership = null;
    let user = null;

    if (profile) {
      user = profile.userId;
      membership = await Membership.findOne({ userId: user._id, businessId });
    } else {
      membership = await Membership.findOne({
        $or: [{ _id: employeeId }, { userId: employeeId }],
        businessId,
      }).populate('userId', 'firstName lastName email avatar phone');

      if (membership && membership.userId) {
        user = membership.userId;
        profile = await EmployeeProfile.findOne({ userId: user._id, businessId });
      }
    }

    if (!user || !membership) {
      throw ApiError.notFound('Employee not found in this workspace');
    }

    return ApiResponse.success(
      res,
      {
        id: profile?._id || membership._id,
        profileId: profile?._id || null,
        membershipId: membership._id,
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        avatar: user.avatar || profile?.avatar || '',
        phone: profile?.phone || user.phone || '',
        role: membership.role,
        jobTitle: profile?.jobTitle || membership.title || '',
        department: profile?.department || membership.department || '',
        employeeCode: profile?.employeeCode || '',
        joiningDate: profile?.joiningDate || membership.joinedAt,
        status: profile?.status || EMPLOYEE_STATUS.ACTIVE,
        bio: profile?.bio || '',
      },
      'Employee profile fetched'
    );
  } else {
    const mems = devMockDb.findMembershipsByBusiness(businessId);
    const profiles = devMockDb.findEmployeesByBusiness(businessId);

    const mem = mems.find(
      (m) =>
        String(m._id) === String(employeeId) ||
        String(m.userId) === String(employeeId) ||
        profiles.some((p) => String(p._id) === String(employeeId) && String(p.userId) === String(m.userId))
    );

    if (!mem) {
      throw ApiError.notFound('Employee not found in this workspace');
    }

    const u = devMockDb.findUserById(mem.userId);
    const profile = profiles.find((p) => String(p.userId) === String(mem.userId)) || {};

    return ApiResponse.success(
      res,
      {
        id: profile._id || mem._id,
        profileId: profile._id || null,
        membershipId: mem._id,
        userId: mem.userId,
        firstName: u?.firstName || '',
        lastName: u?.lastName || '',
        fullName: u?.fullName || `${u?.firstName} ${u?.lastName}`.trim(),
        email: u?.email || '',
        avatar: u?.avatar || profile.avatar || '',
        phone: profile.phone || u?.phone || '',
        role: mem.role,
        jobTitle: profile.jobTitle || mem.title || '',
        department: profile.department || mem.department || '',
        employeeCode: profile.employeeCode || '',
        joiningDate: profile.joiningDate || mem.joinedAt,
        status: profile.status || EMPLOYEE_STATUS.ACTIVE,
        bio: profile.bio || '',
      },
      'Employee profile fetched'
    );
  }
});

/**
 * Update employee profile & role
 */
export const updateEmployee = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const { employeeId } = req.params;
  const { jobTitle, department, phone, bio, status, role } = req.body;

  // Authorization check for role or status changes
  const callerRole = req.role;
  const isOwner = callerRole === USER_ROLES.OWNER;
  const isManager = callerRole === USER_ROLES.MANAGER;

  if (role && !isOwner) {
    throw ApiError.forbidden('Only workspace owners can alter employee roles');
  }

  if (isMongoConnected()) {
    let profile = await EmployeeProfile.findOne({
      $or: [{ _id: employeeId }, { userId: employeeId }],
      businessId,
    });

    let membership = await Membership.findOne({
      $or: [{ _id: employeeId }, { userId: profile?.userId || employeeId }],
      businessId,
    });

    if (!membership) {
      throw ApiError.notFound('Employee membership not found in this workspace');
    }

    // Protect Owner role
    if (membership.role === USER_ROLES.OWNER && role && role !== USER_ROLES.OWNER) {
      throw ApiError.forbidden('Cannot alter the role of the workspace owner');
    }

    // If profile doesn't exist yet, create it
    if (!profile) {
      profile = new EmployeeProfile({
        userId: membership.userId,
        businessId,
      });
    }

    if (jobTitle !== undefined) {
      profile.jobTitle = jobTitle.trim();
      membership.title = jobTitle.trim();
    }

    if (department !== undefined) {
      profile.department = department.trim();
      membership.department = department.trim();
    }

    if (phone !== undefined) profile.phone = phone.trim();
    if (bio !== undefined) profile.bio = bio.trim();
    if (status !== undefined) profile.status = status;

    if (role && isOwner && membership.role !== USER_ROLES.OWNER) {
      membership.role = role;
    }

    await Promise.all([profile.save(), membership.save()]);

    return ApiResponse.success(res, { profile, membership }, 'Employee updated successfully');
  } else {
    const mems = devMockDb.findMembershipsByBusiness(businessId);
    const profiles = devMockDb.findEmployeesByBusiness(businessId);

    const mem = mems.find(
      (m) =>
        String(m._id) === String(employeeId) ||
        String(m.userId) === String(employeeId) ||
        profiles.some((p) => String(p._id) === String(employeeId) && String(p.userId) === String(m.userId))
    );

    if (!mem) {
      throw ApiError.notFound('Employee membership not found in this workspace');
    }

    if (mem.role === USER_ROLES.OWNER && role && role !== USER_ROLES.OWNER) {
      throw ApiError.forbidden('Cannot alter the role of the workspace owner');
    }

    let profile = profiles.find((p) => String(p.userId) === String(mem.userId));
    if (!profile) {
      profile = {
        _id: `emp_p_${Date.now()}`,
        userId: mem.userId,
        businessId,
        jobTitle: '',
        department: '',
        phone: '',
        employeeCode: `EMP-${Math.floor(100 + Math.random() * 900)}`,
        joiningDate: new Date(),
        status: 'ACTIVE',
        bio: '',
      };
      devMockDb.employeeProfiles.push(profile);
    }

    if (jobTitle !== undefined) {
      profile.jobTitle = jobTitle.trim();
      mem.title = jobTitle.trim();
    }
    if (department !== undefined) {
      profile.department = department.trim();
      mem.department = department.trim();
    }
    if (phone !== undefined) profile.phone = phone.trim();
    if (bio !== undefined) profile.bio = bio.trim();
    if (status !== undefined) profile.status = status;

    if (role && isOwner && mem.role !== USER_ROLES.OWNER) {
      mem.role = role;
    }

    return ApiResponse.success(res, { profile, membership: mem }, 'Employee updated successfully');
  }
});

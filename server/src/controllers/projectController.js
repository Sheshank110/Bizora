import mongoose from 'mongoose';
import Project, { PROJECT_STATUS, PROJECT_PRIORITY } from '../models/Project.js';
import Task from '../models/Task.js';
import Customer from '../models/Customer.js';
import devMockDb from '../services/devMockDb.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { USER_ROLES } from '../constants/index.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * List projects with search, filter, sort & pagination
 */
export const listProjects = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const { search, status, customerId, priority, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  if (isMongoConnected()) {
    const query = { businessId };
    if (status && status !== 'ALL') query.status = status;
    if (customerId) query.customerId = customerId;
    if (priority && priority !== 'ALL') query.priority = priority;

    if (search && search.trim()) {
      const regex = new RegExp(search.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
      query.$or = [{ name: regex }, { description: regex }, { tags: regex }];
    }

    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const allowedSort = ['createdAt', 'updatedAt', 'name', 'progress', 'budget', 'endDate'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'createdAt';

    const [total, projects] = await Promise.all([
      Project.countDocuments(query),
      Project.find(query)
        .sort({ [safeSort]: sortDirection })
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'firstName lastName company email')
        .populate('managerId', 'firstName lastName email avatar')
        .populate('teamMembers', 'firstName lastName email avatar'),
    ]);

    return ApiResponse.success(
      res,
      projects,
      'Projects fetched successfully',
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      }
    );
  } else {
    let list = devMockDb.findProjectsByBusiness(businessId);

    if (status && status !== 'ALL') list = list.filter((p) => p.status === status);
    if (customerId) list = list.filter((p) => String(p.customerId) === String(customerId));
    if (priority && priority !== 'ALL') list = list.filter((p) => p.priority === priority);

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(term) ||
          (p.description || '').toLowerCase().includes(term) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(term))
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
    const paginated = list.slice(skip, skip + limit).map((p) => {
      const cust = p.customerId ? devMockDb.findCustomerById(p.customerId, businessId) : null;
      const mgr = p.managerId ? devMockDb.findUserById(p.managerId) : null;
      return {
        ...p,
        customerId: cust ? { id: cust._id || cust.id, name: `${cust.firstName} ${cust.lastName}`, company: cust.company } : null,
        managerId: mgr ? { id: mgr._id || mgr.id, name: `${mgr.firstName} ${mgr.lastName}`, email: mgr.email } : null,
      };
    });

    return ApiResponse.success(
      res,
      paginated,
      'Projects fetched successfully',
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      }
    );
  }
});

/**
 * Get project details by ID
 */
export const getProjectById = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const { projectId } = req.params;

  if (isMongoConnected()) {
    const project = await Project.findOne({ _id: projectId, businessId })
      .populate('customerId', 'firstName lastName company email phone')
      .populate('managerId', 'firstName lastName email avatar')
      .populate('teamMembers', 'firstName lastName email avatar')
      .populate('createdBy', 'firstName lastName email');

    if (!project) throw ApiError.notFound('Project not found in this workspace');

    return ApiResponse.success(res, project, 'Project details fetched');
  } else {
    const p = devMockDb.findProjectById(projectId, businessId);
    if (!p) throw ApiError.notFound('Project not found in this workspace');

    const cust = p.customerId ? devMockDb.findCustomerById(p.customerId, businessId) : null;
    const mgr = p.managerId ? devMockDb.findUserById(p.managerId) : null;
    const team = (p.teamMembers || []).map((id) => devMockDb.findUserById(id)).filter(Boolean);

    return ApiResponse.success(
      res,
      {
        ...p,
        customerId: cust ? { id: cust._id || cust.id, firstName: cust.firstName, lastName: cust.lastName, company: cust.company, email: cust.email } : null,
        managerId: mgr ? { id: mgr._id || mgr.id, firstName: mgr.firstName, lastName: mgr.lastName, email: mgr.email } : null,
        teamMembers: team.map((u) => ({ id: u._id || u.id, firstName: u.firstName, lastName: u.lastName, email: u.email })),
      },
      'Project details fetched'
    );
  }
});

/**
 * Create a new project
 */
export const createProject = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const userId = req.user._id || req.user.id;
  const { name, description, customerId, managerId, teamMembers, status, priority, budget, currency, startDate, endDate, clientVisible, tags } = req.body;

  if (!name || !name.trim()) throw ApiError.badRequest('Project name is required');

  if (isMongoConnected()) {
    const project = await Project.create({
      businessId,
      name: name.trim(),
      description: description || '',
      customerId: customerId || null,
      managerId: managerId || userId,
      teamMembers: Array.isArray(teamMembers) ? teamMembers : [],
      status: status || PROJECT_STATUS.ACTIVE,
      priority: priority || PROJECT_PRIORITY.MEDIUM,
      budget: Number(budget) || 0,
      currency: currency || 'USD',
      startDate: startDate || null,
      endDate: endDate || null,
      clientVisible: clientVisible !== false,
      progress: 0,
      tags: Array.isArray(tags) ? tags : [],
      createdBy: userId,
    });

    return ApiResponse.created(res, project, 'Project created successfully');
  } else {
    const newProj = {
      _id: `proj_${Date.now()}`,
      id: `proj_${Date.now()}`,
      businessId,
      name: name.trim(),
      description: description || '',
      customerId: customerId || null,
      managerId: managerId || userId,
      teamMembers: Array.isArray(teamMembers) ? teamMembers : [],
      status: status || PROJECT_STATUS.ACTIVE,
      priority: priority || PROJECT_PRIORITY.MEDIUM,
      budget: Number(budget) || 0,
      currency: currency || 'USD',
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      clientVisible: clientVisible !== false,
      progress: 0,
      tags: Array.isArray(tags) ? tags : [],
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    devMockDb.projects.unshift(newProj);
    return ApiResponse.created(res, newProj, 'Project created successfully');
  }
});

/**
 * Update project
 */
export const updateProject = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const { projectId } = req.params;

  if (isMongoConnected()) {
    const project = await Project.findOneAndUpdate(
      { _id: projectId, businessId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!project) throw ApiError.notFound('Project not found');
    return ApiResponse.success(res, project, 'Project updated successfully');
  } else {
    const idx = devMockDb.projects.findIndex((p) => (p._id === projectId || p.id === projectId) && String(p.businessId) === String(businessId));
    if (idx === -1) throw ApiError.notFound('Project not found');

    devMockDb.projects[idx] = {
      ...devMockDb.projects[idx],
      ...req.body,
      updatedAt: new Date(),
    };

    return ApiResponse.success(res, devMockDb.projects[idx], 'Project updated successfully');
  }
});

/**
 * Delete / Archive project
 */
export const deleteProject = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const { projectId } = req.params;

  if (isMongoConnected()) {
    const project = await Project.findOneAndUpdate(
      { _id: projectId, businessId },
      { $set: { status: PROJECT_STATUS.CANCELLED } },
      { new: true }
    );
    if (!project) throw ApiError.notFound('Project not found');
    return ApiResponse.success(res, project, 'Project cancelled');
  } else {
    const project = devMockDb.findProjectById(projectId, businessId);
    if (!project) throw ApiError.notFound('Project not found');
    project.status = PROJECT_STATUS.CANCELLED;
    return ApiResponse.success(res, project, 'Project cancelled');
  }
});

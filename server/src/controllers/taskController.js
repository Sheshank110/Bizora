import mongoose from 'mongoose';
import Task, { TASK_STATUS, TASK_PRIORITY } from '../models/Task.js';
import Project from '../models/Project.js';
import devMockDb from '../services/devMockDb.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * List tasks (optionally by project)
 */
export const listTasks = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const { projectId, status, assigneeId, priority, search } = req.query;

  if (isMongoConnected()) {
    const query = { businessId };
    if (projectId) query.projectId = projectId;
    if (status && status !== 'ALL') query.status = status;
    if (assigneeId) query.assigneeId = assigneeId;
    if (priority && priority !== 'ALL') query.priority = priority;

    if (search && search.trim()) {
      const regex = new RegExp(search.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
      query.$or = [{ title: regex }, { description: regex }, { tags: regex }];
    }

    const tasks = await Task.find(query)
      .sort({ order: 1, createdAt: -1 })
      .populate('assigneeId', 'firstName lastName email avatar')
      .populate('projectId', 'name');

    return ApiResponse.success(res, tasks, 'Tasks fetched successfully');
  } else {
    let list = devMockDb.findTasksByBusiness(businessId);
    if (projectId) list = list.filter((t) => String(t.projectId) === String(projectId));
    if (status && status !== 'ALL') list = list.filter((t) => t.status === status);
    if (assigneeId) list = list.filter((t) => String(t.assigneeId) === String(assigneeId));
    if (priority && priority !== 'ALL') list = list.filter((t) => t.priority === priority);

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          (t.title || '').toLowerCase().includes(term) ||
          (t.description || '').toLowerCase().includes(term)
      );
    }

    const populated = list.map((t) => {
      const user = t.assigneeId ? devMockDb.findUserById(t.assigneeId) : null;
      const proj = devMockDb.findProjectById(t.projectId, businessId);
      return {
        ...t,
        assigneeId: user ? { id: user._id || user.id, firstName: user.firstName, lastName: user.lastName, email: user.email } : null,
        projectId: proj ? { id: proj._id || proj.id, name: proj.name } : null,
      };
    });

    return ApiResponse.success(res, populated, 'Tasks fetched successfully');
  }
});

/**
 * Get task by ID
 */
export const getTaskById = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const { taskId } = req.params;

  if (isMongoConnected()) {
    const task = await Task.findOne({ _id: taskId, businessId })
      .populate('assigneeId', 'firstName lastName email avatar')
      .populate('projectId', 'name');

    if (!task) throw ApiError.notFound('Task not found in this workspace');
    return ApiResponse.success(res, task, 'Task details fetched');
  } else {
    const t = devMockDb.findTaskById(taskId, businessId);
    if (!t) throw ApiError.notFound('Task not found in this workspace');

    const user = t.assigneeId ? devMockDb.findUserById(t.assigneeId) : null;
    const proj = devMockDb.findProjectById(t.projectId, businessId);

    return ApiResponse.success(
      res,
      {
        ...t,
        assigneeId: user ? { id: user._id || user.id, firstName: user.firstName, lastName: user.lastName, email: user.email } : null,
        projectId: proj ? { id: proj._id || proj.id, name: proj.name } : null,
      },
      'Task details fetched'
    );
  }
});

/**
 * Create task
 */
export const createTask = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const userId = req.user._id || req.user.id;
  const { projectId, title, description, status, priority, assigneeId, dueDate, checklist, tags, clientVisible } = req.body;

  if (!title || !title.trim()) throw ApiError.badRequest('Task title is required');
  if (!projectId) throw ApiError.badRequest('Project ID is required');

  if (isMongoConnected()) {
    const task = await Task.create({
      businessId,
      projectId,
      title: title.trim(),
      description: description || '',
      status: status || TASK_STATUS.TODO,
      priority: priority || TASK_PRIORITY.MEDIUM,
      assigneeId: assigneeId || null,
      dueDate: dueDate || null,
      checklist: Array.isArray(checklist) ? checklist : [],
      tags: Array.isArray(tags) ? tags : [],
      clientVisible: !!clientVisible,
      createdBy: userId,
    });

    return ApiResponse.created(res, task, 'Task created successfully');
  } else {
    const newTask = {
      _id: `task_${Date.now()}`,
      id: `task_${Date.now()}`,
      businessId,
      projectId,
      title: title.trim(),
      description: description || '',
      status: status || TASK_STATUS.TODO,
      priority: priority || TASK_PRIORITY.MEDIUM,
      assigneeId: assigneeId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      order: 0,
      checklist: Array.isArray(checklist) ? checklist : [],
      tags: Array.isArray(tags) ? tags : [],
      clientVisible: !!clientVisible,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    devMockDb.tasks.unshift(newTask);
    return ApiResponse.created(res, newTask, 'Task created successfully');
  }
});

/**
 * Update task
 */
export const updateTask = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const { taskId } = req.params;

  if (isMongoConnected()) {
    const task = await Task.findOneAndUpdate(
      { _id: taskId, businessId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!task) throw ApiError.notFound('Task not found');
    return ApiResponse.success(res, task, 'Task updated successfully');
  } else {
    const idx = devMockDb.tasks.findIndex((t) => (t._id === taskId || t.id === taskId) && String(t.businessId) === String(businessId));
    if (idx === -1) throw ApiError.notFound('Task not found');

    devMockDb.tasks[idx] = {
      ...devMockDb.tasks[idx],
      ...req.body,
      updatedAt: new Date(),
    };
    return ApiResponse.success(res, devMockDb.tasks[idx], 'Task updated successfully');
  }
});

/**
 * Delete task
 */
export const deleteTask = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const { taskId } = req.params;

  if (isMongoConnected()) {
    const result = await Task.findOneAndDelete({ _id: taskId, businessId });
    if (!result) throw ApiError.notFound('Task not found');
    return ApiResponse.success(res, null, 'Task deleted successfully');
  } else {
    const idx = devMockDb.tasks.findIndex((t) => (t._id === taskId || t.id === taskId) && String(t.businessId) === String(businessId));
    if (idx === -1) throw ApiError.notFound('Task not found');
    devMockDb.tasks.splice(idx, 1);
    return ApiResponse.success(res, null, 'Task deleted successfully');
  }
});

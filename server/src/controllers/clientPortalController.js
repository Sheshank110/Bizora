import mongoose from 'mongoose';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Invoice from '../models/Invoice.js';
import FileRecord from '../models/FileRecord.js';
import Customer from '../models/Customer.js';
import devMockDb from '../services/devMockDb.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * Resolve Customer ID associated with this client user
 */
async function getClientCustomerId(req) {
  const businessId = req.business._id || req.business.id;
  const userEmail = req.user.email.toLowerCase();

  if (isMongoConnected()) {
    const cust = await Customer.findOne({ businessId, email: userEmail });
    return cust ? cust._id : null;
  } else {
    const cust = devMockDb.findCustomersByBusiness(businessId).find((c) => c.email.toLowerCase() === userEmail);
    return cust ? cust._id || cust.id : 'cust_1'; // fallback to demo customer
  }
}

/**
 * Client Portal Dashboard Overview
 */
export const getClientDashboard = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const customerId = await getClientCustomerId(req);

  if (isMongoConnected()) {
    const [projects, invoices] = await Promise.all([
      Project.find({ businessId, clientVisible: true }),
      Invoice.find({ businessId, customerId: customerId || { $exists: true } }),
    ]);

    const outstandingBalance = invoices
      .filter((i) => i.status !== 'PAID' && i.status !== 'CANCELLED')
      .reduce((sum, i) => sum + (i.amountDue || 0), 0);

    return ApiResponse.success(res, {
      activeProjectsCount: projects.filter((p) => p.status === 'ACTIVE').length,
      totalInvoicesCount: invoices.length,
      outstandingBalance,
      currency: req.business.currency || 'USD',
      recentProjects: projects.slice(0, 3),
      recentInvoices: invoices.slice(0, 3),
    }, 'Client portal dashboard data');
  } else {
    const projects = devMockDb.findProjectsByBusiness(businessId).filter((p) => p.clientVisible);
    const invoices = devMockDb.findInvoicesByBusiness(businessId);
    const outstandingBalance = invoices
      .filter((i) => i.status !== 'PAID' && i.status !== 'CANCELLED')
      .reduce((sum, i) => sum + (i.amountDue || 0), 0);

    return ApiResponse.success(res, {
      activeProjectsCount: projects.filter((p) => p.status === 'ACTIVE').length,
      totalInvoicesCount: invoices.length,
      outstandingBalance,
      currency: req.business.currency || 'USD',
      recentProjects: projects.slice(0, 3),
      recentInvoices: invoices.slice(0, 3),
    }, 'Client portal dashboard data');
  }
});

/**
 * Client Portal Projects
 */
export const getClientProjects = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;

  if (isMongoConnected()) {
    const projects = await Project.find({ businessId, clientVisible: true })
      .select('name description status priority startDate endDate progress')
      .sort({ createdAt: -1 });
    return ApiResponse.success(res, projects, 'Client projects fetched');
  } else {
    const projects = devMockDb.findProjectsByBusiness(businessId)
      .filter((p) => p.clientVisible)
      .map((p) => ({
        id: p._id || p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        priority: p.priority,
        startDate: p.startDate,
        endDate: p.endDate,
        progress: p.progress,
      }));
    return ApiResponse.success(res, projects, 'Client projects fetched');
  }
});

/**
 * Client Portal Project Details (includes client-visible tasks)
 */
export const getClientProjectDetails = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const { projectId } = req.params;

  if (isMongoConnected()) {
    const project = await Project.findOne({ _id: projectId, businessId, clientVisible: true })
      .select('name description status priority startDate endDate progress tags');

    if (!project) throw ApiError.notFound('Project not found or not permitted');

    const tasks = await Task.find({ businessId, projectId, clientVisible: true })
      .select('title description status dueDate checklist');

    return ApiResponse.success(res, { project, tasks }, 'Client project details fetched');
  } else {
    const project = devMockDb.findProjectById(projectId, businessId);
    if (!project || !project.clientVisible) throw ApiError.notFound('Project not found or not permitted');

    const tasks = devMockDb.findTasksByProject(projectId, businessId)
      .filter((t) => t.clientVisible)
      .map((t) => ({
        id: t._id || t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        dueDate: t.dueDate,
        checklist: t.checklist,
      }));

    return ApiResponse.success(res, { project, tasks }, 'Client project details fetched');
  }
});

/**
 * Client Portal Invoices
 */
export const getClientInvoices = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const customerId = await getClientCustomerId(req);

  if (isMongoConnected()) {
    const query = { businessId };
    if (customerId) query.customerId = customerId;

    const invoices = await Invoice.find(query).sort({ createdAt: -1 });
    return ApiResponse.success(res, invoices, 'Client invoices fetched');
  } else {
    const invoices = devMockDb.findInvoicesByBusiness(businessId);
    return ApiResponse.success(res, invoices, 'Client invoices fetched');
  }
});

/**
 * Client Portal Files
 */
export const getClientFiles = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;

  if (isMongoConnected()) {
    const files = await FileRecord.find({ businessId, clientVisible: true }).sort({ createdAt: -1 });
    return ApiResponse.success(res, files, 'Client files fetched');
  } else {
    const files = devMockDb.findFilesByBusiness(businessId).filter((f) => f.clientVisible);
    return ApiResponse.success(res, files, 'Client files fetched');
  }
});

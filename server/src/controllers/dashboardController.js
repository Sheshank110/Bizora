import mongoose from 'mongoose';
import Customer from '../models/Customer.js';
import Membership from '../models/Membership.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Invoice from '../models/Invoice.js';
import AuditLog from '../models/AuditLog.js';
import devMockDb from '../services/devMockDb.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * Get real metrics for the active business dashboard
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;

  let totalCustomers = 0;
  let activeEmployees = 0;
  let newCustomersThisMonth = 0;
  let activeProjects = 0;
  let totalProjects = 0;
  let openTasks = 0;
  let totalTasks = 0;
  let monthlyRevenue = 0;
  let totalRevenue = 0;
  let tasksAttention = [];
  let recentActivities = [];

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  if (isMongoConnected()) {
    const [
      custCount,
      newCustCount,
      memCount,
      activeProjCount,
      totProjCount,
      openTaskCount,
      totTaskCount,
      paidInvoicesThisMonth,
      allPaidInvoices,
      tasksAttentionList,
      recentActivityList,
    ] = await Promise.all([
      Customer.countDocuments({ businessId, status: { $ne: 'ARCHIVED' } }),
      Customer.countDocuments({
        businessId,
        status: { $ne: 'ARCHIVED' },
        createdAt: { $gte: startOfMonth },
      }),
      Membership.countDocuments({ businessId, status: 'active' }),
      Project.countDocuments({ businessId, status: { $in: ['PLANNING', 'ACTIVE', 'IN_PROGRESS'] } }),
      Project.countDocuments({ businessId }),
      Task.countDocuments({ businessId, status: { $ne: 'DONE' } }),
      Task.countDocuments({ businessId }),
      Invoice.find({ businessId, status: 'PAID', paidAt: { $gte: startOfMonth } }),
      Invoice.find({ businessId, status: 'PAID' }),
      Task.find({ businessId, status: { $ne: 'DONE' } }).sort({ priority: -1, dueDate: 1 }).limit(4),
      AuditLog.find({ businessId }).sort({ createdAt: -1 }).limit(5),
    ]);

    totalCustomers = custCount;
    newCustomersThisMonth = newCustCount;
    activeEmployees = memCount;
    activeProjects = activeProjCount;
    totalProjects = totProjCount;
    openTasks = openTaskCount;
    totalTasks = totTaskCount;
    monthlyRevenue = paidInvoicesThisMonth.reduce((acc, inv) => acc + (inv.totalAmount || inv.total || 0), 0);
    totalRevenue = allPaidInvoices.reduce((acc, inv) => acc + (inv.totalAmount || inv.total || 0), 0);
    tasksAttention = tasksAttentionList;
    recentActivities = recentActivityList;
  } else {
    const customers = (devMockDb.findCustomersByBusiness ? devMockDb.findCustomersByBusiness(businessId) : []).filter((c) => c.status !== 'ARCHIVED');
    const members = (devMockDb.findMembershipsByBusiness ? devMockDb.findMembershipsByBusiness(businessId) : []).filter((m) => m.status === 'active');
    const projects = devMockDb.findProjectsByBusiness ? devMockDb.findProjectsByBusiness(businessId) : [];
    const tasks = devMockDb.findTasksByBusiness ? devMockDb.findTasksByBusiness(businessId) : [];
    const invoices = devMockDb.findInvoicesByBusiness ? devMockDb.findInvoicesByBusiness(businessId) : [];

    totalCustomers = customers.length;
    newCustomersThisMonth = customers.filter((c) => new Date(c.createdAt) >= startOfMonth).length;
    activeEmployees = members.length;
    activeProjects = projects.filter((p) => ['PLANNING', 'ACTIVE', 'IN_PROGRESS'].includes(p.status)).length;
    totalProjects = projects.length;
    openTasks = tasks.filter((t) => t.status !== 'DONE').length;
    totalTasks = tasks.length;

    const paidInvoices = invoices.filter((i) => i.status === 'PAID');
    monthlyRevenue = paidInvoices
      .filter((i) => new Date(i.paidAt || i.updatedAt) >= startOfMonth)
      .reduce((acc, inv) => acc + (inv.totalAmount || inv.total || 0), 0);
    totalRevenue = paidInvoices.reduce((acc, inv) => acc + (inv.totalAmount || inv.total || 0), 0);

    tasksAttention = tasks.filter((t) => t.status !== 'DONE').slice(0, 4);
    recentActivities = (devMockDb.auditLogs || []).filter((a) => String(a.businessId) === String(businessId)).slice(0, 5);
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueChart = months.map((month) => ({
    month,
    revenue: 0,
    expenses: 0,
    profit: 0,
  }));

  const completionRate = totalTasks > 0 ? Math.round(((totalTasks - openTasks) / totalTasks) * 100) : 0;

  return ApiResponse.success(
    res,
    {
      totalCustomers,
      activeEmployees,
      newCustomersThisMonth,
      customers: {
        total: totalCustomers,
        active: totalCustomers,
        newThisMonth: newCustomersThisMonth,
      },
      employees: {
        active: activeEmployees,
        total: activeEmployees,
      },
      projects: {
        active: activeProjects,
        total: totalProjects,
      },
      tasks: {
        open: openTasks,
        total: totalTasks,
        completionRate,
      },
      revenue: {
        monthly: monthlyRevenue,
        total: totalRevenue,
        change: 0,
      },
      revenueChart,
      tasksAttention,
      recentActivities,
      currency: req.business.currency || 'USD',
    },
    'Dashboard statistics fetched'
  );
});


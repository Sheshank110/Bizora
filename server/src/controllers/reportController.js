import mongoose from 'mongoose';
import Invoice from '../models/Invoice.js';
import Expense from '../models/Expense.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Customer from '../models/Customer.js';
import InventoryItem from '../models/InventoryItem.js';
import devMockDb from '../services/devMockDb.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * Get comprehensive analytics summary for active business
 */
export const getAnalyticsSummary = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;

  if (isMongoConnected()) {
    const [invoices, expenses, projects, tasks, customers, inventory] = await Promise.all([
      Invoice.find({ businessId }),
      Expense.find({ businessId }),
      Project.find({ businessId }),
      Task.find({ businessId }),
      Customer.find({ businessId, status: { $ne: 'ARCHIVED' } }),
      InventoryItem.find({ businessId }),
    ]);

    const totalRevenue = invoices
      .filter((i) => i.status === 'PAID' || i.status === 'PARTIALLY_PAID')
      .reduce((sum, i) => sum + (i.amountPaid || 0), 0);

    const pendingRevenue = invoices
      .filter((i) => i.status === 'SENT' || i.status === 'PARTIALLY_PAID')
      .reduce((sum, i) => sum + (i.amountDue || 0), 0);

    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

    // Monthly breakdown for Recharts
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const monthlyData = months.map((month, idx) => {
      const rev = invoices
        .filter((i) => new Date(i.createdAt).getMonth() === idx && new Date(i.createdAt).getFullYear() === currentYear)
        .reduce((sum, i) => sum + (i.amountPaid || 0), 0);
      const exp = expenses
        .filter((e) => new Date(e.date).getMonth() === idx && new Date(e.date).getFullYear() === currentYear)
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      return {
        month,
        revenue: rev,
        expenses: exp,
        profit: rev - exp,
      };
    });

    return ApiResponse.success(
      res,
      {
        financials: {
          totalRevenue,
          pendingRevenue,
          totalExpenses,
          netProfit,
          profitMargin: Number(profitMargin),
          currency: req.business.currency || 'USD',
        },
        projects: {
          total: projects.length,
          active: projects.filter((p) => p.status === 'ACTIVE').length,
          completed: projects.filter((p) => p.status === 'COMPLETED').length,
        },
        tasks: {
          total: tasks.length,
          completed: tasks.filter((t) => t.status === 'DONE').length,
          inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
          todo: tasks.filter((t) => t.status === 'TODO').length,
        },
        customers: {
          total: customers.length,
          active: customers.filter((c) => c.status === 'ACTIVE').length,
        },
        inventory: {
          totalItems: inventory.length,
          lowStock: inventory.filter((i) => i.status === 'LOW_STOCK').length,
          outOfStock: inventory.filter((i) => i.status === 'OUT_OF_STOCK').length,
        },
        monthlyData,
      },
      'Analytics summary fetched'
    );
  } else {
    const invoices = devMockDb.findInvoicesByBusiness(businessId);
    const expenses = devMockDb.findExpensesByBusiness(businessId);
    const projects = devMockDb.findProjectsByBusiness(businessId);
    const tasks = devMockDb.findTasksByBusiness(businessId);
    const customers = devMockDb.findCustomersByBusiness(businessId).filter((c) => c.status !== 'ARCHIVED');
    const inventory = devMockDb.findInventoryItemsByBusiness(businessId);

    const totalRevenue = invoices
      .filter((i) => i.status === 'PAID' || i.status === 'PARTIALLY_PAID')
      .reduce((sum, i) => sum + (i.amountPaid || 0), 0);

    const pendingRevenue = invoices
      .filter((i) => i.status === 'SENT' || i.status === 'PARTIALLY_PAID')
      .reduce((sum, i) => sum + (i.amountDue || 0), 0);

    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

    const monthlyData = [
      { month: 'Jan', revenue: 18700, expenses: 1420, profit: 17280 },
      { month: 'Feb', revenue: 7315, expenses: 11450, profit: -4135 },
      { month: 'Mar', revenue: 14500, expenses: 3200, profit: 11300 },
      { month: 'Apr', revenue: 19200, expenses: 4100, profit: 15100 },
      { month: 'May', revenue: 22400, expenses: 5300, profit: 17100 },
      { month: 'Jun', revenue: 28900, expenses: 6200, profit: 22700 },
    ];

    const financialObj = {
      totalRevenue,
      pendingRevenue,
      totalExpenses,
      netProfit,
      profitMargin: Number(profitMargin),
      currency: req.business.currency || 'USD',
    };

    return ApiResponse.success(
      res,
      {
        financial: financialObj,
        financials: financialObj,
        projects: {
          total: projects.length,
          active: projects.filter((p) => p.status === 'ACTIVE').length,
          completed: projects.filter((p) => p.status === 'COMPLETED').length,
        },
        tasks: {
          total: tasks.length,
          completed: tasks.filter((t) => t.status === 'DONE').length,
          inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
          todo: tasks.filter((t) => t.status === 'TODO').length,
        },
        customers: {
          total: customers.length,
          active: customers.filter((c) => c.status === 'ACTIVE').length,
        },
        inventory: {
          totalItems: inventory.length,
          lowStock: inventory.filter((i) => i.status === 'LOW_STOCK').length,
          outOfStock: inventory.filter((i) => i.status === 'OUT_OF_STOCK').length,
        },
        monthlyData,
        monthlyBreakdown: monthlyData,
      },
      'Analytics summary fetched'
    );
  }
});

/**
 * Export report as CSV
 */
export const exportReportCsv = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const { type = 'invoices' } = req.query;

  let headers = '';
  let rows = [];

  if (type === 'invoices') {
    headers = 'Invoice Number,Customer ID,Issue Date,Due Date,Total,Amount Paid,Amount Due,Status\n';
    const invs = isMongoConnected() ? await Invoice.find({ businessId }) : devMockDb.findInvoicesByBusiness(businessId);
    rows = invs.map(
      (i) => `"${i.invoiceNumber}","${i.customerId}","${new Date(i.issueDate).toLocaleDateString()}","${new Date(i.dueDate).toLocaleDateString()}",${i.total},${i.amountPaid},${i.amountDue},"${i.status}"`
    );
  } else if (type === 'expenses') {
    headers = 'Title,Category,Amount,Currency,Date,Vendor\n';
    const exps = isMongoConnected() ? await Expense.find({ businessId }) : devMockDb.findExpensesByBusiness(businessId);
    rows = exps.map(
      (e) => `"${e.title}","${e.category}",${e.amount},"${e.currency}","${new Date(e.date).toLocaleDateString()}","${e.vendor}"`
    );
  } else {
    headers = 'SKU,Name,Category,Stock,Min Stock,Cost Price,Selling Price,Status\n';
    const items = isMongoConnected() ? await InventoryItem.find({ businessId }) : devMockDb.findInventoryItemsByBusiness(businessId);
    rows = items.map(
      (item) => `"${item.sku}","${item.name}","${item.category}",${item.stockQuantity},${item.minimumStock},${item.costPrice},${item.sellingPrice},"${item.status}"`
    );
  }

  const csvContent = headers + rows.join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="bizora-${type}-report.csv"`);
  return res.status(200).send(csvContent);
});

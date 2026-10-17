import mongoose from 'mongoose';
import Expense, { EXPENSE_CATEGORIES } from '../models/Expense.js';
import devMockDb from '../services/devMockDb.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * List expenses with category, search, sorting & pagination
 */
export const listExpenses = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const { search, category, sortBy = 'date', sortOrder = 'desc' } = req.query;

  if (isMongoConnected()) {
    const query = { businessId };
    if (category && category !== 'ALL') query.category = category;

    if (search && search.trim()) {
      const regex = new RegExp(search.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
      query.$or = [{ title: regex }, { vendor: regex }, { notes: regex }];
    }

    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const allowedSort = ['date', 'amount', 'title', 'category', 'createdAt'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'date';

    const [total, expenses] = await Promise.all([
      Expense.countDocuments(query),
      Expense.find(query).sort({ [safeSort]: sortDirection }).skip(skip).limit(limit),
    ]);

    return ApiResponse.success(res, expenses, 'Expenses fetched successfully', {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } else {
    let list = devMockDb.findExpensesByBusiness(businessId);
    if (category && category !== 'ALL') list = list.filter((e) => e.category.toLowerCase() === category.toLowerCase());

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          (e.title || '').toLowerCase().includes(term) ||
          (e.vendor || '').toLowerCase().includes(term) ||
          (e.notes || '').toLowerCase().includes(term)
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
    const paginated = list.slice(skip, skip + limit);

    return ApiResponse.success(res, paginated, 'Expenses fetched successfully', {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  }
});

/**
 * Create expense
 */
export const createExpense = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const userId = req.user._id || req.user.id;
  const { title, category, amount, currency, date, vendor, notes, receipt } = req.body;

  if (!title || !title.trim()) throw ApiError.badRequest('Expense title is required');
  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0) throw ApiError.badRequest('Valid expense amount is required');

  if (isMongoConnected()) {
    const expense = await Expense.create({
      businessId,
      title: title.trim(),
      category: category || 'Other',
      amount: numAmount,
      currency: currency || req.business.currency || 'USD',
      date: date ? new Date(date) : new Date(),
      vendor: vendor || '',
      notes: notes || '',
      receipt: receipt || '',
      createdBy: userId,
    });

    return ApiResponse.created(res, expense, 'Expense recorded successfully');
  } else {
    const newExpense = {
      _id: `exp_${Date.now()}`,
      id: `exp_${Date.now()}`,
      businessId,
      title: title.trim(),
      category: category || 'Other',
      amount: numAmount,
      currency: currency || req.business.currency || 'USD',
      date: date ? new Date(date) : new Date(),
      vendor: vendor || '',
      notes: notes || '',
      receipt: receipt || '',
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    devMockDb.expenses.unshift(newExpense);
    return ApiResponse.created(res, newExpense, 'Expense recorded successfully');
  }
});

/**
 * Delete expense
 */
export const deleteExpense = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const { expenseId } = req.params;

  if (isMongoConnected()) {
    const result = await Expense.findOneAndDelete({ _id: expenseId, businessId });
    if (!result) throw ApiError.notFound('Expense not found');
    return ApiResponse.success(res, null, 'Expense deleted successfully');
  } else {
    const idx = devMockDb.expenses.findIndex((e) => (e._id === expenseId || e.id === expenseId) && String(e.businessId) === String(businessId));
    if (idx === -1) throw ApiError.notFound('Expense not found');
    devMockDb.expenses.splice(idx, 1);
    return ApiResponse.success(res, null, 'Expense deleted successfully');
  }
});

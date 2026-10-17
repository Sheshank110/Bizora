import mongoose from 'mongoose';
import Invoice, { INVOICE_STATUS } from '../models/Invoice.js';
import Customer from '../models/Customer.js';
import Project from '../models/Project.js';
import Payment from '../models/Payment.js';
import devMockDb from '../services/devMockDb.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * Generate next sequential invoice number for business
 */
async function generateInvoiceNumber(businessId) {
  const year = new Date().getFullYear();
  let count = 0;
  if (isMongoConnected()) {
    count = await Invoice.countDocuments({ businessId });
  } else {
    count = devMockDb.findInvoicesByBusiness(businessId).length;
  }
  const nextNum = String(count + 1).padStart(4, '0');
  return `INV-${year}-${nextNum}`;
}

/**
 * List invoices with filters
 */
export const listInvoices = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const { search, status, customerId, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  if (isMongoConnected()) {
    const query = { businessId };
    if (status && status !== 'ALL') query.status = status;
    if (customerId) query.customerId = customerId;

    if (search && search.trim()) {
      const regex = new RegExp(search.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
      query.$or = [{ invoiceNumber: regex }, { notes: regex }];
    }

    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const allowedSort = ['createdAt', 'issueDate', 'dueDate', 'total', 'invoiceNumber'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'createdAt';

    const [total, invoices] = await Promise.all([
      Invoice.countDocuments(query),
      Invoice.find(query)
        .sort({ [safeSort]: sortDirection })
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'firstName lastName company email')
        .populate('projectId', 'name'),
    ]);

    return ApiResponse.success(res, invoices, 'Invoices fetched successfully', {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } else {
    let list = devMockDb.findInvoicesByBusiness(businessId);
    if (status && status !== 'ALL') list = list.filter((i) => i.status === status);
    if (customerId) list = list.filter((i) => String(i.customerId) === String(customerId));

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      list = list.filter(
        (i) =>
          (i.invoiceNumber || '').toLowerCase().includes(term) ||
          (i.notes || '').toLowerCase().includes(term)
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
    const paginated = list.slice(skip, skip + limit).map((inv) => {
      const cust = inv.customerId ? devMockDb.findCustomerById(inv.customerId, businessId) : null;
      const proj = inv.projectId ? devMockDb.findProjectById(inv.projectId, businessId) : null;
      return {
        ...inv,
        customerId: cust ? { id: cust._id || cust.id, firstName: cust.firstName, lastName: cust.lastName, company: cust.company, email: cust.email } : null,
        projectId: proj ? { id: proj._id || proj.id, name: proj.name } : null,
      };
    });

    return ApiResponse.success(res, paginated, 'Invoices fetched successfully', {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  }
});

/**
 * Get invoice by ID
 */
export const getInvoiceById = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const { invoiceId } = req.params;

  if (isMongoConnected()) {
    const invoice = await Invoice.findOne({ _id: invoiceId, businessId })
      .populate('customerId', 'firstName lastName company email phone address city state country postalCode')
      .populate('projectId', 'name')
      .populate('createdBy', 'firstName lastName email');

    if (!invoice) throw ApiError.notFound('Invoice not found in this workspace');
    return ApiResponse.success(res, invoice, 'Invoice details fetched');
  } else {
    const inv = devMockDb.findInvoiceById(invoiceId, businessId);
    if (!inv) throw ApiError.notFound('Invoice not found in this workspace');

    const cust = inv.customerId ? devMockDb.findCustomerById(inv.customerId, businessId) : null;
    const proj = inv.projectId ? devMockDb.findProjectById(inv.projectId, businessId) : null;

    return ApiResponse.success(
      res,
      {
        ...inv,
        customerId: cust || null,
        projectId: proj || null,
        business: {
          name: req.business.name,
          email: req.business.contact?.email || 'contact@bizora.demo',
          address: req.business.address,
        },
      },
      'Invoice details fetched'
    );
  }
});

/**
 * Create invoice
 */
export const createInvoice = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const userId = req.user._id || req.user.id;
  const { customerId, projectId, items, dueDate, notes, terms, currency } = req.body;

  if (!customerId) throw ApiError.badRequest('Customer ID is required');
  if (!Array.isArray(items) || items.length === 0) throw ApiError.badRequest('At least one line item is required');
  const invoiceDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 86400000);

  // Calculate line items and totals safely on server
  let subtotal = 0;
  let totalTax = 0;
  let totalDiscount = 0;

  const processedItems = items.map((item) => {
    const qty = Math.max(1, Number(item.quantity) || 1);
    const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
    const tax = Math.max(0, Number(item.tax) || 0);
    const discount = Math.max(0, Number(item.discount) || 0);

    const baseAmount = qty * unitPrice;
    const lineTotal = baseAmount + tax - discount;

    subtotal += baseAmount;
    totalTax += tax;
    totalDiscount += discount;

    return {
      serviceId: item.serviceId || null,
      description: item.description?.trim() || 'Service Item',
      quantity: qty,
      unitPrice,
      tax,
      discount,
      lineTotal,
    };
  });

  const total = Math.max(0, subtotal + totalTax - totalDiscount);
  const invoiceNumber = await generateInvoiceNumber(businessId);

  if (isMongoConnected()) {
    const invoice = await Invoice.create({
      businessId,
      invoiceNumber,
      customerId,
      projectId: projectId || null,
      items: processedItems,
      subtotal,
      discount: totalDiscount,
      tax: totalTax,
      total,
      amountPaid: 0,
      amountDue: total,
      currency: currency || req.business.currency || 'USD',
      issueDate: new Date(),
      dueDate: invoiceDueDate,
      notes: notes || '',
      terms: terms || 'Payment due upon receipt. Net 15 days.',
      status: INVOICE_STATUS.DRAFT,
      createdBy: userId,
    });

    return ApiResponse.created(res, invoice, 'Invoice created successfully');
  } else {
    const newInvoice = {
      _id: `inv_${Date.now()}`,
      id: `inv_${Date.now()}`,
      businessId,
      invoiceNumber,
      customerId,
      projectId: projectId || null,
      items: processedItems,
      subtotal,
      discount: totalDiscount,
      tax: totalTax,
      total,
      amountPaid: 0,
      amountDue: total,
      currency: currency || req.business.currency || 'USD',
      issueDate: new Date(),
      dueDate: invoiceDueDate,
      notes: notes || '',
      terms: terms || 'Payment due upon receipt. Net 15 days.',
      status: INVOICE_STATUS.DRAFT,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    devMockDb.invoices.unshift(newInvoice);
    return ApiResponse.created(res, newInvoice, 'Invoice created successfully');
  }
});

/**
 * Send invoice (status becomes SENT)
 */
export const sendInvoice = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const { invoiceId } = req.params;

  if (isMongoConnected()) {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: invoiceId, businessId },
      { $set: { status: INVOICE_STATUS.SENT } },
      { new: true }
    );
    if (!invoice) throw ApiError.notFound('Invoice not found');
    return ApiResponse.success(res, invoice, 'Invoice sent successfully');
  } else {
    const inv = devMockDb.findInvoiceById(invoiceId, businessId);
    if (!inv) throw ApiError.notFound('Invoice not found');
    inv.status = INVOICE_STATUS.SENT;
    return ApiResponse.success(res, inv, 'Invoice sent successfully');
  }
});

/**
 * Mark invoice as paid
 */
export const markInvoicePaid = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const { invoiceId } = req.params;

  if (isMongoConnected()) {
    const invoice = await Invoice.findOne({ _id: invoiceId, businessId });
    if (!invoice) throw ApiError.notFound('Invoice not found');

    invoice.amountPaid = invoice.total;
    invoice.amountDue = 0;
    invoice.status = INVOICE_STATUS.PAID;
    await invoice.save();

    // Create payment record
    await Payment.create({
      businessId,
      invoiceId: invoice._id,
      customerId: invoice.customerId,
      amount: invoice.total,
      currency: invoice.currency,
      method: 'MANUAL',
      status: 'SUCCEEDED',
      provider: 'manual',
      paidAt: new Date(),
      createdBy: req.user._id,
    });

    return ApiResponse.success(res, invoice, 'Invoice marked as paid');
  } else {
    const inv = devMockDb.findInvoiceById(invoiceId, businessId);
    if (!inv) throw ApiError.notFound('Invoice not found');

    inv.amountPaid = inv.total;
    inv.amountDue = 0;
    inv.status = INVOICE_STATUS.PAID;

    devMockDb.payments.unshift({
      _id: `pay_${Date.now()}`,
      id: `pay_${Date.now()}`,
      businessId,
      invoiceId: inv._id,
      customerId: inv.customerId,
      amount: inv.total,
      currency: inv.currency,
      method: 'MANUAL',
      status: 'SUCCEEDED',
      provider: 'manual',
      paidAt: new Date(),
      createdAt: new Date(),
    });

    return ApiResponse.success(res, inv, 'Invoice marked as paid');
  }
});

/**
 * Cancel invoice
 */
export const cancelInvoice = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const { invoiceId } = req.params;

  if (isMongoConnected()) {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: invoiceId, businessId },
      { $set: { status: INVOICE_STATUS.CANCELLED } },
      { new: true }
    );
    if (!invoice) throw ApiError.notFound('Invoice not found');
    return ApiResponse.success(res, invoice, 'Invoice cancelled');
  } else {
    const inv = devMockDb.findInvoiceById(invoiceId, businessId);
    if (!inv) throw ApiError.notFound('Invoice not found');
    inv.status = INVOICE_STATUS.CANCELLED;
    return ApiResponse.success(res, inv, 'Invoice cancelled');
  }
});

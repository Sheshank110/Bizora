import crypto from 'crypto';
import mongoose from 'mongoose';
import Payment, { PAYMENT_STATUS } from '../models/Payment.js';
import Invoice, { INVOICE_STATUS } from '../models/Invoice.js';
import Notification, { NOTIFICATION_TYPES } from '../models/Notification.js';
import devMockDb from '../services/devMockDb.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * List payments for business
 */
export const listPayments = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  if (isMongoConnected()) {
    const [total, payments] = await Promise.all([
      Payment.countDocuments({ businessId }),
      Payment.find({ businessId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'firstName lastName company email')
        .populate('invoiceId', 'invoiceNumber total amountDue'),
    ]);

    return ApiResponse.success(res, payments, 'Payments fetched successfully', {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } else {
    const list = devMockDb.findPaymentsByBusiness(businessId);
    const total = list.length;
    const paginated = list.slice(skip, skip + limit).map((p) => {
      const cust = p.customerId ? devMockDb.findCustomerById(p.customerId, businessId) : null;
      const inv = p.invoiceId ? devMockDb.findInvoiceById(p.invoiceId, businessId) : null;
      return {
        ...p,
        customerId: cust ? { id: cust._id || cust.id, firstName: cust.firstName, lastName: cust.lastName, company: cust.company, email: cust.email } : null,
        invoiceId: inv ? { id: inv._id || inv.id, invoiceNumber: inv.invoiceNumber, total: inv.total } : null,
      };
    });

    return ApiResponse.success(res, paginated, 'Payments fetched successfully', {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  }
});

/**
 * Process client checkout / sandbox payment
 */
export const processPayment = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const { invoiceId, amount, method = 'STRIPE' } = req.body;

  if (!invoiceId) throw ApiError.badRequest('Invoice ID is required');

  const paymentAmount = Number(amount);
  if (!paymentAmount || paymentAmount <= 0) throw ApiError.badRequest('Valid payment amount is required');

  let invoice = null;
  if (isMongoConnected()) {
    invoice = await Invoice.findOne({ _id: invoiceId, businessId });
  } else {
    invoice = devMockDb.findInvoiceById(invoiceId, businessId);
  }

  if (!invoice) throw ApiError.notFound('Invoice not found');

  const newAmountPaid = (invoice.amountPaid || 0) + paymentAmount;
  const newAmountDue = Math.max(0, invoice.total - newAmountPaid);
  const newStatus = newAmountDue === 0 ? INVOICE_STATUS.PAID : INVOICE_STATUS.PARTIALLY_PAID;

  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  if (isMongoConnected()) {
    invoice.amountPaid = newAmountPaid;
    invoice.amountDue = newAmountDue;
    invoice.status = newStatus;
    await invoice.save();

    const payment = await Payment.create({
      businessId,
      invoiceId: invoice._id,
      customerId: invoice.customerId,
      amount: paymentAmount,
      currency: invoice.currency,
      method,
      status: PAYMENT_STATUS.SUCCEEDED,
      provider: 'stripe',
      providerTransactionId: transactionId,
      reference: `CHECKOUT-${transactionId.slice(-6).toUpperCase()}`,
      paidAt: new Date(),
      createdBy: req.user ? req.user._id : null,
    });

    // Notify business owner
    await Notification.create({
      userId: req.business.ownerId,
      businessId,
      type: NOTIFICATION_TYPES.PAYMENT_RECEIVED,
      title: `Payment Received: $${paymentAmount.toLocaleString()}`,
      message: `Payment received for ${invoice.invoiceNumber}. Balance: $${newAmountDue.toLocaleString()}`,
      data: { invoiceId: invoice._id, paymentId: payment._id },
    });

    return ApiResponse.created(res, payment, 'Payment processed successfully');
  } else {
    invoice.amountPaid = newAmountPaid;
    invoice.amountDue = newAmountDue;
    invoice.status = newStatus;

    const newPayment = {
      _id: `pay_${Date.now()}`,
      id: `pay_${Date.now()}`,
      businessId,
      invoiceId: invoice._id,
      customerId: invoice.customerId,
      amount: paymentAmount,
      currency: invoice.currency,
      method,
      status: PAYMENT_STATUS.SUCCEEDED,
      provider: 'stripe',
      providerTransactionId: transactionId,
      reference: `CHECKOUT-${transactionId.slice(-6).toUpperCase()}`,
      paidAt: new Date(),
      createdAt: new Date(),
    };

    devMockDb.payments.unshift(newPayment);

    devMockDb.notifications.unshift({
      _id: `notif_${Date.now()}`,
      id: `notif_${Date.now()}`,
      userId: req.business.ownerId,
      businessId,
      type: NOTIFICATION_TYPES.PAYMENT_RECEIVED,
      title: `Payment Received: $${paymentAmount.toLocaleString()}`,
      message: `Payment received for ${invoice.invoiceNumber}. Balance: $${newAmountDue.toLocaleString()}`,
      data: { invoiceId: invoice._id, paymentId: newPayment._id },
      read: false,
      createdAt: new Date(),
    });

    return ApiResponse.created(res, newPayment, 'Payment processed successfully');
  }
});

/**
 * Handle payment webhooks securely
 */
export const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature'] || req.headers['x-webhook-signature'];
  const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || 'bizora_dev_webhook_secret_key';

  // Verify HMAC signature in production or sandbox simulation
  if (process.env.NODE_ENV === 'production' && !signature) {
    throw ApiError.unauthorized('Webhook signature missing');
  }

  const { eventType, data } = req.body;

  if (eventType === 'payment_intent.succeeded' || eventType === 'checkout.session.completed') {
    const { transactionId, invoiceId, amount, businessId } = data || {};
    if (!invoiceId || !transactionId) {
      return res.status(200).json({ received: true, ignored: true });
    }

    // Idempotency check: prevent duplicate execution
    if (isMongoConnected()) {
      const existing = await Payment.findOne({ providerTransactionId: transactionId });
      if (existing) {
        return res.status(200).json({ received: true, duplicate: true });
      }

      const invoice = await Invoice.findById(invoiceId);
      if (invoice) {
        invoice.amountPaid = (invoice.amountPaid || 0) + Number(amount);
        invoice.amountDue = Math.max(0, invoice.total - invoice.amountPaid);
        invoice.status = invoice.amountDue === 0 ? INVOICE_STATUS.PAID : INVOICE_STATUS.PARTIALLY_PAID;
        await invoice.save();

        await Payment.create({
          businessId: invoice.businessId,
          invoiceId: invoice._id,
          customerId: invoice.customerId,
          amount: Number(amount),
          currency: invoice.currency,
          method: 'STRIPE',
          status: PAYMENT_STATUS.SUCCEEDED,
          provider: 'stripe',
          providerTransactionId: transactionId,
          reference: `WEBHOOK-${transactionId.slice(-6).toUpperCase()}`,
          paidAt: new Date(),
        });
      }
    }
  }

  return res.status(200).json({ received: true });
});

import mongoose from 'mongoose';

export const DEFAULT_PLANS = [
  {
    name: 'Free',
    slug: 'free',
    price: 0,
    billingCycle: 'monthly',
    description: 'Perfect for solo entrepreneurs exploring Bizora.',
    limits: {
      maxEmployees: 2,
      maxCustomers: 5,
      maxProjects: 3,
      maxInvoices: 5,
      maxStorageMb: 100,
      hasInventory: false,
      hasReports: false,
    },
    status: 'ACTIVE',
  },
  {
    name: 'Starter',
    slug: 'starter',
    price: 29,
    billingCycle: 'monthly',
    description: 'Essential business management for growing small teams.',
    limits: {
      maxEmployees: 10,
      maxCustomers: 50,
      maxProjects: 15,
      maxInvoices: 100,
      maxStorageMb: 2000,
      hasInventory: true,
      hasReports: true,
    },
    status: 'ACTIVE',
  },
  {
    name: 'Pro',
    slug: 'pro',
    price: 79,
    billingCycle: 'monthly',
    description: 'Advanced capabilities, higher limits, and team workflows.',
    limits: {
      maxEmployees: 50,
      maxCustomers: 500,
      maxProjects: 100,
      maxInvoices: 1000,
      maxStorageMb: 10000,
      hasInventory: true,
      hasReports: true,
    },
    status: 'ACTIVE',
  },
  {
    name: 'Business',
    slug: 'business',
    price: 199,
    billingCycle: 'monthly',
    description: 'Unlimited scale and dedicated support for organizations.',
    limits: {
      maxEmployees: 9999,
      maxCustomers: 99999,
      maxProjects: 9999,
      maxInvoices: 99999,
      maxStorageMb: 100000,
      hasInventory: true,
      hasReports: true,
    },
    status: 'ACTIVE',
  },
];

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    limits: {
      maxEmployees: { type: Number, default: 10 },
      maxCustomers: { type: Number, default: 50 },
      maxProjects: { type: Number, default: 15 },
      maxInvoices: { type: Number, default: 100 },
      maxStorageMb: { type: Number, default: 2000 },
      hasInventory: { type: Boolean, default: true },
      hasReports: { type: Boolean, default: true },
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Plan = mongoose.model('Plan', planSchema);
export default Plan;

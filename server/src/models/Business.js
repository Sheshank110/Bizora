import mongoose from 'mongoose';
import { BUSINESS_TYPES, DEFAULT_CURRENCIES } from '../constants/index.js';

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: [100, 'Business name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
      index: true,
    },
    industry: {
      type: String,
      enum: BUSINESS_TYPES,
      default: 'other',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    logo: {
      type: String,
      default: '',
    },
    currency: {
      type: String,
      enum: DEFAULT_CURRENCIES,
      default: 'USD',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    address: {
      street: { type: String, trim: true, default: '' },
      city: { type: String, trim: true, default: '' },
      state: { type: String, trim: true, default: '' },
      postalCode: { type: String, trim: true, default: '' },
      country: { type: String, trim: true, default: '' },
    },
    contact: {
      email: { type: String, trim: true, lowercase: true, default: '' },
      phone: { type: String, trim: true, default: '' },
      website: { type: String, trim: true, default: '' },
    },
    taxId: {
      type: String,
      trim: true,
      default: '',
    },
    fiscalYearStart: {
      month: { type: Number, min: 1, max: 12, default: 1 },
      day: { type: Number, min: 1, max: 31, default: 1 },
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'archived'],
      default: 'active',
      index: true,
    },
    plan: {
      type: String,
      enum: ['free', 'starter', 'pro', 'enterprise'],
      default: 'free',
    },
    settings: {
      allowEmployeeInvites: { type: Boolean, default: false },
      require2FA: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Helper static method to generate unique slug
businessSchema.statics.generateUniqueSlug = async function (name) {
  let baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!baseSlug) baseSlug = 'workspace';

  let slug = baseSlug;
  let counter = 1;
  while (await this.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
  return slug;
};

const Business = mongoose.model('Business', businessSchema);
export default Business;

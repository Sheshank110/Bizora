import mongoose from 'mongoose';
import { USER_ROLES, MEMBERSHIP_STATUS } from '../constants/index.js';

const membershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business ID is required'],
      index: true,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.MEMBER,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(MEMBERSHIP_STATUS),
      default: MEMBERSHIP_STATUS.ACTIVE,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      default: '',
    },
    department: {
      type: String,
      trim: true,
      maxlength: [100, 'Department cannot exceed 100 characters'],
      default: '',
    },
    permissions: {
      type: [String],
      default: [],
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    inviteToken: {
      type: String,
      select: false,
    },
    inviteExpires: {
      type: Date,
      select: false,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.inviteToken;
        delete ret.inviteExpires;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Compound unique index: a user can only have one membership per business
membershipSchema.index({ userId: 1, businessId: 1 }, { unique: true });
membershipSchema.index({ businessId: 1, status: 1 });
membershipSchema.index({ userId: 1, status: 1 });

const Membership = mongoose.model('Membership', membershipSchema);
export default Membership;

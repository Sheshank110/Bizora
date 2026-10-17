import mongoose from 'mongoose';

export const EXPENSE_CATEGORIES = [
  'Office',
  'Marketing',
  'Travel',
  'Software',
  'Equipment',
  'Salary',
  'Utilities',
  'Other',
];

const expenseSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    category: {
      type: String,
      enum: EXPENSE_CATEGORIES,
      default: 'Office',
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    vendor: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
      default: '',
    },
    receipt: {
      type: String, // URL or storage path
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

expenseSchema.index({ businessId: 1, category: 1 });
expenseSchema.index({ businessId: 1, date: -1 });
expenseSchema.index({ businessId: 1, createdAt: -1 });

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;

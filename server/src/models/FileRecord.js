import mongoose from 'mongoose';

const fileRecordSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      trim: true,
      default: '',
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number, // in bytes
      required: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    storageKey: {
      type: String,
      trim: true,
      default: '',
    },
    entityType: {
      type: String,
      enum: ['Business', 'Customer', 'Project', 'Task', 'Invoice', 'Expense', 'General'],
      default: 'General',
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    clientVisible: {
      type: Boolean,
      default: false,
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

fileRecordSchema.index({ businessId: 1, entityType: 1, entityId: 1 });
fileRecordSchema.index({ businessId: 1, createdAt: -1 });

const FileRecord = mongoose.model('FileRecord', fileRecordSchema);
export default FileRecord;

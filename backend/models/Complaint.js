const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a complaint title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a complaint description'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: {
        values: ['road', 'garbage', 'water', 'electricity', 'other'],
        message: '{VALUE} is not a valid category',
      },
    },
    area: {
      type: String,
      required: [true, 'Please provide an area or location'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'in-progress', 'resolved'],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
    },
    // Visual Evidence Fields (Cloudinary)
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    imagePublicId: {
      type: String,
      default: '',
      trim: true,
    },
    resolutionImageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    resolutionImagePublicId: {
      type: String,
      default: '',
      trim: true,
    },
    upvotes: {
      type: Number,
      default: 0,
      min: [0, 'Upvotes cannot be negative'],
    },
    upvotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Complaint must have a creator'],
    },
    officerRemark: {
      type: String,
      default: '',
      trim: true,
    },
    feedbackRating: {
      type: Number,
      min: [1, 'Feedback rating must be at least 1'],
      max: [5, 'Feedback rating cannot exceed 5'],
    },
    feedbackComment: {
      type: String,
      default: '',
      trim: true,
    },
    feedbackGiven: {
      type: Boolean,
      default: false,
    },
    feedbackPending: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Optional text index for search support
complaintSchema.index({ title: 'text', description: 'text', area: 'text' });

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;

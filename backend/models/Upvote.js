const mongoose = require('mongoose');

const upvoteSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: [true, 'Complaint reference is required for an upvote'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'User reference is required for an upvote'],
      index: true,
    },
    userModel: {
      type: String,
      enum: ['Citizen', 'Officer', 'Staff', 'User'],
      default: 'Citizen',
    },
    userEmail: {
      type: String,
      default: '',
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'upvotes',
  }
);

// Prevent duplicate upvotes at database level with compound unique index
upvoteSchema.index({ complaint: 1, user: 1 }, { unique: true });

const Upvote = mongoose.model('Upvote', upvoteSchema);

module.exports = Upvote;

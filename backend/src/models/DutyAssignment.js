const mongoose = require('mongoose');

const dutyAssignmentSchema = new mongoose.Schema(
  {
    date: {
      type: String, // Stored as YYYY-MM-DD for simple unique querying
      required: [true, 'Date is required'],
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee is required'],
    },
    areas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Area',
      },
    ],
    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shift',
      default: null,
    },
    inTime: {
      type: String,
      default: '',
    },
    outTime: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['WORKING', 'OFF', 'ABSENT'],
      default: 'WORKING',
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Unique compound index: Only one assignment per employee per day
dutyAssignmentSchema.index({ date: 1, employee: 1 }, { unique: true });
dutyAssignmentSchema.index({ date: 1 });

// Auto-delete roster history older than 30 days (30 days = 30 * 24 * 60 * 60 = 2592000 seconds)
dutyAssignmentSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('DutyAssignment', dutyAssignmentSchema);

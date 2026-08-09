const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Shift Name is required'],
      unique: true,
      trim: true,
    },
    startTime: {
      type: String,
      required: [true, 'Start Time is required'],
    },
    endTime: {
      type: String,
      required: [true, 'End Time is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Shift', shiftSchema);

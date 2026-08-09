const Shift = require('../models/Shift');

// @desc    Get all shifts
// @route   GET /api/shifts
const getShifts = async (req, res) => {
  const shifts = await Shift.find().sort({ createdAt: 1 });
  res.json(shifts);
};

// @desc    Create shift
// @route   POST /api/shifts
const createShift = async (req, res) => {
  const { name, startTime, endTime } = req.body;

  const shiftExists = await Shift.findOne({ name });
  if (shiftExists) {
    return res.status(400).json({ message: 'Shift name already exists' });
  }

  const shift = await Shift.create({ name, startTime, endTime });
  res.status(201).json(shift);
};

// @desc    Update shift
// @route   PUT /api/shifts/:id
const updateShift = async (req, res) => {
  const { name, startTime, endTime, isActive } = req.body;
  const shift = await Shift.findById(req.params.id);

  if (shift) {
    shift.name = name || shift.name;
    shift.startTime = startTime || shift.startTime;
    shift.endTime = endTime || shift.endTime;
    if (isActive !== undefined) shift.isActive = isActive;

    const updatedShift = await shift.save();
    res.json(updatedShift);
  } else {
    res.status(404).json({ message: 'Shift not found' });
  }
};

// @desc    Delete shift
// @route   DELETE /api/shifts/:id
const deleteShift = async (req, res) => {
  const shift = await Shift.findById(req.params.id);

  if (shift) {
    await shift.deleteOne();
    res.json({ message: 'Shift removed' });
  } else {
    res.status(404).json({ message: 'Shift not found' });
  }
};

module.exports = {
  getShifts,
  createShift,
  updateShift,
  deleteShift,
};

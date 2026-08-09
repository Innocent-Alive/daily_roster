const DutyAssignment = require('../models/DutyAssignment');
const Employee = require('../models/Employee');
const Area = require('../models/Area');
const Shift = require('../models/Shift');

// @desc    Get dashboard statistics for specific date or today
// @route   GET /api/dashboard/stats?date=YYYY-MM-DD
const getDashboardStats = async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];

  const totalEmployees = await Employee.countDocuments({ isActive: true });
  const totalAreas = await Area.countDocuments({ isActive: true });
  const totalShifts = await Shift.countDocuments({ isActive: true });

  const assignments = await DutyAssignment.find({ date })
    .populate('employee')
    .populate('areas')
    .populate('shift');

  let workingCount = 0;
  let offCount = 0;
  let leaveCount = 0;
  let absentCount = 0;

  const shiftCounts = {};

  assignments.forEach((item) => {
    if (item.status === 'WORKING') {
      workingCount++;
      if (item.shift && item.shift.name) {
        shiftCounts[item.shift.name] = (shiftCounts[item.shift.name] || 0) + 1;
      }
    } else if (item.status === 'OFF') {
      offCount++;
    } else if (item.status === 'LEAVE') {
      leaveCount++;
    } else if (item.status === 'ABSENT') {
      absentCount++;
    }
  });

  // Calculate unassigned (draft working state default)
  const assignedEmployeeIds = new Set(assignments.map((a) => (a.employee?._id || a.employee).toString()));
  const unassignedCount = Math.max(0, totalEmployees - assignedEmployeeIds.size);

  res.json({
    date,
    totalEmployees,
    totalAreas,
    totalShifts,
    workingCount,
    offCount,
    leaveCount,
    absentCount,
    unassignedCount,
    shiftCounts,
    roster: assignments,
  });
};

module.exports = { getDashboardStats };

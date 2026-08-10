const DutyAssignment = require('../models/DutyAssignment');
const Employee = require('../models/Employee');
const Area = require('../models/Area');
const Shift = require('../models/Shift');

// @desc    Get dashboard statistics for specific date or today
// @route   GET /api/dashboard/stats?date=YYYY-MM-DD
const getDashboardStats = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];

    // Execute all queries in parallel instead of sequentially to reduce network round-trips
    const [totalEmployees, totalAreas, totalShifts, assignments] = await Promise.all([
      Employee.countDocuments({ isActive: true }).exec(),
      Area.countDocuments({ isActive: true }).exec(),
      Shift.countDocuments({ isActive: true }).exec(),
      DutyAssignment.find({ date })
        .populate('employee', 'name employeeCode mobileNumber designation')
        .populate('areas', 'name description')
        .populate('shift', 'name startTime endTime')
        .lean()
        .exec(),
    ]);

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
    const assignedEmployeeIds = new Set(
      assignments.map((a) => (a.employee?._id || a.employee || '').toString())
    );
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
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics', error: error.message });
  }
};

module.exports = { getDashboardStats };

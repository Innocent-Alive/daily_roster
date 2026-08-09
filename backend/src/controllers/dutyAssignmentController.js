const DutyAssignment = require('../models/DutyAssignment');
const Employee = require('../models/Employee');
const Area = require('../models/Area');
const Shift = require('../models/Shift');

// @desc    Get duty assignments for a specific date (auto merge active employees)
// @route   GET /api/duty-assignments?date=YYYY-MM-DD
const getDutyAssignmentsByDate = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: 'Date parameter is required (YYYY-MM-DD)' });
  }

  // Fetch active employees
  const activeEmployees = await Employee.find({ isActive: true }).sort({ name: 1 });
  const areas = await Area.find({ isActive: true }).sort({ name: 1 });
  const shifts = await Shift.find({ isActive: true }).sort({ startTime: 1 });

  // Fetch existing assignments for target date
  const existingAssignments = await DutyAssignment.find({ date })
    .populate('employee')
    .populate('areas')
    .populate('shift');

  const assignmentMap = new Map();
  existingAssignments.forEach((item) => {
    if (item.employee) {
      assignmentMap.set(item.employee._id.toString(), item);
    }
  });

  // Default shift and area defaults if available
  const defaultArea = areas.length > 0 ? areas[0]._id : null;
  const defaultShift = shifts.length > 0 ? shifts[0] : null;

  // Ensure every active employee has a roster object (saved or draft)
  const rosterList = activeEmployees.map((emp) => {
    const existing = assignmentMap.get(emp._id.toString());
    if (existing) {
      const existingObj = existing.toObject ? existing.toObject() : existing;
      return {
        ...existingObj,
        areas: existingObj.areas || [],
      };
    }

    // Return synthetic draft assignment for non-saved active employee
    return {
      _id: `draft_${emp._id}`,
      date,
      employee: emp,
      areas: defaultArea ? [defaultArea] : [],
      shift: defaultShift ? defaultShift._id : null,
      inTime: defaultShift ? defaultShift.startTime : '07:00',
      outTime: defaultShift ? defaultShift.endTime : '15:30',
      status: 'WORKING',
      remarks: '',
      isDraft: true,
    };
  });

  res.json({
    date,
    roster: rosterList,
    meta: {
      totalEmployees: activeEmployees.length,
      savedCount: existingAssignments.length,
    },
  });
};

// @desc    Bulk save / update duty roster for a date
// @route   POST /api/duty-assignments/bulk
const saveBulkDutyAssignments = async (req, res) => {
  const { date, assignments } = req.body;

  if (!date || !Array.isArray(assignments)) {
    return res.status(400).json({ message: 'Date and assignments array are required' });
  }

  try {
    const operations = assignments.map((item) => {
      const isOffOrAbsent = item.status === 'OFF' || item.status === 'ABSENT';

      // Parse areas array
      let areaArray = [];
      if (Array.isArray(item.areas)) {
        areaArray = item.areas;
      } else if (item.area) {
        areaArray = [item.area];
      }

      const updateData = {
        date,
        employee: item.employee,
        areas: isOffOrAbsent ? [] : areaArray,
        shift: isOffOrAbsent ? null : item.shift || null,
        inTime: isOffOrAbsent ? '' : item.inTime || '',
        outTime: isOffOrAbsent ? '' : item.outTime || '',
        status: item.status || 'WORKING',
        remarks: item.remarks || '',
      };

      return {
        updateOne: {
          filter: { date, employee: item.employee },
          update: { $set: updateData },
          upsert: true,
        },
      };
    });

    if (operations.length > 0) {
      await DutyAssignment.bulkWrite(operations);
    }

    // Re-fetch saved roster
    const updatedAssignments = await DutyAssignment.find({ date })
      .populate('employee')
      .populate('areas')
      .populate('shift');

    res.json({
      message: 'Duty roster saved successfully',
      date,
      roster: updatedAssignments,
    });
  } catch (error) {
    console.error('Error saving roster bulk:', error);
    res.status(500).json({ message: 'Failed to save duty roster', error: error.message });
  }
};

// @desc    Copy previous day's duty roster
// @route   POST /api/duty-assignments/copy-previous
const copyPreviousDayRoster = async (req, res) => {
  const { targetDate, sourceDate } = req.body;

  if (!targetDate) {
    return res.status(400).json({ message: 'Target date is required' });
  }

  // If sourceDate is not explicitly passed, compute targetDate - 1 day
  let prevDateStr = sourceDate;
  if (!prevDateStr) {
    const target = new Date(targetDate);
    target.setDate(target.getDate() - 1);
    prevDateStr = target.toISOString().split('T')[0];
  }

  // Get source roster
  const sourceAssignments = await DutyAssignment.find({ date: prevDateStr });

  if (!sourceAssignments || sourceAssignments.length === 0) {
    return res.status(404).json({ message: `No duty roster found for previous date (${prevDateStr})` });
  }

  const operations = sourceAssignments.map((item) => ({
    updateOne: {
      filter: { date: targetDate, employee: item.employee },
      update: {
        $set: {
          date: targetDate,
          employee: item.employee,
          area: item.area,
          shift: item.shift,
          inTime: item.inTime,
          outTime: item.outTime,
          status: item.status,
          remarks: item.remarks,
        },
      },
      upsert: true,
    },
  }));

  await DutyAssignment.bulkWrite(operations);

  // Return copied roster
  const copiedRoster = await DutyAssignment.find({ date: targetDate })
    .populate('employee')
    .populate('area')
    .populate('shift');

  res.json({
    message: `Duty roster successfully copied from ${prevDateStr} to ${targetDate}`,
    roster: copiedRoster,
  });
};

// @desc    Get roster history dates list (only last 30 days)
// @route   GET /api/duty-assignments/history
const getRosterHistoryDates = async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffDateStr = thirtyDaysAgo.toISOString().split('T')[0];

  // Auto-delete records older than 30 days
  await DutyAssignment.deleteMany({ date: { $lt: cutoffDateStr } });

  const historyDates = await DutyAssignment.aggregate([
    { $match: { date: { $gte: cutoffDateStr } } },
    {
      $group: {
        _id: '$date',
        totalAssigned: { $sum: 1 },
        workingCount: {
          $sum: { $cond: [{ $eq: ['$status', 'WORKING'] }, 1, 0] },
        },
        offCount: {
          $sum: { $cond: [{ $eq: ['$status', 'OFF'] }, 1, 0] },
        },
        absentCount: {
          $sum: { $cond: [{ $eq: ['$status', 'ABSENT'] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  res.json(historyDates);
};

module.exports = {
  getDutyAssignmentsByDate,
  saveBulkDutyAssignments,
  copyPreviousDayRoster,
  getRosterHistoryDates,
};

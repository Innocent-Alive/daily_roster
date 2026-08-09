const express = require('express');
const router = express.Router();
const {
  getDutyAssignmentsByDate,
  saveBulkDutyAssignments,
  copyPreviousDayRoster,
  getRosterHistoryDates,
} = require('../controllers/dutyAssignmentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getDutyAssignmentsByDate);
router.post('/bulk', protect, saveBulkDutyAssignments);
router.post('/copy-previous', protect, copyPreviousDayRoster);
router.get('/history', protect, getRosterHistoryDates);

module.exports = router;

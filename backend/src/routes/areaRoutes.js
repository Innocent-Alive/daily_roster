const express = require('express');
const router = express.Router();
const {
  getAreas,
  createArea,
  updateArea,
  deleteArea,
} = require('../controllers/areaController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getAreas).post(protect, createArea);
router.route('/:id').put(protect, updateArea).delete(protect, deleteArea);

module.exports = router;

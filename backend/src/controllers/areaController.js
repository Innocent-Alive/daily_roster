const Area = require('../models/Area');

// @desc    Get all areas
// @route   GET /api/areas
const getAreas = async (req, res) => {
  const areas = await Area.find().sort({ createdAt: 1 });
  res.json(areas);
};

// @desc    Create area
// @route   POST /api/areas
const createArea = async (req, res) => {
  const { name, description } = req.body;

  const areaExists = await Area.findOne({ name });
  if (areaExists) {
    return res.status(400).json({ message: 'Area name already exists' });
  }

  const area = await Area.create({ name, description });
  res.status(201).json(area);
};

// @desc    Update area
// @route   PUT /api/areas/:id
const updateArea = async (req, res) => {
  const { name, description, isActive } = req.body;
  const area = await Area.findById(req.params.id);

  if (area) {
    area.name = name || area.name;
    area.description = description !== undefined ? description : area.description;
    if (isActive !== undefined) area.isActive = isActive;

    const updatedArea = await area.save();
    res.json(updatedArea);
  } else {
    res.status(404).json({ message: 'Area not found' });
  }
};

// @desc    Delete area
// @route   DELETE /api/areas/:id
const deleteArea = async (req, res) => {
  const area = await Area.findById(req.params.id);

  if (area) {
    await area.deleteOne();
    res.json({ message: 'Area removed' });
  } else {
    res.status(404).json({ message: 'Area not found' });
  }
};

module.exports = {
  getAreas,
  createArea,
  updateArea,
  deleteArea,
};

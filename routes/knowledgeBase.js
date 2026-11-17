const express = require('express');
const router = express.Router();
const Crop = require('../models/Crop');
const Fertilizer = require('../models/Fertilizer');
const Rule = require('../models/Rule');

// Get knowledge base
router.get('/', async (req, res) => {
  try {
    const crops = await Crop.find().select('-__v');
    const fertilizers = await Fertilizer.find().select('-__v');
    const rules = await Rule.find().select('-__v');

    res.json({
      crops,
      fertilizers,
      rules
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;


const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const Crop = require('../models/Crop');
const Rule = require('../models/Rule');
const Fertilizer = require('../models/Fertilizer');
const Feedback = require('../models/Feedback');
const Recommendation = require('../models/Recommendation');
const User = require('../models/User');
const { validateCrop, validateFertilizer, validateRule } = require('../middleware/validation');

// Add/Update crop profile
router.post('/crops', adminAuth, validateCrop, async (req, res) => {
  try {
    const { cropId, cropName, typicalNPK, recommendedFertilizers, notes } = req.body;

    // If recommendedFertilizers provided, validate fertilizer IDs
    if (recommendedFertilizers && Array.isArray(recommendedFertilizers)) {
      for (const recFert of recommendedFertilizers) {
        if (recFert.fertilizerId) {
          const fertilizer = await Fertilizer.findOne({ fertilizerId: recFert.fertilizerId });
          if (!fertilizer) {
            return res.status(404).json({ message: `Fertilizer with ID ${recFert.fertilizerId} not found` });
          }
        }
      }
    }

    let crop = await Crop.findOne({ cropId });
    
    if (crop) {
      // Update existing crop
      crop.cropName = cropName || crop.cropName;
      crop.typicalNPK = typicalNPK || crop.typicalNPK;
      crop.recommendedFertilizers = recommendedFertilizers || crop.recommendedFertilizers;
      crop.notes = notes || crop.notes;
      await crop.save();
      res.json({ message: 'Crop updated successfully', crop });
    } else {
      // Check for duplicate cropId if provided
      if (cropId) {
        const existingCrop = await Crop.findOne({ cropId });
        if (existingCrop) {
          return res.status(400).json({ message: `Crop with ID ${cropId} already exists` });
        }
      }
      
      // Create new crop
      const newCropId = cropId || 'CROP' + Date.now().toString();
      crop = new Crop({
        cropId: newCropId,
        cropName,
        typicalNPK,
        recommendedFertilizers: recommendedFertilizers || [],
        notes
      });
      await crop.save();
      res.status(201).json({ message: 'Crop created successfully', crop });
    }
  } catch (error) {
    console.error('Crop save error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Crop ID already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete crop
router.delete('/crops/:cropId', adminAuth, async (req, res) => {
  try {
    const { cropId } = req.params;
    
    const crop = await Crop.findOne({ cropId });
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }
    
    await Crop.deleteOne({ cropId });
    res.json({ message: 'Crop deleted successfully' });
  } catch (error) {
    console.error('Delete crop error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add/Update fertilizer rule
router.post('/rules', adminAuth, validateRule, async (req, res) => {
  try {
    const { ruleId, cropId, condition, recommendations } = req.body;

    // Verify crop exists
    const crop = await Crop.findOne({ cropId });
    if (!crop) {
      return res.status(404).json({ message: `Crop with ID ${cropId} not found` });
    }

    // Verify all fertilizers exist
    for (const rec of recommendations) {
      const fertilizer = await Fertilizer.findOne({ fertilizerId: rec.fertilizerId });
      if (!fertilizer) {
        return res.status(404).json({ message: `Fertilizer with ID ${rec.fertilizerId} not found` });
      }
    }

    let rule = await Rule.findOne({ ruleId });
    
    if (rule) {
      // Update existing rule
      rule.cropId = cropId || rule.cropId;
      rule.condition = condition || rule.condition;
      rule.recommendations = recommendations || rule.recommendations;
      await rule.save();
      res.json({ message: 'Rule updated successfully', rule });
    } else {
      // Check for duplicate ruleId if provided
      if (ruleId) {
        const existingRule = await Rule.findOne({ ruleId });
        if (existingRule) {
          return res.status(400).json({ message: `Rule with ID ${ruleId} already exists` });
        }
      }
      
      // Create new rule
      const newRuleId = ruleId || 'RULE' + Date.now().toString();
      rule = new Rule({
        ruleId: newRuleId,
        cropId,
        condition,
        recommendations
      });
      await rule.save();
      res.status(201).json({ message: 'Rule created successfully', rule });
    }
  } catch (error) {
    console.error('Rule save error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Rule ID already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update fertilizer rule (PUT)
router.put('/rules', adminAuth, validateRule, async (req, res) => {
  try {
    const { ruleId, cropId, condition, recommendations } = req.body;

    if (!ruleId) {
      return res.status(400).json({ message: 'ruleId is required' });
    }

    const rule = await Rule.findOne({ ruleId });
    
    if (!rule) {
      return res.status(404).json({ message: 'Rule not found' });
    }

    // Verify crop exists if cropId is being updated
    if (cropId && cropId !== rule.cropId) {
      const crop = await Crop.findOne({ cropId });
      if (!crop) {
        return res.status(404).json({ message: `Crop with ID ${cropId} not found` });
      }
    }

    // Verify all fertilizers exist if recommendations are being updated
    if (recommendations && Array.isArray(recommendations)) {
      for (const rec of recommendations) {
        const fertilizer = await Fertilizer.findOne({ fertilizerId: rec.fertilizerId });
        if (!fertilizer) {
          return res.status(404).json({ message: `Fertilizer with ID ${rec.fertilizerId} not found` });
        }
      }
    }

    rule.cropId = cropId || rule.cropId;
    rule.condition = condition || rule.condition;
    rule.recommendations = recommendations || rule.recommendations;
    await rule.save();

    res.json({ message: 'Rule updated successfully', rule });
  } catch (error) {
    console.error('Rule update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add/Update fertilizer
router.post('/fertilizers', adminAuth, validateFertilizer, async (req, res) => {
  try {
    const { fertilizerId, name, nutrientComposition, type, instructions } = req.body;

    let fertilizer = await Fertilizer.findOne({ fertilizerId });
    
    if (fertilizer) {
      // Update existing fertilizer
      fertilizer.name = name || fertilizer.name;
      fertilizer.nutrientComposition = nutrientComposition || fertilizer.nutrientComposition;
      fertilizer.type = type || fertilizer.type;
      fertilizer.instructions = instructions || fertilizer.instructions;
      await fertilizer.save();
      res.json({ message: 'Fertilizer updated successfully', fertilizer });
    } else {
      // Check for duplicate fertilizerId if provided
      if (fertilizerId) {
        const existingFertilizer = await Fertilizer.findOne({ fertilizerId });
        if (existingFertilizer) {
          return res.status(400).json({ message: `Fertilizer with ID ${fertilizerId} already exists` });
        }
      }
      
      // Create new fertilizer
      const newFertilizerId = fertilizerId || 'FERT' + Date.now().toString();
      fertilizer = new Fertilizer({
        fertilizerId: newFertilizerId,
        name,
        nutrientComposition,
        type,
        instructions
      });
      await fertilizer.save();
      res.status(201).json({ message: 'Fertilizer created successfully', fertilizer });
    }
  } catch (error) {
    console.error('Fertilizer save error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Fertilizer ID already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all feedbacks (Admin only)
router.get('/feedbacks', adminAuth, async (req, res) => {
  try {
    const { limit = 50, sort = 'desc' } = req.query;
    
    const feedbacks = await Feedback.find()
      .sort({ createdAt: sort === 'asc' ? 1 : -1 })
      .limit(parseInt(limit))
      .lean();

    // Populate user and recommendation details
    const feedbacksWithDetails = await Promise.all(
      feedbacks.map(async (feedback) => {
        try {
          const user = await User.findOne({ userId: feedback.userId }).select('name email').lean();
          const recommendation = await Recommendation.findOne({ recId: feedback.recId })
            .select('cropId growthStage soilInput area').lean();
          
          return {
            ...feedback,
            user: user || { name: 'Unknown User', email: 'N/A' },
            recommendation: recommendation || null
          };
        } catch (err) {
          console.error('Error populating feedback details:', err);
          return {
            ...feedback,
            user: { name: 'Unknown User', email: 'N/A' },
            recommendation: null
          };
        }
      })
    );

    // Calculate statistics
    let totalFeedbacks = 0;
    let avgRating = [{ avgRating: 0 }];
    let ratingDistribution = [];
    
    try {
      totalFeedbacks = await Feedback.countDocuments();
      
      if (totalFeedbacks > 0) {
        avgRating = await Feedback.aggregate([
          { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]);
        
        ratingDistribution = await Feedback.aggregate([
          { $group: { _id: '$rating', count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ]);
      }
    } catch (statsError) {
      console.error('Error calculating statistics:', statsError);
      // Continue with default values
    }

    const statistics = {
      total: totalFeedbacks,
      averageRating: avgRating[0]?.avgRating ? avgRating[0].avgRating.toFixed(2) : '0.00',
      ratingDistribution: ratingDistribution.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };

    res.json({
      feedbacks: feedbacksWithDetails,
      statistics: statistics
    });
  } catch (error) {
    console.error('Get feedbacks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get feedback statistics (Admin only)
router.get('/feedbacks/stats', adminAuth, async (req, res) => {
  try {
    const totalFeedbacks = await Feedback.countDocuments();
    
    const avgRating = await Feedback.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    
    const ratingDistribution = await Feedback.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const feedbacksWithComments = await Feedback.countDocuments({
      comments: { $exists: true, $ne: '' }
    });

    const recentFeedbacks = await Feedback.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });

    res.json({
      total: totalFeedbacks,
      averageRating: avgRating[0]?.avgRating ? avgRating[0].avgRating.toFixed(2) : 0,
      ratingDistribution: ratingDistribution.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      feedbacksWithComments,
      recentFeedbacks
    });
  } catch (error) {
    console.error('Get feedback stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;


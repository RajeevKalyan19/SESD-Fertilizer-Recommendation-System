const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Recommendation = require('../models/Recommendation');
const Feedback = require('../models/Feedback');
const Crop = require('../models/Crop');
const recommendationEngine = require('../services/recommendationEngine');
const { validateRecommendationRequest } = require('../middleware/validation');

// Request recommendation
router.post('/request', auth, validateRecommendationRequest, async (req, res) => {
  try {
    const { cropId, soilInput, growthStage, area } = req.body;

    // Verify crop exists
    const crop = await Crop.findOne({ cropId });
    if (!crop) {
      return res.status(404).json({ message: `Crop with ID ${cropId} not found` });
    }

    // Generate recommendation
    const recommendations = await recommendationEngine.generateRecommendation({
      cropId,
      soilInput,
      growthStage,
      area
    });

    // Save recommendation
    const recId = 'REC' + Date.now().toString();
    const recommendation = new Recommendation({
      recId,
      userId: req.user.userId,
      cropId,
      soilInput,
      growthStage,
      area,
      generatedRecommendations: recommendations
    });

    await recommendation.save();

    res.status(201).json({
      message: 'Recommendation generated successfully',
      recommendation: {
        recId: recommendation.recId,
        cropId: recommendation.cropId,
        soilInput: recommendation.soilInput,
        growthStage: recommendation.growthStage,
        area: recommendation.area,
        generatedRecommendations: recommendation.generatedRecommendations,
        createdAt: recommendation.createdAt
      }
    });
  } catch (error) {
    console.error('Recommendation request error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get recommendation by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const recommendation = await Recommendation.findOne({ recId: req.params.id });
    
    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    // Check if user owns this recommendation
    if (recommendation.userId !== req.user.userId && req.user.role !== 'agronomist') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(recommendation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Save recommendation (already saved, but can be used for marking as favorite)
router.post('/:id/save', auth, async (req, res) => {
  try {
    const recommendation = await Recommendation.findOne({ recId: req.params.id });
    
    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    if (recommendation.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ message: 'Recommendation saved successfully', recommendation });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's feedbacks (MUST come before /user/:userId to avoid route conflict)
router.get('/user/:userId/feedbacks', auth, async (req, res) => {
  try {
    // Check if user is accessing their own feedbacks or is admin
    if (req.params.userId !== req.user.userId && req.user.role !== 'agronomist') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const feedbacks = await Feedback.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .lean();

    // Populate recommendation details
    const feedbacksWithDetails = await Promise.all(
      feedbacks.map(async (feedback) => {
        const recommendation = await Recommendation.findOne({ recId: feedback.recId })
          .select('cropId growthStage soilInput area createdAt').lean();
        
        return {
          ...feedback,
          recommendation: recommendation || null
        };
      })
    );

    res.json(feedbacksWithDetails);
  } catch (error) {
    console.error('Get user feedbacks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user history
router.get('/user/:userId', auth, async (req, res) => {
  try {
    // Check if user is accessing their own history or is admin
    if (req.params.userId !== req.user.userId && req.user.role !== 'agronomist') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const recommendations = await Recommendation.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit feedback
router.post('/:id/feedback', auth, async (req, res) => {
  try {
    const { rating, comments } = req.body;
    
    // Validate rating
    if (rating === undefined || rating === null) {
      return res.status(400).json({ message: 'Rating is required' });
    }
    
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }
    
    const recommendation = await Recommendation.findOne({ recId: req.params.id });
    
    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    if (recommendation.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const feedbackId = 'FB' + Date.now().toString();
    const feedback = new Feedback({
      feedbackId,
      recId: req.params.id,
      userId: req.user.userId,
      rating: Math.round(rating),
      comments: comments || ''
    });

    await feedback.save();

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;


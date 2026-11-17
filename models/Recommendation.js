const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  recId: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  cropId: {
    type: String,
    required: true
  },
  soilInput: {
    pH: Number,
    N: { type: String, enum: ['low', 'medium', 'high'] },
    P: { type: String, enum: ['low', 'medium', 'high'] },
    K: { type: String, enum: ['low', 'medium', 'high'] }
  },
  growthStage: {
    type: String,
    enum: ['sowing', 'vegetative', 'flowering', 'fruiting']
  },
  area: {
    value: Number,
    unit: { type: String, default: 'hectare' }
  },
  generatedRecommendations: [{
    fertilizerId: String,
    fertilizerName: String,
    quantity: Number,
    unit: String,
    timing: String,
    instructions: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Recommendation', recommendationSchema);


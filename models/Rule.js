const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  ruleId: {
    type: String,
    unique: true,
    required: true
  },
  cropId: {
    type: String,
    required: true
  },
  condition: {
    soilPhRange: {
      min: Number,
      max: Number
    },
    NPK: {
      N: { type: String, enum: ['low', 'medium', 'high', null] },
      P: { type: String, enum: ['low', 'medium', 'high', null] },
      K: { type: String, enum: ['low', 'medium', 'high', null] }
    },
    growthStage: {
      type: String,
      enum: ['sowing', 'vegetative', 'flowering', 'fruiting', null]
    }
  },
  recommendations: [{
    fertilizerId: String,
    quantityPerHa: Number,
    timing: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Rule', ruleSchema);


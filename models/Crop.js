const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  cropId: {
    type: String,
    unique: true,
    required: true
  },
  cropName: {
    type: String,
    required: true
  },
  typicalNPK: {
    N: { type: Number },
    P: { type: Number },
    K: { type: Number }
  },
  recommendedFertilizers: [{
    fertilizerId: String,
    dosageRules: {
      low: Number,
      medium: Number,
      high: Number
    }
  }],
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Crop', cropSchema);


const mongoose = require('mongoose');

const fertilizerSchema = new mongoose.Schema({
  fertilizerId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  nutrientComposition: {
    N: { type: Number, default: 0 },
    P: { type: Number, default: 0 },
    K: { type: Number, default: 0 }
  },
  type: {
    type: String,
    enum: ['Urea', 'DAP', 'Organic', 'NPK', 'Other'],
    required: true
  },
  instructions: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Fertilizer', fertilizerSchema);


const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  uses: { type: String, default: '' },
  dosage: { type: String, default: '' },
  precautions: { type: String, default: '' },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  category: { type: String, required: true },
  image: { type: String, default: '' },
  requiresPrescription: { type: Boolean, default: false },
  
  // New Upgraded Fields
  batchNumber: { type: String, default: '' },
  expiryDate: { type: String, default: '' }, // YYYY-MM-DD
  manufacturer: { type: String, default: '' },
  composition: { type: String, default: '' },
  symptoms: [{ type: String }],
  isGeneric: { type: Boolean, default: false },
  genericSubstituteName: { type: String, default: '' },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Medicine', medicineSchema);

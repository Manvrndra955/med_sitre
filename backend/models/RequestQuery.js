const mongoose = require('mongoose');

const requestQuerySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  userPhone: { type: String, required: true },
  medicineName: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  dueDateTime: { type: String, required: true },
  note: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'in-review', 'fulfilled', 'rejected'], default: 'pending' },
  adminReply: { type: String, default: '' },
  repliedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RequestQuery', requestQuerySchema);

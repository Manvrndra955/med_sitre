const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const RequestQuery = require('../models/RequestQuery');
const { verifyToken, adminOnly } = require('../middleware/auth');
const { inMemoryRequests } = require('../utils/store');
const { sendRequestReplyEmail } = require('../utils/email');

// POST submit medicine request (User)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { medicineName, quantity, dueDateTime, note } = req.body;

    if (!medicineName || !dueDateTime) {
      return res.status(400).json({ error: 'Medicine name and due date/time are required.' });
    }

    let newReq;
    if (mongoose.connection.readyState === 1) {
      newReq = await RequestQuery.create({
        userId: req.user.id,
        userName: req.user.name,
        userEmail: req.user.email,
        userPhone: req.user.phone || 'N/A',
        medicineName,
        quantity: Number(quantity) || 1,
        dueDateTime,
        note: note || '',
        status: 'pending'
      });
    } else {
      newReq = {
        _id: 'req-' + Date.now(),
        userId: req.user.id,
        userName: req.user.name,
        userEmail: req.user.email,
        userPhone: req.user.phone || 'N/A',
        medicineName,
        quantity: Number(quantity) || 1,
        dueDateTime,
        note: note || '',
        status: 'pending',
        adminReply: '',
        createdAt: new Date()
      };
      inMemoryRequests.unshift(newReq);
    }

    res.status(201).json({ message: 'Special medicine request submitted successfully!', request: newReq });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET user requests (User)
router.get('/user', verifyToken, async (req, res) => {
  try {
    let requests;
    if (mongoose.connection.readyState === 1) {
      requests = await RequestQuery.find({ userId: req.user.id }).sort({ createdAt: -1 });
    } else {
      requests = inMemoryRequests.filter(r => r.userId.toString() === req.user.id.toString());
    }

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all requests (Admin)
router.get('/admin', verifyToken, adminOnly, async (req, res) => {
  try {
    let requests;
    if (mongoose.connection.readyState === 1) {
      requests = await RequestQuery.find().sort({ createdAt: -1 });
    } else {
      requests = [...inMemoryRequests];
    }

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT admin reply to request (Admin with Email Notification)
router.put('/:id/reply', verifyToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { adminReply, status } = req.body;

    if (!adminReply) {
      return res.status(400).json({ error: 'Please enter a reply message for the customer.' });
    }

    let updated;
    if (mongoose.connection.readyState === 1) {
      updated = await RequestQuery.findByIdAndUpdate(
        id,
        {
          adminReply,
          status: status || 'fulfilled',
          repliedAt: new Date()
        },
        { new: true }
      );
    } else {
      const idx = inMemoryRequests.findIndex(r => r._id.toString() === id);
      if (idx !== -1) {
        inMemoryRequests[idx].adminReply = adminReply;
        inMemoryRequests[idx].status = status || 'fulfilled';
        inMemoryRequests[idx].repliedAt = new Date();
        updated = inMemoryRequests[idx];
      }
    }

    if (!updated) return res.status(404).json({ error: 'Request query not found.' });

    // Trigger Email Notification to user
    sendRequestReplyEmail(updated);

    res.json({ message: 'Reply submitted successfully!', request: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

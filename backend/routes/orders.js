const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const { verifyToken, adminOnly } = require('../middleware/auth');
const { inMemoryOrders, inMemoryMedicines } = require('../utils/store');
const { sendOrderConfirmationEmail } = require('../utils/email');

// POST place order (User with Payment Methods & Email Receipt)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { items, deliveryAddress, totalAmount, paymentMethod, paymentStatus, transactionId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty.' });
    }

    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city) {
      return res.status(400).json({ error: 'Please provide a valid delivery address.' });
    }

    const payMethod = paymentMethod || 'COD';
    const payStatus = paymentStatus || (payMethod === 'COD' ? 'pending' : 'paid');
    const txnId = transactionId || (payMethod === 'COD' ? 'N/A' : `TXN-${Math.floor(100000000 + Math.random() * 900000000)}`);

    let newOrder;
    if (mongoose.connection.readyState === 1) {
      for (const item of items) {
        const med = await Medicine.findById(item.medicineId);
        if (med) {
          med.stock = Math.max(0, med.stock - item.quantity);
          await med.save();
        }
      }

      newOrder = await Order.create({
        userId: req.user.id,
        userName: req.user.name,
        userEmail: req.user.email,
        userPhone: req.user.phone || 'N/A',
        deliveryAddress,
        items,
        totalAmount: Number(totalAmount),
        status: 'pending',
        paymentMethod: payMethod,
        paymentStatus: payStatus,
        transactionId: txnId
      });
    } else {
      for (const item of items) {
        const med = inMemoryMedicines.find(m => m._id.toString() === item.medicineId.toString());
        if (med) {
          med.stock = Math.max(0, med.stock - item.quantity);
        }
      }

      newOrder = {
        _id: 'ord-' + Date.now(),
        userId: req.user.id,
        userName: req.user.name,
        userEmail: req.user.email,
        userPhone: req.user.phone || 'N/A',
        deliveryAddress,
        items,
        totalAmount: Number(totalAmount),
        status: 'pending',
        paymentMethod: payMethod,
        paymentStatus: payStatus,
        transactionId: txnId,
        createdAt: new Date()
      };
      inMemoryOrders.unshift(newOrder);
    }

    // Trigger async confirmation email
    sendOrderConfirmationEmail(newOrder);

    return res.status(201).json({ message: 'Order placed successfully!', order: newOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET user orders
router.get('/user', verifyToken, async (req, res) => {
  try {
    let orders;
    if (mongoose.connection.readyState === 1) {
      orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    } else {
      orders = inMemoryOrders.filter(o => o.userId.toString() === req.user.id.toString());
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET admin orders & today's summary metrics
router.get('/admin', verifyToken, adminOnly, async (req, res) => {
  try {
    let allOrders;
    if (mongoose.connection.readyState === 1) {
      allOrders = await Order.find().sort({ createdAt: -1 });
    } else {
      allOrders = [...inMemoryOrders];
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const completedToday = allOrders.filter(o => {
      const d = new Date(o.createdAt).toISOString().split('T')[0];
      return d === todayStr && o.status === 'completed';
    }).length;

    const pendingToday = allOrders.filter(o => {
      const d = new Date(o.createdAt).toISOString().split('T')[0];
      return d === todayStr && o.status === 'pending';
    }).length;

    const totalRevenue = allOrders
      .filter(o => o.status === 'completed' || o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    res.json({
      orders: allOrders,
      metrics: {
        completedToday,
        pendingToday,
        totalCompletedOverall: allOrders.filter(o => o.status === 'completed').length,
        totalPendingOverall: allOrders.filter(o => o.status === 'pending').length,
        totalRevenue
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update order status (Admin)
router.put('/:id/status', verifyToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const updates = {};
    if (status) updates.status = status;
    if (paymentStatus) updates.paymentStatus = paymentStatus;

    let updated;
    if (mongoose.connection.readyState === 1) {
      updated = await Order.findByIdAndUpdate(id, updates, { new: true });
    } else {
      const idx = inMemoryOrders.findIndex(o => o._id.toString() === id);
      if (idx !== -1) {
        if (status) inMemoryOrders[idx].status = status;
        if (paymentStatus) inMemoryOrders[idx].paymentStatus = paymentStatus;
        updated = inMemoryOrders[idx];
      }
    }

    if (!updated) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order updated!', order: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

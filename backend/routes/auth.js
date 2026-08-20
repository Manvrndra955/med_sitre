const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = require('../models/User');
const { createCaptcha, verifyCaptcha } = require('../utils/captcha');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');
const { inMemoryUsers } = require('../utils/store');

// GET captcha
router.get('/captcha', (req, res) => {
  const { captchaId, svg } = createCaptcha();
  res.json({ captchaId, svg });
});

// POST signup
router.post('/signup', async (req, res) => {
  try {
    const { name, age, email, phone, password, address, role } = req.body;

    if (!name || !email || !password || !phone || !age) {
      return res.status(400).json({ error: 'Please provide all required fields (Name, Age, Email, Phone, Password).' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'admin' ? 'admin' : 'customer';

    const formattedAddress = {
      street: address?.street || '',
      city: address?.city || '',
      state: address?.state || '',
      pincode: address?.pincode || ''
    };

    let newUser;
    if (mongoose.connection.readyState === 1) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }

      newUser = await User.create({
        name,
        age: Number(age),
        email: cleanEmail,
        phone,
        password: hashedPassword,
        address: formattedAddress,
        role: userRole
      });
    } else {
      // In-memory mode
      const existing = inMemoryUsers.find(u => u.email === cleanEmail);
      if (existing) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }

      newUser = {
        _id: 'usr-' + Date.now(),
        name,
        age: Number(age),
        email: cleanEmail,
        phone,
        password: hashedPassword,
        address: formattedAddress,
        role: userRole,
        createdAt: new Date()
      };
      inMemoryUsers.push(newUser);
    }

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, name: newUser.name, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userResponse = { ...newUser._doc || newUser };
    delete userResponse.password;

    res.status(201).json({
      message: 'Signup successful!',
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup: ' + err.message });
  }
});

// POST login (Email/Phone, Password, Captcha)
router.post('/login', async (req, res) => {
  try {
    const { loginId, password, captchaId, captchaInput } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({ error: 'Email/Phone and Password are required.' });
    }

    // Verify Captcha
    if (!verifyCaptcha(captchaId, captchaInput)) {
      return res.status(400).json({ error: 'Invalid or expired Captcha code. Please try again.' });
    }

    const cleanInput = loginId.trim();

    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({
        $or: [
          { email: cleanInput.toLowerCase() },
          { phone: cleanInput }
        ]
      });
    } else {
      user = inMemoryUsers.find(
        u => u.email.toLowerCase() === cleanInput.toLowerCase() || u.phone === cleanInput
      );
    }

    if (!user) {
      return res.status(401).json({ error: 'Account not found with provided Email or Phone.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userObj = user._doc ? { ...user._doc } : { ...user };
    delete userObj.password;

    res.json({
      message: 'Login successful!',
      token,
      user: userObj
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login: ' + err.message });
  }
});

// GET /me
router.get('/me', verifyToken, async (req, res) => {
  try {
    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findById(req.user.id).select('-password');
    } else {
      const u = inMemoryUsers.find(x => x._id.toString() === req.user.id.toString());
      if (u) {
        user = { ...u };
        delete user.password;
      }
    }

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

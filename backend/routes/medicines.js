const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Medicine = require('../models/Medicine');
const { verifyToken, adminOnly } = require('../middleware/auth');
const { inMemoryMedicines } = require('../utils/store');

// GET all medicines (Public with symptom & category search)
router.get('/', async (req, res) => {
  try {
    const { category, search, symptom } = req.query;

    let items;
    if (mongoose.connection.readyState === 1) {
      const filter = {};
      if (category && category !== 'All') filter.category = category;
      if (symptom) filter.symptoms = { $in: [new RegExp(symptom, 'i')] };
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { composition: { $regex: search, $options: 'i' } },
          { manufacturer: { $regex: search, $options: 'i' } }
        ];
      }
      items = await Medicine.find(filter).sort({ createdAt: -1 });
    } else {
      items = inMemoryMedicines.filter(m => {
        let matchCat = !category || category === 'All' || m.category === category;
        let matchSymptom = !symptom || (m.symptoms && m.symptoms.some(s => s.toLowerCase().includes(symptom.toLowerCase())));
        let matchSearch = !search || 
          m.title.toLowerCase().includes(search.toLowerCase()) || 
          m.description.toLowerCase().includes(search.toLowerCase()) ||
          (m.composition && m.composition.toLowerCase().includes(search.toLowerCase())) ||
          (m.manufacturer && m.manufacturer.toLowerCase().includes(search.toLowerCase()));
        
        return matchCat && matchSymptom && matchSearch;
      });
    }

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single medicine details
router.get('/:id', async (req, res) => {
  try {
    let item;
    if (mongoose.connection.readyState === 1) {
      item = await Medicine.findById(req.params.id);
    } else {
      item = inMemoryMedicines.find(m => m._id.toString() === req.params.id);
    }

    if (!item) return res.status(404).json({ error: 'Medicine not found.' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add medicine (Admin only)
router.post('/', verifyToken, adminOnly, async (req, res) => {
  try {
    const { 
      title, description, uses, dosage, precautions, price, stock, category, image, requiresPrescription,
      batchNumber, expiryDate, manufacturer, composition, symptoms, isGeneric, genericSubstituteName 
    } = req.body;

    if (!title || !description || price === undefined || stock === undefined || !category) {
      return res.status(400).json({ error: 'Title, description, price, stock, and category are required.' });
    }

    const defaultImg = image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60';
    const parsedSymptoms = Array.isArray(symptoms) ? symptoms : (symptoms ? symptoms.split(',').map(s => s.trim()) : []);

    let newMedicine;
    if (mongoose.connection.readyState === 1) {
      newMedicine = await Medicine.create({
        title,
        description,
        uses: uses || '',
        dosage: dosage || '',
        precautions: precautions || '',
        price: Number(price),
        stock: Number(stock),
        category,
        image: defaultImg,
        requiresPrescription: Boolean(requiresPrescription),
        batchNumber: batchNumber || `BTC-${Date.now()}`,
        expiryDate: expiryDate || '2027-12-31',
        manufacturer: manufacturer || 'Generic Pharma',
        composition: composition || '',
        symptoms: parsedSymptoms,
        isGeneric: Boolean(isGeneric),
        genericSubstituteName: genericSubstituteName || ''
      });
    } else {
      newMedicine = {
        _id: 'med-' + Date.now(),
        title,
        description,
        uses: uses || '',
        dosage: dosage || '',
        precautions: precautions || '',
        price: Number(price),
        stock: Number(stock),
        category,
        image: defaultImg,
        requiresPrescription: Boolean(requiresPrescription),
        batchNumber: batchNumber || `BTC-${Date.now()}`,
        expiryDate: expiryDate || '2027-12-31',
        manufacturer: manufacturer || 'Generic Pharma',
        composition: composition || '',
        symptoms: parsedSymptoms,
        isGeneric: Boolean(isGeneric),
        genericSubstituteName: genericSubstituteName || '',
        createdAt: new Date()
      };
      inMemoryMedicines.unshift(newMedicine);
    }

    res.status(201).json({ message: 'Medicine added successfully!', medicine: newMedicine });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update medicine / stock (Admin only)
router.put('/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    let updated;
    if (mongoose.connection.readyState === 1) {
      updated = await Medicine.findByIdAndUpdate(id, updates, { new: true });
    } else {
      const idx = inMemoryMedicines.findIndex(m => m._id.toString() === id);
      if (idx !== -1) {
        inMemoryMedicines[idx] = { ...inMemoryMedicines[idx], ...updates };
        updated = inMemoryMedicines[idx];
      }
    }

    if (!updated) return res.status(404).json({ error: 'Medicine not found.' });
    res.json({ message: 'Medicine updated successfully!', medicine: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE medicine (Admin only)
router.delete('/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      await Medicine.findByIdAndDelete(id);
    } else {
      const idx = inMemoryMedicines.findIndex(m => m._id.toString() === id);
      if (idx !== -1) inMemoryMedicines.splice(idx, 1);
    }

    res.json({ message: 'Medicine deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

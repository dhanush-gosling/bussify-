const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const bcrypt = require('bcryptjs');

// ===== CONDUCTOR MANAGEMENT =====
router.get('/conductors', auth, requireRole('admin'), async (req, res) => {
  try {
    const conductors = await User.find({ role: 'conductor' }).select('-password');
    res.json(conductors);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/conductors', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const conductor = await User.create({ name, email, password: hashed, role: 'conductor', phone });
    res.status(201).json({ ...conductor.toObject(), password: undefined });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/conductors/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const update = { name, email, phone };
    if (password) update.password = await bcrypt.hash(password, 10);
    const conductor = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    res.json(conductor);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/conductors/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Bus.updateMany({ conductorId: req.params.id }, { conductorId: null, conductorName: '' });
    res.json({ message: 'Conductor deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ===== BUS MANAGEMENT =====
router.get('/buses', auth, requireRole('admin'), async (req, res) => {
  try {
    const buses = await Bus.find().populate('routeId', 'routeName routeNumber').populate('conductorId', 'name email');
    res.json(buses);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/buses', auth, requireRole('admin'), async (req, res) => {
  try {
    const { busNumber, routeId, driverName, conductorId, capacity } = req.body;
    const conductor = conductorId ? await User.findById(conductorId) : null;
    const bus = await Bus.create({
      busNumber, routeId, driverName,
      conductorId: conductorId || null,
      conductorName: conductor ? conductor.name : '',
      capacity: capacity || 50
    });
    res.status(201).json(bus);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/buses/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { busNumber, routeId, driverName, conductorId, capacity, status } = req.body;
    const conductor = conductorId ? await User.findById(conductorId) : null;
    const bus = await Bus.findByIdAndUpdate(req.params.id, {
      busNumber, routeId, driverName,
      conductorId: conductorId || null,
      conductorName: conductor ? conductor.name : '',
      capacity, status
    }, { new: true });
    res.json(bus);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/buses/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await Bus.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bus deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ===== ROUTE MANAGEMENT =====
router.get('/routes', auth, requireRole('admin'), async (req, res) => {
  try {
    const routes = await Route.find();
    res.json(routes);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/routes', auth, requireRole('admin'), async (req, res) => {
  try {
    const { routeName, routeNumber, stops } = req.body;
    const route = await Route.create({ routeName, routeNumber, stops });
    res.status(201).json(route);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/routes/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(route);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/routes/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await Route.findByIdAndDelete(req.params.id);
    res.json({ message: 'Route deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ===== DASHBOARD STATS =====
router.get('/stats', auth, requireRole('admin'), async (req, res) => {
  try {
    const [totalBuses, activeBuses, totalRoutes, totalConductors] = await Promise.all([
      Bus.countDocuments(),
      Bus.countDocuments({ status: 'active' }),
      Route.countDocuments(),
      User.countDocuments({ role: 'conductor' })
    ]);
    const buses = await Bus.find({ status: 'active' });
    const totalPassengers = buses.reduce((sum, b) => sum + b.currentOccupancy, 0);
    res.json({ totalBuses, activeBuses, totalRoutes, totalConductors, totalPassengers });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

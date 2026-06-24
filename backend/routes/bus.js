const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Bus = require('../models/Bus');
const Route = require('../models/Route');

// Get all active buses with route info
router.get('/', auth, async (req, res) => {
  try {
    const buses = await Bus.find({ status: 'active' }).populate('routeId', 'routeName routeNumber stops');
    res.json(buses);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get all routes (public - for stop search)
router.get('/routes', auth, async (req, res) => {
  try {
    const routes = await Route.find();
    res.json(routes);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get bus by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id).populate('routeId');
    if (!bus) return res.status(404).json({ message: 'Bus not found' });
    res.json(bus);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

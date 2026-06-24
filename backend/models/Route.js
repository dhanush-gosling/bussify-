const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  distanceFromStart: { type: Number, required: true } // in km
});

const routeSchema = new mongoose.Schema({
  routeName: { type: String, required: true },
  routeNumber: { type: String, required: true, unique: true },
  stops: [stopSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Route', routeSchema);

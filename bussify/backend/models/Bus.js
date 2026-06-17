const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  driverName: { type: String, required: true },
  conductorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  conductorName: String,
  capacity: { type: Number, default: 50 },
  currentOccupancy: { type: Number, default: 0 },
  currentStop: { type: String, default: '' },
  currentStopIndex: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'active' },
  passengers: [{
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'PassengerCard' },
    passengerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    passengerName: String,
    boardingStop: String,
    boardingStopIndex: Number,
    destinationStop: String,
    destinationStopIndex: Number,
    ticketId: String,
    notified: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bus', busSchema);

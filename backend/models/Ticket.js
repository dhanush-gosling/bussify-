// const mongoose = require('mongoose');

// const ticketSchema = new mongoose.Schema({
//   ticketId: { type: String, unique: true },
//   passengerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'PassengerCard' },
//   busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
//   busNumber: String,
//   routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
//   source: String,
//   sourceIndex: Number,
//   destination: String,
//   destinationIndex: Number,
//   fare: Number,
//   distance: Number,
//   qrCode: String, // base64 QR image
//   status: { type: String, enum: ['valid', 'used', 'expired', 'fined'], default: 'valid' },
//   boardedAt: Date,
//   alightedAt: Date,
//   fine: { type: Number, default: 0 },
//   createdAt: { type: Date, default: Date.now }
// });

// ticketSchema.pre('save', function(next) {
//   if (!this.ticketId) {
//     this.ticketId = 'TKT' + Date.now() + Math.floor(Math.random() * 1000);
//   }
//   next();
// });

// module.exports = mongoose.model('Ticket', ticketSchema);


const mongoose = require('mongoose');

const journeyLegSchema = new mongoose.Schema(
{
  busId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: true
  },

  busNumber: {
    type: String,
    required: true
  },

  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route'
  },

  source: {
    type: String,
    required: true
  },

  destination: {
    type: String,
    required: true
  },

  sourceIndex: Number,

  destinationIndex: Number,

  fare: {
    type: Number,
    default: 0
  },

  distance: {
    type: Number,
    default: 0
  }
},
{ _id: false });

const ticketSchema = new mongoose.Schema({

  ticketId: {
    type: String,
    unique: true
  },

  passengerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PassengerCard'
  },

  // NEW
  journey: [journeyLegSchema],

  // Overall journey
  source: String,

  destination: String,

  fare: Number,

  distance: Number,

  qrCode: String,

  status: {
    type: String,
    enum: ['valid', 'used', 'expired', 'fined'],
    default: 'valid'
  },

  boardedAt: Date,

  alightedAt: Date,

  fine: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

ticketSchema.pre('save', function(next) {

  if (!this.ticketId) {
    this.ticketId =
      "TKT" +
      Date.now() +
      Math.floor(Math.random() * 1000);
  }

  next();
});

module.exports = mongoose.model("Ticket", ticketSchema);
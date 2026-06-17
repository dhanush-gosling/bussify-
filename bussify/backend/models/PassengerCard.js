const mongoose = require('mongoose');

const journeySchema = new mongoose.Schema({
  ticketId: String,
  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
  busNumber: String,
  source: String,
  destination: String,
  fare: Number,
  boardingStop: String,
  alightingStop: String,
  status: { type: String, enum: ['booked', 'active', 'completed', 'fined'], default: 'booked' },
  fine: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
});

const cardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  cardNumber: { type: String, unique: true },
  name: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  dob: { type: Date, required: true },
  aadhaar: { type: String, required: true },
  walletBalance: { type: Number, default: 0 },
  journeyHistory: [journeySchema],
  createdAt: { type: Date, default: Date.now }
});

// Auto-generate card number
cardSchema.pre('save', async function(next) {
  if (!this.cardNumber) {
    this.cardNumber = 'BSF' + Date.now().toString().slice(-8);
  }
  next();
});

module.exports = mongoose.model('PassengerCard', cardSchema);

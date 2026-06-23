const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const Ticket = require('../models/Ticket');
const PassengerCard = require('../models/PassengerCard');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const QRCode = require('qrcode');
const JourneyHistory = require("../models/JourneyHistory");
const { findJourney } = require("../services/routeSearch");

const FARE_PER_KM = 10;
const MIN_WALLET_BALANCE = 100;

// Book ticket
router.post('/book', auth, requireRole('passenger'), async (req, res) => {
  try {
    const { busId, source, sourceIndex, destination, destinationIndex, fare, distance, routeId } = req.body;

    const card = await PassengerCard.findOne({ userId: req.user.id });
    if (!card) return res.status(404).json({ message: 'Card not found. Create a card first.' });

    if (card.walletBalance < fare) {
      return res.status(400).json({ message: `Insufficient balance. Need ₹${fare}, have ₹${card.walletBalance}` });
    }

    if (card.walletBalance < MIN_WALLET_BALANCE) {
      return res.status(400).json({ message: `Wallet balance must be at least ₹${MIN_WALLET_BALANCE} to book` });
    }

    const bus = await Bus.findById(busId);
    if (!bus) return res.status(404).json({ message: 'Bus not found' });
    if (bus.currentOccupancy >= bus.capacity) return res.status(400).json({ message: 'Bus is full' });

    // Deduct fare
    card.walletBalance -= fare;

    // Create ticket
    const ticket = new Ticket({
      passengerId: req.user.id,
      cardId: card._id,
      busId,
      busNumber: bus.busNumber,
      routeId,
      source,
      sourceIndex,
      destination,
      destinationIndex,
      fare,
      distance
    });

    // Generate QR code
    const qrData = JSON.stringify({
      ticketId: ticket.ticketId || 'TKT' + Date.now(),
      passengerId: req.user.id,
      cardNumber: card.cardNumber,
      busId,
      source,
      destination,
      fare
    });
    ticket.qrCode = await QRCode.toDataURL(qrData);
    if (!ticket.ticketId) ticket.ticketId = 'TKT' + Date.now();

    // Add journey to card history
    card.journeyHistory.push({
      ticketId: ticket.ticketId,
      busId,
      busNumber: bus.busNumber,
      source,
      destination,
      fare,
      status: 'booked'
    });

    await card.save();
    await ticket.save();

    res.status(201).json({ ticket, walletBalance: card.walletBalance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my tickets
router.get('/my', auth, requireRole('passenger'), async (req, res) => {
  try {
    const tickets = await Ticket.find({ passengerId: req.user.id }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single ticket
router.get('/:ticketId', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ ticketId: req.params.ticketId });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

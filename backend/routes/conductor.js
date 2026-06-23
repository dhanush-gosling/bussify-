const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const Bus = require('../models/Bus');
const Ticket = require('../models/Ticket');
const PassengerCard = require('../models/PassengerCard');
const Route = require('../models/Route');

const MIN_WALLET_BALANCE = 100;
const FARE_PER_KM = 10;

// Get conductor's assigned bus
router.get('/my-bus', auth, requireRole('conductor'), async (req, res) => {
  try {
    const bus = await Bus.findOne({ conductorId: req.user.id }).populate('routeId');
    if (!bus) return res.status(404).json({ message: 'No bus assigned to you' });
    res.json(bus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update current stop (conductor moves bus to next stop)
router.put('/update-stop', auth, requireRole('conductor'), async (req, res) => {
  try {
    const { stopName, stopIndex } = req.body;
    const bus = await Bus.findOne({ conductorId: req.user.id }).populate('routeId');
    if (!bus) return res.status(404).json({ message: 'No bus assigned' });

    const prevStopIndex = bus.currentStopIndex;
    bus.currentStop = stopName;
    bus.currentStopIndex = stopIndex;

    // Check for passengers who missed their stop (destination stop < current stop)
    const fineMessages = [];
    for (const passenger of bus.passengers) {
      if (passenger.destinationStopIndex < stopIndex) {
        // Apply fine - charge extra distance
        const route = bus.routeId;
        if (route) {
          const destStop = route.stops[passenger.destinationStopIndex];
          const currentStop = route.stops[stopIndex];
          if (destStop && currentStop) {
            const extraDistance = currentStop.distanceFromStart - destStop.distanceFromStart;
            const fine = Math.ceil(extraDistance * FARE_PER_KM);

            // Deduct fine from wallet
            const card = await PassengerCard.findById(passenger.cardId);
            if (card && card.walletBalance >= fine) {
              card.walletBalance -= fine;
              const journey = card.journeyHistory.find(j => j.ticketId === passenger.ticketId);
              if (journey) {
                journey.fine = (journey.fine || 0) + fine;
                journey.status = 'fined';
              }
              await card.save();
            }

            // Update ticket
            await Ticket.findOneAndUpdate(
              { ticketId: passenger.ticketId },
              { $inc: { fine }, status: 'fined' }
            );

            fineMessages.push({ passengerName: passenger.passengerName, fine });
          }
        }
      }
    }

    // Remove passengers who have alighted (destination reached)
    const alightedPassengers = bus.passengers.filter(p => p.destinationStopIndex <= stopIndex);
    bus.passengers = bus.passengers.filter(p => p.destinationStopIndex > stopIndex);
    bus.currentOccupancy = bus.passengers.length;

    // Update ticket & journey status for alighted passengers
    for (const p of alightedPassengers) {
      await Ticket.findOneAndUpdate({ ticketId: p.ticketId }, { status: 'used', alightedAt: new Date() });
      await PassengerCard.findOneAndUpdate(
        { _id: p.cardId, 'journeyHistory.ticketId': p.ticketId },
        { $set: { 'journeyHistory.$.status': 'completed', 'journeyHistory.$.alightingStop': p.destinationStop } }
      );
    }

    await bus.save();
    res.json({ message: `Stop updated to ${stopName}`, currentOccupancy: bus.currentOccupancy, fines: fineMessages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Scan QR / board passenger
router.post('/scan', auth, requireRole('conductor'), async (req, res) => {
  try {
    const { ticketId } = req.body;
    const bus = await Bus.findOne({ conductorId: req.user.id }).populate('routeId');
    if (!bus) return res.status(404).json({ message: 'No bus assigned' });

    const ticket = await Ticket.findOne({ ticketId });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (ticket.status === 'used') return res.status(400).json({ message: 'Ticket already used' });
    if (ticket.status === 'expired') return res.status(400).json({ message: 'Ticket expired' });
    if (ticket.busId.toString() !== bus._id.toString()) return res.status(400).json({ message: 'Ticket not valid for this bus' });

    // Check wallet balance
    const card = await PassengerCard.findById(ticket.cardId);
    if (!card) return res.status(404).json({ message: 'Passenger card not found' });
    if (card.walletBalance < MIN_WALLET_BALANCE) {
      return res.status(400).json({ message: `Passenger wallet balance (₹${card.walletBalance}) is below ₹${MIN_WALLET_BALANCE} minimum` });
    }

    // Check bus capacity
    if (bus.currentOccupancy >= bus.capacity) {
      return res.status(400).json({ message: 'Bus is full, cannot board' });
    }

    // Board passenger
    bus.passengers.push({
      cardId: card._id,
      passengerId: ticket.passengerId,
      passengerName: card.name,
      boardingStop: bus.currentStop || ticket.source,
      boardingStopIndex: bus.currentStopIndex,
      destinationStop: ticket.destination,
      destinationStopIndex: ticket.destinationIndex,
      ticketId: ticket.ticketId
    });
    bus.currentOccupancy = bus.passengers.length;

    ticket.status = 'used';
    ticket.boardedAt = new Date();

    await bus.save();
    await ticket.save();

    // Update journey in card
    await PassengerCard.findOneAndUpdate(
      { _id: card._id, 'journeyHistory.ticketId': ticketId },
      { $set: { 'journeyHistory.$.status': 'active', 'journeyHistory.$.boardingStop': bus.currentStop } }
    );

    res.json({
      message: 'Passenger boarded successfully',
      passengerName: card.name,
      destination: ticket.destination,
      currentOccupancy: bus.currentOccupancy
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current passengers
router.get('/passengers', auth, requireRole('conductor'), async (req, res) => {
  try {
    const bus = await Bus.findOne({ conductorId: req.user.id });
    if (!bus) return res.status(404).json({ message: 'No bus assigned' });
    res.json(bus.passengers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;


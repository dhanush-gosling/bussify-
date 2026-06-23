const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const PassengerCard = require('../models/PassengerCard');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Stop = require("../models/Stop");
const { findJourney } = require("../services/routeSearch");

// Get or check card
router.get('/card', auth, requireRole('passenger'), async (req, res) => {
  try {
    const card = await PassengerCard.findOne({ userId: req.user.id });
    if (!card) return res.status(404).json({ message: 'No card found', hasCard: false });
    res.json({ ...card.toObject(), hasCard: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create card
router.post('/card', auth, requireRole('passenger'), async (req, res) => {
  try {
    const existing = await PassengerCard.findOne({ userId: req.user.id });
    if (existing) return res.status(400).json({ message: 'Card already exists' });

    const { name, gender, dob, aadhaar } = req.body;
    const card = await PassengerCard.create({ userId: req.user.id, name, gender, dob, aadhaar });
    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add wallet balance
router.post('/card/recharge', auth, requireRole('passenger'), async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const card = await PassengerCard.findOneAndUpdate(
      { userId: req.user.id },
      { $inc: { walletBalance: amount } },
      { new: true }
    );
    if (!card) return res.status(404).json({ message: 'Card not found' });
    res.json({ walletBalance: card.walletBalance, message: `₹${amount} added successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search buses between stops
// router.get('/search-buses', auth, requireRole('passenger'), async (req, res) => {
//   try {
//     const { source, destination } = req.query;
//     if (!source || !destination) return res.status(400).json({ message: 'Source and destination required' });

//     const routes = await Route.find({});
//     const matchingRoutes = [];

//     for (const route of routes) {
//       const stopNames = route.stops.map(s => s.name.toLowerCase());
//       const srcIdx = stopNames.indexOf(source.toLowerCase());
//       const dstIdx = stopNames.indexOf(destination.toLowerCase());

//       if (srcIdx !== -1 && dstIdx !== -1 && srcIdx < dstIdx) {
//         const srcStop = route.stops[srcIdx];
//         const dstStop = route.stops[dstIdx];
//         const distance = dstStop.distanceFromStart - srcStop.distanceFromStart;
//         const fare = Math.ceil(distance * 10); // ₹10 per km

//         // Find active buses on this route
//         const buses = await Bus.find({ routeId: route._id, status: 'active' });
//         for (const bus of buses) {
//           matchingRoutes.push({
//             busId: bus._id,
//             busNumber: bus.busNumber,
//             routeName: route.routeName,
//             routeNumber: route.routeNumber,
//             source: route.stops[srcIdx].name,
//             sourceIndex: srcIdx,
//             destination: route.stops[dstIdx].name,
//             destinationIndex: dstIdx,
//             distance: distance.toFixed(1),
//             fare,
//             currentStop: bus.currentStop,
//             occupancy: bus.currentOccupancy,
//             capacity: bus.capacity,
//             availableSeats: bus.capacity - bus.currentOccupancy,
//             routeId: route._id
//           });
//         }
//       }
//     }

//     res.json(matchingRoutes);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

router.get("/search-buses", auth, requireRole("passenger"), async (req, res) => {

    try {

        const { source, destination } = req.query;

        if (!source || !destination) {

            return res.status(400).json({
                message: "Source and destination required"
            });

        }

        const journey = await findJourney(source, destination);

        if (journey.length === 0) {

            return res.status(404).json({
                message: "No route found"
            });

        }

        // Merge consecutive segments that use the same bus
        const mergedJourney = [];

        for (const leg of journey) {

            if (
                mergedJourney.length > 0 &&
                mergedJourney[mergedJourney.length - 1].busNumber === leg.busNumber
            ) {

                mergedJourney[mergedJourney.length - 1].destination =
                    leg.destination;

                mergedJourney[mergedJourney.length - 1].fare += leg.fare;

                mergedJourney[mergedJourney.length - 1].distance +=
                    leg.distance;

            }
            else {

                mergedJourney.push({
                    ...leg
                });

            }

        }

        const totalFare =
            mergedJourney.reduce(
                (sum, leg) => sum + leg.fare,
                0
            );

        const totalDistance =
            mergedJourney.reduce(
                (sum, leg) => sum + leg.distance,
                0
            );

        res.json({

            source,

            destination,

            totalFare,

            totalDistance,

            journey: mergedJourney

        });

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

});

// Get journey history
router.get('/journeys', auth, requireRole('passenger'), async (req, res) => {
  try {
    const card = await PassengerCard.findOne({ userId: req.user.id });
    if (!card) return res.status(404).json({ message: 'Card not found' });
    res.json(card.journeyHistory.sort((a, b) => new Date(b.date) - new Date(a.date)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all stops (for autocomplete)
// router.get('/stops', auth, async (req, res) => {
//   try {
//     const routes = await Route.find({});
//     const allStops = new Set();
//     routes.forEach(r => r.stops.forEach(s => allStops.add(s.name)));
//     res.json([...allStops]);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

router.get("/stops", auth, async (req, res) => {

    try {

        const stops = await Stop.find().sort({

            stopName: 1

        });

        res.json(stops);

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

});

// Get notifications — returns actionable destination-reached alerts
router.get('/notifications', auth, requireRole('passenger'), async (req, res) => {
  try {
    const card = await PassengerCard.findOne({ userId: req.user.id });
    if (!card) return res.json([]);

    const buses = await Bus.find({ 'passengers.cardId': card._id }).populate('routeId');
    const notifications = [];

    for (const bus of buses) {
      const passengerEntry = bus.passengers.find(p => p.cardId?.toString() === card._id.toString());
      if (!passengerEntry) continue;

      const destIdx = passengerEntry.destinationStopIndex;
      const currentIdx = bus.currentStopIndex;

      if (currentIdx === destIdx - 1) {
        // Approaching destination — info only
        notifications.push({
          type: 'warning',
          actionable: false,
          message: `Next stop is your destination: ${passengerEntry.destinationStop}`,
          busNumber: bus.busNumber,
          busId: bus._id,
          ticketId: passengerEntry.ticketId,
          destinationStop: passengerEntry.destinationStop
        });
      } else if (currentIdx === destIdx && !passengerEntry.notified) {
        // Destination reached — show OK / Next popup
        notifications.push({
          type: 'success',
          actionable: true,
          message: `You have reached your destination: ${passengerEntry.destinationStop}`,
          busNumber: bus.busNumber,
          busId: bus._id,
          ticketId: passengerEntry.ticketId,
          destinationStop: passengerEntry.destinationStop
        });
      } else if (currentIdx > destIdx) {
        // Missed stop — show fine warning
        notifications.push({
          type: 'error',
          actionable: false,
          message: `You missed your stop: ${passengerEntry.destinationStop}. A fine has been applied.`,
          busNumber: bus.busNumber,
          busId: bus._id,
          ticketId: passengerEntry.ticketId
        });
      }
    }

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /passenger/deboard — passenger clicked OK (alighting at destination)
router.post('/deboard', auth, requireRole('passenger'), async (req, res) => {
  try {
    const { busId, ticketId } = req.body;
    const card = await PassengerCard.findOne({ userId: req.user.id });
    if (!card) return res.status(404).json({ message: 'Card not found' });

    const bus = await Bus.findById(busId);
    if (!bus) return res.status(404).json({ message: 'Bus not found' });

    // Remove passenger from bus
    bus.passengers = bus.passengers.filter(p => p.ticketId !== ticketId);
    bus.currentOccupancy = bus.passengers.length;
    await bus.save();

    // Update ticket status
    const Ticket = require('../models/Ticket');
    await Ticket.findOneAndUpdate({ ticketId }, { status: 'used', alightedAt: new Date() });

    // Update journey history
    await PassengerCard.findOneAndUpdate(
      { _id: card._id, 'journeyHistory.ticketId': ticketId },
      { $set: { 'journeyHistory.$.status': 'completed' } }
    );

    res.json({ message: 'Deboarded successfully. Have a safe journey!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /passenger/stay-on-bus — passenger clicked Next (staying on bus → mark notified + apply fine)
router.post('/stay-on-bus', auth, requireRole('passenger'), async (req, res) => {
  try {
    const { busId, ticketId } = req.body;
    const card = await PassengerCard.findOne({ userId: req.user.id });
    if (!card) return res.status(404).json({ message: 'Card not found' });

    const bus = await Bus.findById(busId).populate('routeId');
    if (!bus) return res.status(404).json({ message: 'Bus not found' });

    const passengerEntry = bus.passengers.find(p => p.ticketId === ticketId);
    if (!passengerEntry) return res.status(404).json({ message: 'Passenger not on this bus' });

    // Calculate fine for extra stop (1 stop beyond destination)
    const route = bus.routeId;
    let fine = 0;
    if (route && route.stops.length > passengerEntry.destinationStopIndex + 1) {
      const destStop = route.stops[passengerEntry.destinationStopIndex];
      const nextStop = route.stops[passengerEntry.destinationStopIndex + 1];
      const extraDist = nextStop.distanceFromStart - destStop.distanceFromStart;
      fine = Math.ceil(extraDist * 10); // ₹10/km
    } else {
      fine = 50; // flat fine if no next stop info
    }

    // Deduct fine from wallet
    if (card.walletBalance >= fine) {
      card.walletBalance -= fine;
    } else {
      fine = card.walletBalance; // deduct whatever is left
      card.walletBalance = 0;
    }

    // Update journey history with fine
    const journey = card.journeyHistory.find(j => j.ticketId === ticketId);
    if (journey) {
      journey.fine = (journey.fine || 0) + fine;
      journey.status = 'fined';
    }
    await card.save();

    // Mark passenger as notified so popup won't re-appear for this stop
    passengerEntry.notified = true;
    // Extend destination by 1 stop so future stop triggers new check
    if (route && passengerEntry.destinationStopIndex + 1 < route.stops.length) {
      passengerEntry.destinationStopIndex += 1;
      passengerEntry.destinationStop = route.stops[passengerEntry.destinationStopIndex].name;
      passengerEntry.notified = false; // reset so next stop triggers popup again
    }
    await bus.save();

    // Update ticket fine
    const Ticket = require('../models/Ticket');
    await Ticket.findOneAndUpdate({ ticketId }, { $inc: { fine }, status: 'fined' });

    res.json({ message: `Staying on bus. Fine of ₹${fine} applied.`, fine, newBalance: card.walletBalance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

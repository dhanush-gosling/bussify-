const mongoose = require("mongoose");

const journeyLegSchema = new mongoose.Schema(
{
    busId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bus"
    },

    busNumber: String,

    source: String,

    destination: String
},
{ _id: false });

const journeyHistorySchema = new mongoose.Schema(
{
    passengerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    source: {
        type: String,
        required: true
    },

    destination: {
        type: String,
        required: true
    },

    journey: [journeyLegSchema],

    totalFare: {
        type: Number,
        default: 0
    },

    travelledAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("JourneyHistory", journeyHistorySchema);
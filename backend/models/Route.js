// const mongoose = require('mongoose');

// const stopSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   distanceFromStart: { type: Number, required: true } // in km
// });

// const routeSchema = new mongoose.Schema({
//   routeName: { type: String, required: true },
//   routeNumber: { type: String, required: true, unique: true },
//   stops: [stopSchema],
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Route', routeSchema);


const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema(
{
    bus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bus",
        required: true
    },

    fromStop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stop",
        required: true
    },

    toStop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stop",
        required: true
    },

    distance: {
        type: Number,
        default: 1
    },

    fare: {
        type: Number,
        default: 10
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Route", routeSchema);
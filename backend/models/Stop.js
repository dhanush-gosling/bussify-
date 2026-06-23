const mongoose = require("mongoose");

const stopSchema = new mongoose.Schema(
{
    stopCode: {
        type: String,
        required: true,
        unique: true
    },

    stopName: {
        type: String,
        required: true
    },

    latitude: {
        type: Number,
        default: null
    },

    longitude: {
        type: Number,
        default: null
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Stop", stopSchema);
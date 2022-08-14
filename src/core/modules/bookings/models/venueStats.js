const mongoose = require("mongoose");
let Schema = mongoose.Schema;

let venueStatsSchema = new Schema(
    {
        venue: {
            type: mongoose.Types.ObjectId,
            ref: "venue",
            required: true,
            index: true,
        },
        bookingDate: {
            type: String,
            required: true
        },
         weekDayCode: {
                type: String,
                required: true
        },
        slots: [{
            startTime: {
                type: String,
                required: true,
            },
            user: {
                type: mongoose.Types.ObjectId,
                ref: 'user',
                required: true,
                index: true,
            },
            booking: {
                type: mongoose.Types.ObjectId,
                ref: 'booking',
                required: true,
                index: true,
            },
            endTime: {
                type: String,
                required: true
            },
        }]
    }
);

let VenueStats = mongoose.model("venueStats", venueStatsSchema);

module.exports = VenueStats;
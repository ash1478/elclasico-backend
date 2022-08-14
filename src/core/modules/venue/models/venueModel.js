const mongoose = require("mongoose");
let Schema = mongoose.Schema;

let venueSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        profileImageUrl: {
            type: String,
            required: true,
        },
        imageUrls: [{
            type: String,
            required: false,
        }],
        address: {
            type: String,
            required: true
        },
        mapLink: {
            type: String,
            required: false,
        },
        sessions: [{
            startTime: {
                type: String,
                required: true,
            },
            endTime: {
                type: String,
                required: true,
            },
            weekDayCode: {
                type: String,
                required: true
            },
            duration: {
                type: Number,
                required: true
            }
        }]
    }
);

let Venue = mongoose.model("venue", venueSchema);

module.exports = Venue;
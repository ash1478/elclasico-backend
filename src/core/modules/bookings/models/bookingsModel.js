const mongoose = require("mongoose");
let Schema = mongoose.Schema;

let bookingSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        venueName: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: String,
            required: true,
            index: true,
        },
        amount: {
            type: String,
            required: true,
        },
        voucherName: {
            type: String,
            required: false,
        },
        discountAmount: {
            type: String,
            required: false,
        },
        venue: {
            type: mongoose.Types.ObjectId,
            ref: "venue",
            required: true,
            index: true,
        },
        bookingDate: {
            type: Date,
            required: true
        },
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'user',
            required: true,
            index: true,
        },
        status: {
            type: String,
            required: true,
            default: 'BOOKED'
        },
        slots: [{
            startTime: {
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
    },
    {
        timestamps: true
    }
);

let Booking = mongoose.model("booking", bookingSchema);

module.exports = Booking;
const express = require('express');
const bookingsService = require("../bookings/bookingsService");
const bookingsController = express.Router();


bookingsController.post("/", bookingsService.createBooking);

bookingsController.get("/userBookings", bookingsService.getUserBookings);

bookingsController.get("/:bookingId", bookingsService.getBookingById);

module.exports = bookingsController;
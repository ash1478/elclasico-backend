const express = require('express');
const venueService = require("../venue/venueService");
const venueController = express.Router();

venueController.get("/", venueService.getAllVenues);

venueController.get("/:venueId", venueService.getSingleVenue);

venueController.post("/", venueService.createVenue);

venueController.post("/getBookings", venueService.getVenueBookingsByDate)

module.exports = venueController;
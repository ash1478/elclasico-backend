const express = require('express');
const venueService = require("../venue/venueService");
const venueController = express.Router();

venueController.get("/", venueService.getAllVenues);

venueController.get("/:venueId", venueService.getSingleVenue);

venueController.post("/", venueService.createVenue);

module.exports = venueController;
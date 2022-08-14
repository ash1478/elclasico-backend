const express = require('express');
const slotsService = require("../slots/slotsService");
const slotsController = express.Router();

slotsController.get("/", slotsService.getSlots);

slotsController.get("/clearSlots", slotsService.clearSlots);


module.exports = slotsController;
const express = require('express');
const authController = require('../modules/auth/authController');
const bookingsController = require('../modules/bookings/bookingsController');
const slotsController = require('../modules/slots/slotsController');
const venueController = require('../modules/venue/venueController');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

const baseRouter = express.Router();

baseRouter.get("/", (req, res) => { 
    res.send("Hello Bye");
})
baseRouter.use("/auth", authController);

baseRouter.use("/venues", venueController);

baseRouter.use("/bookings", bookingsController);

baseRouter.use("/slots", slotsController);

module.exports = baseRouter;
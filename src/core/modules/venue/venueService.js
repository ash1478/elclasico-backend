const Venue = require("./models/venueModel");
const successResponseMapper = require("../../common/utils/successResponseMapper");
const failureResponseMapper = require("../../common/utils/failureResponseMapper");
const VenueStats = require("../bookings/models/venueStats");
const moment = require("moment");


module.exports.getAllVenues = async function (req, res) {
  const venues = await Venue.find(
    {},
    {
      name: 1,
      imageUrls: 1,
      avgCost: 1,
      startTime: 1,
      endTime: 1,
    }
  );
  console.log(`No. of venues fetched: ${venues.length}`);
  if (venues && venues.length) {
    return res.status(200).send(successResponseMapper(venues));
  }
  return res.status(404).send(failureResponseMapper("No venues available"));
};

module.exports.getSingleVenue = async function (req, res) {
  try {
    const venue = await Venue.findById(req.params.venueId);
    if (venue) {
      return res.status(200).send(successResponseMapper(venue));
    }
  } catch (err) {
    return res
      .status(404)
      .send(failureResponseMapper("No venues available with this Id"));
  }
};

module.exports.createVenue = async function (req, res) {
  try {
    const data = req.body;
    const venue = await Venue.create(data);
    return res.status(200).send(successResponseMapper(venue));
  } catch (err) {
    console.log(err);
    res.status(400).send(failureResponseMapper(err.message));
  }
};

module.exports.getVenueBookingsByDate = async function (req, res) {
  try {
    const { venueId, date } = req.body;
    const stats = await VenueStats.findOne(
      {
        venue: venueId,
        bookingDate: moment(new Date(date)).format("LL"),
        status: 'BOOKED'
      },
      { __v: 0 }
    )
      .populate("slots.user", { __v: 0 })
      .populate("slots.booking", { __v: 0 })
      .lean();

    return res.status(200).send(successResponseMapper(stats));
  } catch (err) {
    res.status(400).send(failureResponseMapper(err.message));
  }
};

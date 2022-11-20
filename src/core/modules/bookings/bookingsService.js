const failureResponseMapper =  require('../../common/utils/failureResponseMapper');
const successResponseMapper = require('../../common/utils/successResponseMapper');
const Booking = require('./models/bookingsModel');
const VenueStats = require('./models/venueStats');
const mongoose = require('mongoose');
const moment = require('moment');
const redis = require('../../../repository/cache/redisClient')

module.exports.createBooking = async function (req, res) {

    try {
        let slotKeyToCheck = [];
        req.body.slots.forEach(element => {
            slotKeyToCheck.push(`${req.body.venue}.${element.weekDayCode}.${element.startTime}`)
        });
        slotKeyToCheck.forEach(async element => {
            if (await redis.get(element)) {
                return res.status(404).send(failureResponseMapper("The slot is already being booked by someone else"))
            }
        })
        slotKeyToCheck.forEach(async e => await redis.set(e, 'booking',{EX: 300}))
        req.body.venue = mongoose.Types.ObjectId(req.body.venue);
        req.body.user = mongoose.Types.ObjectId(req.user?._id || req.body.user )

        const booking = await Booking.create(req.body);
        let venueStats = await VenueStats.findOne({
            bookingDate: moment(new Date(req.body.bookingDate)).format('LL'),
            venue: req.body.venue,
        });
        
        if (venueStats && venueStats != {}) {
            req.body.slots.forEach(e => {
                venueStats.slots.push({
                    startTime: e.startTime,
                    endTime: moment(moment(e.startTime, "HH:mm").add(60, 'minutes')).format( "HH:mm"),
                    user: req.body.user,
                    booking: booking._id,
                });
            })
            venueStats.weekDayCode = req.body.slots[0].weekDayCode;
            await VenueStats.findByIdAndUpdate(venueStats._id, venueStats);
        }
        else { 
            venueStats = {
                slots: []
            };
            venueStats.venue = req.body.venue;
            venueStats.bookingDate = moment(new Date(req.body.bookingDate)).format('LL');
            req.body.slots.forEach(e => {
                venueStats.slots.push({
                    startTime: e.startTime,
                    endTime: moment(moment(e.startTime, "HH:mm").add(60, 'minutes')).format( "HH:mm"),
                    user: req.body.user,
                    booking: booking._id,
                });
            })
            venueStats.weekDayCode = req.body.slots[0].weekDayCode;
            await VenueStats.create(venueStats);
        }
        const clearVenueSlotsKey = `${req.body.venue}.Slots`;
        await redis.del(clearVenueSlotsKey);
        slotKeyToCheck.forEach(e => redis.del(e))
        return res.status(200).send(successResponseMapper(booking))
        
    }
    catch (err) { 
        return res.status(404).send(failureResponseMapper(err.message))
    }

}

module.exports.getBookingById = async function (req, res) { 
    try {
        const booking = await Booking.findById(req.params.bookingId,{__v:0}).populate('venue', {
            sessions: 0,
            __v: 0,
            profileImageUrl: 0,
        }).populate('user', {
            __v: 0
        });
        return res.status(200).send(successResponseMapper(booking));
    }
    catch (err) { 
        console.log(err);
        return res.status(404).send(failureResponseMapper("No booking found with this id"));
    }
}

module.exports.getUserBookings = async function (req, res) { 
    try {
        const bookings = await Booking.find({
            user: req.user?._id || req.query.id,
            status: 'BOOKED'
        },{__v: 0}).populate('venue', {
            sessions: 0,
            __v: 0,
            profileImageUrl: 0,
            address: 0,
            mapLink: 0
        }).populate('user', {
            __v: 0
        });
        return res.status(200).send(successResponseMapper(bookings));
    }
    catch (err) { 
        console.log(err);
        return res.status(404).send(failureResponseMapper("No booking found with this id"));
    }
}


module.exports.cancelBooking = async function (req, res) { 
    console.log({body: req.body})
    try {
        const booking = await Booking.findByIdAndUpdate(req.body.bookingId, { status: 'CANCELLED' });

        const venueStat = await VenueStats.findOne({
            bookingDate: moment(new Date(booking.bookingDate)).format('LL'),
            venue:  mongoose.Types.ObjectId(booking.venue),
        });

        console.log({venueStat,  bookingDate: moment(new Date(booking.bookingDate)).format('LL'),
            venue:  mongoose.Types.ObjectId(booking.venue),})
        venueStat.slots.filter(slot => slot.booking !== booking._id);
        venueStat.save();
        const clearVenueSlotsKey = `${venueStat.venue}.Slots`;
        await redis.del(clearVenueSlotsKey);

        return res.status(200).send(successResponseMapper("Booking has been cancelled successfully"));
    }
    catch (err) { 
        console.log(err);
        return res.status(404).send(failureResponseMapper(err.message));
    }
}
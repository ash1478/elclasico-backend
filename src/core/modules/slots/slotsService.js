const { default: mongoose } = require("mongoose");
const failureResponseMapper = require("../../common/utils/failureResponseMapper");
const Venue = require("../venue/models/venueModel");
const redis = require('../../../repository/cache/redisClient');
const successResponseMapper = require("../../common/utils/successResponseMapper");
const { getSlotTimings } = require("./getSlotTimings");
const VenueStats = require("../bookings/models/venueStats");
const moment = require('moment');


module.exports.getSlots = async (req, res) => { 
    let { venueId, weekDayCode } = req.query;
    if (!venueId) return res.status(404).send(failureResponseMapper("Venue Id not provided"));
    weekDayCode = weekDayCode || '*';
    try {
        const venue = await Venue.findById(mongoose.Types.ObjectId(venueId));
        if (!venue || venue === {}) return res.status(404).send(failureResponseMapper("Venue with given Id not found"));
        const venueSlotsKey = `${venueId}.Slots`;
        if (await redis.exists(venueSlotsKey)) {
            if (weekDayCode === '*') return res.status(200).send(successResponseMapper(JSON.parse(await redis.get(venueSlotsKey))));
            return res.status(200).send(successResponseMapper(JSON.parse((await redis.get(venueSlotsKey)))[Number(weekDayCode - 1)]));
        }
        let totalAvailableSlots = [];
        let bookedData = [];
        const sessions = venue.sessions;
        for (let i = 1; i < 8; i++) { 
            const sessionsPerDay = sessions.filter(session => {
                if (session.weekDayCode === i.toString()) return session;
            });
            
            let slotsPerDay = [];
            sessionsPerDay.forEach(session => { 
                slotsPerDay.push(...getSlotTimings(session.startTime, session.endTime));
            });
            totalAvailableSlots.push({
                weekDayCode: i,
                slots: slotsPerDay
            })

            const bookedDataPerDay = await VenueStats.findOne({
                venue: mongoose.Types.ObjectId(venueId),
                weekDayCode: i.toString(),
                bookingDate: moment(new Date()).add((i - 1), 'days').format('LL')
            });

            console.log({ bookedDataPerDay });
            let bookedSlotsPerDay = [];

            if (bookedDataPerDay) { 
                 bookedDataPerDay.slots.forEach(slot => {
                bookedSlotsPerDay.push(...getSlotTimings(slot.startTime,slot.endTime))
            })
            }
             bookedData.push({
                weekDayCode: i,
                slots: bookedSlotsPerDay
            })
        }

        console.log({ bookedData });

        for (let i = 0; i < totalAvailableSlots.length; i++) { 
            totalAvailableSlots[i].slots = totalAvailableSlots[i].slots.filter(slot => {
                if (bookedData[i].slots.length) {
                    if (!bookedData[i].slots.includes(slot)) {
                        return slot;
                    }   
                }
                else return slot;
            })
        }
        
        await redis.set(venueSlotsKey,JSON.stringify(totalAvailableSlots))
            if (weekDayCode === '*') return res.status(200).send(successResponseMapper(totalAvailableSlots));
            return res.status(200).send(successResponseMapper(totalAvailableSlots[Number(weekDayCode - 1)]));     }
    catch (err) { 
        console.log(err);
        return res.status(404).send(failureResponseMapper(err.message))
    }
}


module.exports.clearSlots = async (req, res) => { 
    let { venueId } = req.query;
    const venueSlotsKey = `${venueId}.Slots`;
    await redis.del(venueSlotsKey);
    res.status(200).send(successResponseMapper("Slots cleared for the venue!"));
};
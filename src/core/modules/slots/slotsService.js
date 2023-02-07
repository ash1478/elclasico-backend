const { default: mongoose } = require("mongoose");
const failureResponseMapper = require("../../common/utils/failureResponseMapper");
const Venue = require("../venue/models/venueModel");
const cacheClient = require('../../../repository/cache/cacheClient');
const successResponseMapper = require("../../common/utils/successResponseMapper");
const { getSlotTimings, getSlotTimingsWithCost } = require("./getSlotTimings");
const VenueStats = require("../bookings/models/venueStats");
const moment = require('moment');
const { getIstDate } = require("../../common/utils/getIstDate");


module.exports.getSlots = async (req, res) => { 
    let { venueId, weekDayCode } = req.query;
    if (!venueId) return res.status(404).send(failureResponseMapper("Venue Id not provided"));
    weekDayCode = weekDayCode || '*';
    try {
        const venue = await Venue.findById(mongoose.Types.ObjectId(venueId));
        if (!venue || venue === {}) return res.status(404).send(failureResponseMapper("Venue with given Id not found"));
        const venueSlotsKey = `${venueId}.Slots`;
        if (cacheClient.has(venueSlotsKey)) {
            if (weekDayCode === '*') return res.status(200).send(successResponseMapper(JSON.parse(cacheClient.get(venueSlotsKey))));
            return res.status(200).send(successResponseMapper(JSON.parse((cacheClient.get(venueSlotsKey))).filter(slots => slots.weekDayCode === Number(weekDayCode))));
        }
        let totalAvailableSlots = [];
        let bookedData = [];
        const sessions = venue.sessions;
        for (let i = 1; i < 8; i++) { 
            const today = getIstDate();
            const currentDate = today.add(i-1,"days");
            const code = currentDate.day() + 1  > 7 ? currentDate.day() + 1 - 7 : currentDate.day() + 1;
            const sessionsPerDay = sessions.filter(session => {
                if (session.weekDayCode === code.toString()) return session;
            });
            
            let slotsPerDay = [];
            sessionsPerDay.forEach(session => { 
                slotsPerDay.push(...getSlotTimingsWithCost(session));
            });
            totalAvailableSlots.push({
                weekDayCode: code,
                slots: slotsPerDay
            })

            const bookedDataPerDay = await VenueStats.findOne({
                venue: mongoose.Types.ObjectId(venueId),
                weekDayCode: code,
                bookingDate: currentDate.format('LL')
            });

            let bookedSlotsPerDay = [];

            if (bookedDataPerDay) { 
                 bookedDataPerDay.slots.forEach(slot => {
                bookedSlotsPerDay.push(...getSlotTimings(slot.startTime,slot.endTime))
            })
            }
             bookedData.push({
                weekDayCode: code,
                slots: bookedSlotsPerDay
            })
        }


        for (let i = 0; i < totalAvailableSlots.length; i++) { 
            totalAvailableSlots[i].slots = totalAvailableSlots[i].slots.filter(slot => {
                if (bookedData[i].slots.length) {
                    if (!bookedData[i].slots.includes(slot.time)) {
                        return slot;
                    }   
                }
                else return slot;
            })
        }
        
        cacheClient.set(venueSlotsKey,JSON.stringify(totalAvailableSlots))
            if (weekDayCode === '*') return res.status(200).send(successResponseMapper(totalAvailableSlots));
            return res.status(200).send(successResponseMapper(totalAvailableSlots.filter(slots => slots.weekDayCode === Number(weekDayCode))))     }
    catch (err) { 
        console.log(err);
        return res.status(404).send(failureResponseMapper(err.message))
    }
}


module.exports.clearSlots = async (req, res) => { 
    let { venueId } = req.query;
    const venueSlotsKey = `${venueId}.Slots`;
    cacheClient.del(venueSlotsKey);
    res.status(200).send(successResponseMapper("Slots cleared for the venue!"));
};


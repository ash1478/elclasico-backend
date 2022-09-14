const moment = require('moment');

module.exports.getIstDate = function () { 
    return moment(new Date());
}
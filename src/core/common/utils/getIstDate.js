module.exports.getIstDate = function () { 
    return new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
}
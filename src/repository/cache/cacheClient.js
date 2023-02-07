const NodeCache = require("node-cache");
const cacheClient = new NodeCache({ checkperiod: 120 });

module.exports = cacheClient;
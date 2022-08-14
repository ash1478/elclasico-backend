var redis = require('redis').createClient({
    url: process.env.REDIS_URL
});

(async ()=>{
    await redis.connect();
    console.log("Redis connected!")
})()


module.exports = redis;
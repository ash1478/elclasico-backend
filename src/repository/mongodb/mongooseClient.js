const mongoose = require('mongoose');

module.exports = function initializeMongo() {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(() => {
            console.log('Mongo Connected')
        })
        .catch(err => console.log(err))
}

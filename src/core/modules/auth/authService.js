const failureResponseMapper = require("../../common/utils/failureResponseMapper");
const successResponseMapper = require("../../common/utils/successResponseMapper");
const User = require("./models/userModel");

module.exports.registerUser = async function (req,res) { 
    try {
        const user = req.body;
        console.log("The user body received is", user);
        const resp = await User.create(user);
        res.status(200).send(successResponseMapper(resp))
    }
    catch (err) { 
        console.log(err);
        res.status(400).send(failureResponseMapper(err.message))
    }

}


module.exports.loginUser = async function (req,res) { 
    try {
        const email = req.body;
        console.log("The email received is", email);
        const resp = await User.findOne({email});
        res.status(200).send(successResponseMapper(resp))
    }
    catch (err) { 
        console.log(err);
        res.status(400).send(failureResponseMapper(err.message))
    }

}


const failureResponseMapper = require("../../common/utils/failureResponseMapper");
const successResponseMapper = require("../../common/utils/successResponseMapper");
const User = require("./models/userModel");
var bcrypt = require('bcryptjs');

module.exports.registerUser = async function (req, res) {
    try {
        const user = req.body;

        if (!user) throw new Error("No user data provided");

        if (!user.password) throw new Error("No password provided");

        console.log("The user body received is", user);

        const salt = bcrypt.genSaltSync(10);
        user.password = bcrypt.hashSync(user.password, salt);

        const resp = await User.create(user);
        res.status(200).send(successResponseMapper(resp))
    }
    catch (err) {
        console.log(err);
        res.status(400).send(failureResponseMapper(err.message))
    }

}


module.exports.loginUser = async function (req, res) {
    try {
        const { email, password } = req.body;
        if (!email) throw new Error("No user data provided");

        if (!password) throw new Error("No password provided");

        console.log("The email received is", email);
        const resp = await User.findOne({ email });

        if (!bcrypt.compareSync(password, resp.password)) throw new Error("Incorrect password provided");

        res.status(200).send(successResponseMapper(resp))
    }
    catch (err) {
        console.log(err);
        res.status(400).send(failureResponseMapper(err.message))
    }

}


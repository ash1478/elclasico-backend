const mongoose = require("mongoose");
let Schema = mongoose.Schema;

let userSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        phoneNumber: {
            type: String,
            required: false,
            unique: true,
            index: true,
        },
        profileImageUrl: {
            type: String,
            required: false,
        },
        password: {
            type: String,
            required: false,
        }
    }
);

let User = mongoose.model("user", userSchema);

module.exports = User;
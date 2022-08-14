const express = require('express');
const authService = require("../auth/authService")

const authController = express.Router();

authController.post("/register", authService.registerUser);

module.exports = authController;
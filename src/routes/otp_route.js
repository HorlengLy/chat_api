const express = require("express")
const otp_route = express.Router()
const Controller = require("../Controller/authController")

otp_route.post('/get-otp',(req,res)=>new Controller(req,res).generateOTP())
otp_route.post('/check-otp',(req,res)=>new Controller(req,res).verifyOtp())

module.exports = otp_route
const express = require('express')
const Controller = require("../Controller")
const Middleware = require('../middleware')
const authRoute = express.Router()
const middleware = new Middleware()

// user login
authRoute.post('/login',(req,res) => new Controller(req,res).Login())
// user create account
authRoute.post('/register',(req,res) => new Controller(req,res).signUp())
// user verify email
authRoute.post('/verify-email',(req,res) => new Controller(req,res).verifyEmail())
// update information
authRoute.patch("/update-info/:id",(req,res) => new Controller(req,res).setInformation())
// update password
authRoute.patch("/update-password/:id",(req,res) => new Controller(req,res).updatePassword())
// verify token
authRoute.get('/verify-token',(req,res) => new Controller(req,res).verifyToken())
// views profile
authRoute.get('/get-profile-details/:id',middleware.requireAuth,(req,res) => new Controller(req,res).getProfileDeatil())
// verify otp
authRoute.post('/verify-otp',(req,res) => new Controller(req,res).verifyOTP())
// get otp
authRoute.post('/get-otp',(req,res) => new Controller(req,res).getOTP())
// set new password
authRoute.post('/set-password',(req,res) => new Controller(req,res).setNewPassword())
// check email
authRoute.get('/check-email',(req,res) => new Controller(req,res).checkEmail())
// search user
authRoute.get('/search-user',middleware.requireAuth,(req,res) => new Controller(req,res).searchUser())
// check username
authRoute.post('/check-username',middleware.requireAuth,(req,res) => new Controller(req,res).checkUsername())

module.exports = authRoute



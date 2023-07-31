const express = require('express')
const Controller = require("../Controller")
const Middleware = require('../middleware')
const authRoute = express.Router()

// user login
authRoute.post('/login',(req,res) => new Controller(req,res).Login())
// user create account
authRoute.post('/register',(req,res) => new Controller(req,res).signUp())
// user verify email
authRoute.post('/verify-email',(req,res) => new Controller(req,res).verifyEmail())
// verify token
authRoute.get('/get_profile',(req,res,next)=>new Middleware(req,res,next).requireAuth(),(req,res) => new Controller(req,res).GET_PROFILE())
// views profile
authRoute.get('/get-profile-details/:id',(req,res,next)=>new Middleware(req,res,next).requireAuth(),(req,res) => new Controller(req,res).getProfileDeatil())
// verify otp
authRoute.post('/verify-otp',(req,res) => new Controller(req,res).verifyOTP())
// set new password
authRoute.post('/set-password',(req,res) => new Controller(req,res).setNewPassword())
// check email
authRoute.get('/check-email',(req,res) => new Controller(req,res).checkEmail())
// search user
authRoute.get('/search-user',(req,res,next)=>new Middleware(req,res,next).requireAuth(),(req,res) => new Controller(req,res).searchUser())
// check username
authRoute.post('/check-username',(req,res,next)=>new Middleware(req,res,next).requireAuth(),(req,res) => new Controller(req,res).checkUsername())

module.exports = authRoute



const express = require("express")
const update_route = express.Router()
const Controller = require("../Controller/authController")

// update profile
update_route.patch('/profile-image',(req,res) => new Controller(req,res).changeProfileImage())
update_route.patch('/profile-cover',(req,res) => new Controller(req,res).changeCoverImage())
update_route.patch('/profile-info',(req,res) => new Controller(req,res).changeInformation())
update_route.patch('/password',(req,res)=>new Controller(req,res).updatePassword())
update_route.patch('/email',(req,res)=>new Controller(req,res).updateEmail())
update_route.patch('/username',(req,res)=>new Controller(req,res).upadateUsername())
update_route.patch('/account',(req,res)=>new Controller(req,res).updateAccount())
// update email
// update_route.post('')

module.exports = update_route
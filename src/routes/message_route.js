const express = require('express');
const controller = require("../Controller/messageController")

const messageRoute = express.Router()

// create room
messageRoute.post('/create-room',(req,res)=>new controller(req,res).createRoom())
// get friend list
messageRoute.get('/get-friend',(req,res)=>new controller(req,res).getFriends())
// sending message
messageRoute.post("/send-message/:room",(req,res) => new controller(req,res).sendMessage())
// get messages
messageRoute.get("/get-messages/:room",(req,res) => new controller(req,res).getMessage())

module.exports = messageRoute
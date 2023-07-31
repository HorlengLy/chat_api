const express = require('express');
const dashboard = require('../Controller/dashboard')
const route = express.Router()

route.get('/user',(req,res)=>new dashboard(req,res).users())
route.patch('/user/:id',(req,res)=>new dashboard(req,res).deleteUser())
route.patch('/set-role/:id',(req,res)=>new dashboard(req,res).setRole())

module.exports = route
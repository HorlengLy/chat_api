const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
require("./database")
const auth_route = require("./routes/auth_route")
const message_route = require("./routes/message_route")
const Middleware = require("./middleware")
const cloudinary = require('cloudinary').v2;
const cors = require("cors")
const update_route = require("./routes/update_route")
const otp_route = require("./routes/otp_route")
const dash_route = require("./routes/dashbord_route")
const app = express()
app.use(cors({
    origin: ["https://kh-chat.vercel.app","http://localhost:5173"],
    methods: ["GET", "POST", "DELETE", "PATCH"]
  }));
// confige cloude
cloudinary.config({
    cloud_name : process.env.CLOUND_NAME,
    api_key    : process.env.CLOUND_API_KEY,
    api_secret : process.env.CLOUND_API_SECRET_KEY,
    secure: true
  });
// middlware
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true }))
// routes
app.use('/api/auth', auth_route)
app.use('/api/ms', (req,res,next)=>new Middleware(req,res,next).requireAuth(), message_route)
app.use('/api/update', (req,res,next)=>new Middleware(req,res,next).requireAuth(), update_route)
app.use('/api/otp', otp_route)
app.use('/api/dashboard',(req,res,next)=>new Middleware(req,res,next).requiredAdminAccount(),dash_route)
// socket configuration
const {Server} = require('socket.io');
const server = require('http').createServer(app);
const io = new Server(server,{
  cors:{
      origin:["https://kh-chat.vercel.app","http://localhost:5173"],
      methods:["GET","POST"]
  }});

server.listen(process.env.PORT, () => console.log(`server runing at port ${process.env.PORT}`))

// web socket

var users = [];

io.on('connection', socket => {
    // when user disconnected
    socket.on("disconnect", () => {
        socket.nsp.emit("user_out", getUserId(socket.id))
        users = users.filter(user => user.id != socket.id)
    })
    // when user is active
    socket.on('online', _id => {
        _id && users.push({ _id, id: socket.id })
        socket.join(_id)
        socket.nsp.emit("user-online", users)
    })
    // user send message
    socket.on("message", ({ message, sendTo }) => {
        socket.to(sendTo).emit("message-response", message)
    })
    socket.on("user-logout", _id => {
        removeUser(_id)
        socket.nsp.emit("user_out", _id)
    })
})

const removeUser = _id => {
    users = users.filter(user => user._id != _id)
}
const getUserId = socket_id => {
    return users.find(user => user.id == socket_id)?._id
}



/* noted  
- broadcast send to all but not self
- nsp send to all include selft
*/

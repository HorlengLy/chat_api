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
const app = express()
const middleware = new Middleware()
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
app.use(cors({
  origin: "https://chat-i1y0fre7z-horlengly.vercel.app",
  methods: ["GET", "POST", "DELETE", "PATCH"]
}));
// routes
app.use('/api/auth', auth_route)
app.use('/api/ms', middleware.requireAuth, middleware.statusAccount, message_route)
app.use('/api/update', middleware.requireAuth, middleware.statusAccount, update_route)
app.use('/api/otp', otp_route)
app.listen(process.env.PORT, () => console.log(`server runing at port ${process.env.PORT}`))

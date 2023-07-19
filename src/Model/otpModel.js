const mongoose = require('mongoose');

const otp = new mongoose.Schema({
    email : {
        type : String ,
        required : true,
    },
    code : {
        type : String ,
        required : true,
    },
    createdAt :{
        type : Date ,
        expires : '1h',
        index : true ,
        default : Date.now
    }
})

module.exports = mongoose.model("otp",otp)
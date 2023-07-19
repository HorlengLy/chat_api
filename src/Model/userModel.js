const mongoose = require('mongoose');


const user = new mongoose.Schema({

    email : {
        type     : String,
        required  : true,
        unique : true
    },
    password : {
        type     : String,
        required  : true
    },
    information : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "information"
    },
    username : {
        type : String,
        required : false,
        default : ""
    }

},{
    timestamps : true
})

module.exports = mongoose.model("user",user)
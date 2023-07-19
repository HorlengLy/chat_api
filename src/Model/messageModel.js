const mongoose = require('mongoose');

const message = new mongoose.Schema({
    sender : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "information"
    },
    text : {
        type : String,
        required : false
    },
    file : {
        type : String,
        required :false
    },
    room : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "room"
    }
},
{
    timestamps : true
})

module.exports = mongoose.model("message",message)
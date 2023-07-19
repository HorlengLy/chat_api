const mongoose = require('mongoose');

const room = new mongoose.Schema({
    roomType : {
        type : String,
        required : true,
    },
    members : {
        type : [mongoose.Schema.Types.ObjectId],
        required : true,
        ref : "information"
    },
},
{
    timestamps :true
})

module.exports = mongoose.model("room",room)
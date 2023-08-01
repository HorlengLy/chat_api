const mongoose = require('mongoose')

const information = new mongoose.Schema({

    name : {
        type : String,
        require : true,
    },
    role : {
        type : String,
        default : "USER",
        required : false
    },
    isDeleted : {
        type : Boolean,
        required : false,
        default : false
    },
    bio : {
        type : String,
        required : false,
        default : ""
    },
    phone : {
        type : String,
        required : false,
        default : ""
    },
    profileImage : {
        type : String,
        required : false,
        default : ""
    },
    profileCover : {
        type : String,
        required : false,
        default : ""
    },
    verified : {
        type : Boolean,
        required : false,
        default : false
    }
    
},{
    timestamps : true
})

module.exports = mongoose.model("information", information)
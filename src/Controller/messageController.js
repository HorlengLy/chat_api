const ObjectId  = require("mongoose").Schema.Types.ObjectId
const BaseController = require("../Controller/baseController")
const informationModel = require("../Model/informationModel")
const messageModel = require("../Model/messageModel")
const roomModel = require("../Model/roomModel")

class Message extends BaseController {

    constructor(req, res) {
        super(req, res)
        this.req = req
        this.res = res
    }

    async createRoom() {
        const { roomType, id } = this.req.body
        const {user} = this.req
        if(!user)
            return this.response(process.env.UNAUTHENTICATION,{message : 'UNAUTHENTICATION',statusCode : process.env.UNAUTHENTICATION})
        if (!id)
            return this.response(process.env.ERROR, { message: "data required" })
        try {
            const createRome = await roomModel.create({
                roomType: roomType ? roomType : "PERSONAL",
                members : [id,user.information._id]
            })
            if (!createRome)
                return this.response(process.env.ERROR, {message: "Error !",statusCode: process.env.ERROR})
            const getInfo = await informationModel.findById(id)
            return this.response(process.env.CREATE, {message: "add friend success",statusCode: process.env.CREATE,room:createRome,getInfo})
        } catch (error) {
            console.log(error);
        }
    }

    async sendMessage() {
        const { sender, text, file } = this.req.body
        const room = this.req.params.room
        if (!sender || !room)
            return this.response(process.env.ERROR, { message: "data required" })
        if (!text && !file)
            return this.response(process.env.ERROR, { message: "send message required a content" })
        let upload = null
        if (file)
            upload = await this.uploadFile(file);
        try {
            const sent = await messageModel.create({
                text,
                file:file?upload.secure_url:"",
                room,
                sender
            })
            if(!sent)
                return this.response(process.env.ERROR, { 
                    message: "Error internet connection" ,
                    statusCode : process.env.ERROR,
            })
            return this.response(process.env.CREATE, { 
                message: "ok, message was sent" ,
                statusCode : process.env.CREATE,
                sent
            })
        } catch (err) {
            console.log(err);
        }
    }

    async getMessage() {
        let room = this.req.params.room
        if(room.length != 24)
                return this.response(process.env.ERROR,{
                    message : "invalid room",
                    statusCode : process.env.ERROR
                })
        try {
            const messages = await messageModel.find({
                room
            })
            return this.response(process.env.OK , {
                message : "ok",
                messages ,
                statusCode : process.env.OK
            })
        } catch (error) {
            console.log(error);
        }
    }

    async getFriends() {
        const user = this.req.user
        if(!user)
            return this.response(process.env.UNAUTHENTICATION,{message : "UNAUTHENTICATION",statusCode : process.env.UNAUTHENTICATION})
        try {
            const rooms = await roomModel.find({
                members:{
                    $in:user.information._id
                }
            }).populate('members')
            return this.response(process.env.OK, {
                message: "ok",
                rooms,
                statusCode : process.env.OK
            })
        } catch (error) {
            console.log(error);
        }
    }



}

module.exports = Message
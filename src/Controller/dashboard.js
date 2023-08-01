const userModel = require('../Model/userModel')
const BaseController = require('./baseController')
const informationModel = require('../Model/informationModel')

class dashboard extends BaseController {
    constructor(req,res){
        super(req,res)
    }
    async users(){
        try{
            const users = await userModel.find().populate('information')
            this.response(process.env.OK,{
                message : "ok",
                users
            })
        }catch(error){
            throw new Error(error);
        }
    }
    async deleteUser(){
        const {id} = this.req.params
        let {isDeleted} = this.req.body
        if(isDeleted !== true && isDeleted !== false){
            return this.response(process.env.ERROR,{message : "incorrect data provided",statusCode:process.env.ERROR})
        }
        try{
            const update = await informationModel.findByIdAndUpdate(id,{isDeleted},{new:true})
            if(update){
                this.response(process.env.OK,{
                    message : isDeleted?"user was deleted":'user was enable',
                    user : update,
                    statusCode:process.env.OK
                })
            }
            else{
                this.response(process.env.ERROR,{message : "something was wrong",statusCode:process.env.ERROR})
            }

        }catch(error){
            throw new Error(error);
        }
    }
    async setRole(){
        const {id} = this.req.params
        const {role} = this.req.query
        if(role !== "ADMIN" && role !== "USER" && role !== "SUPER_ADMIN"){
            return this.response(process.env.ERROR,{message:"incorrect data provided",statusCode:process.env.ERROR})
        }
        try{
            const user = await informationModel.findByIdAndUpdate(id,{role},{new : true})
            if(!user){
                return this.response(process.env.ERROR,{message:"something went wrong",statusCode:process.env.ERROR})
            }
            else {
                return this.response(process.env.OK,{message:"user updated",statusCode:process.env.OK,user })
            }

        }catch(error){
            throw new Error(error)
        }
    }
    async setVerified(){
        const {id} = this.req.params
        const {status} = this.req.body
        if(status != false && status != true){
            return this.response(process.env.ERROR,{message : "incorrect data provided",statusCode:process.env.ERROR})
        }
        try{
            const update = await informationModel.findByIdAndUpdate(id,{verified:status},{new:true})
            if(!update){
                return this.response(process.env.ERROR,{message:"something went wrong",statusCode:process.env.ERROR})
            }
            return this.response(process.env.OK,{message:"user was updated successfully",statusCode:process.env.OK,user:update})
        }
        catch(error){
            throw new Error(error)
        }
    }

}

module.exports = dashboard
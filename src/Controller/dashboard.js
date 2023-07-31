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
        if(isDeleted == null){
            return this.response(process.env.ERROR,{message : "required",statusCode:process.env.ERROR})
        }
        try{
            const update = await informationModel.findByIdAndUpdate(id,{isDeleted},{new:true})
            if(update){
                this.response(process.env.OK,{
                    message : isDeleted?"user was deleted":'user was enable',
                    user : update
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
        if(!role || role == ""){
            return this.response(process.env.ERROR,{message:"role is required",statusCode:process.env.ERROR})
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

}

module.exports = dashboard
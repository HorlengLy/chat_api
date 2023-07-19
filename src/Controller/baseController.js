
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const cloudinary = require('cloudinary').v2;

class BaseController {

    constructor(req,res){
        this.req = req;
        this.res = res;
    }
    response(status, data) {
        return this.res.status(Number(status)).json({
                data
            })
    }
    getToken(user) {
        const token = jwt.sign({
            user,
        }, process.env.TOKEN_KEY,{expiresIn:"7d"})

        return token
    }
    getSubToken(data){
        const token = jwt.sign({
            email : data?.email
        }, process.env.TOKEN_KEY,{expiresIn:"5m"})

        return token
    }
    getNameFromEmail(email){
        if(!email) return ""
        if(!email.includes('@')) return "" 
        return email.split('@')[0]
        
    }
    generateOtp(){
        let otp = Math.random() * 10**4
        otp = Math.floor(otp)
        return otp
    }
    mailSender({email,message,name}){
        const transporter = nodemailer.createTransport({
            service:"gmail",
            secure: true,
            auth: {
              user: process.env.EMAIL,
              pass: process.env.PASSWORD
            }
          });
          return transporter.sendMail({
            from: process.env.EMAIL , // sender address
            to: email, // list of receivers
            subject: `Hello ${name} ✔`, // Subject line
            // text: message, // plain text body
            html: message, // html body
          });
    }

    uploadFile(baseFile){
        const result = cloudinary.uploader.upload(baseFile,{
            folder:"KHMEEER-CHAT",
            unique_filename : true,
            use_filename : false,
            overwrite : true,
        })
        return result;
    }
    isEmail(string){
        if(!string) return false
        if(string.includes('@')) return true
        return false
    }

    

}
module.exports =  BaseController
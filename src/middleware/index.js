const jwt = require("jsonwebtoken")
class Middleware {

    requireAuth(req,res,next){
        let token = req.headers['authorization'];
        if(token && token.includes(" "))
            token = token.split(" ")[1]
        if(!token) 
            return res.status(Number(process.env.UNAUTHENTICATION))
            .json({
                message : "unAuthentication",
                statusCode : process.env.UNAUTHENTICATION
            })
        try{
            jwt.verify(token,process.env.TOKEN_KEY,(error,result)=>{
                if(error) 
                    return res.status(Number(process.env.UNAUTHENTICATION))
                    .json({
                        message:"unAuthentication",
                        statusCode : process.env.UNAUTHENTICATION
                    })
                req.user = result.user
                next()
            })
        }catch(err){
            console.log({err});
        }
    }
    statusAccount(req,res,next){
        const user = req.user
        if(!user){
            return res.status(Number(process.env.UNAUTHENTICATION)).json({
                data : {
                    message : "UNAUTHENTICATION",
                    statusCode : process.env.UNAUTHENTICATION
                }
            })
        }
        if(user.information?.isDeleted){
            return res.status(Number(process.env.UNAUTHENTICATION)).json({
                data : {
                    message : "Account has been bloked by administrator",
                    statusCode : process.env.UNAUTHENTICATION
                }
            })
        }
        next()
    }
}

module.exports = Middleware
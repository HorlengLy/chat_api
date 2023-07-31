const jwt = require("jsonwebtoken");
const BaseController = require("../Controller/baseController");
const userModel = require("../Model/userModel");
class Middleware extends BaseController {
    constructor(req, res, next) {
        super()
        this.req = req;
        this.res = res;
        this.next = next;
    }
    requireAuth() {
        let token = this.req.headers['authorization'];
        if (token && token.includes(" "))
            token = token.split(" ")[1]
        if (!token)
            return this.response(process.env.UNAUTHENTICATION, { message: "unAuthenticated", statusCode: process.env.UNAUTHENTICATION })
        try {
            jwt.verify(token, process.env.TOKEN_KEY, async (error, result) => {
                if (error)
                    return this.response(process.env.UNAUTHENTICATION, { message: "unAuthenticated", statusCode: process.env.UNAUTHENTICATION })
                const user = await userModel.findById(result.user?._id).populate('information')
                if (!user) {
                    return this.response(process.env.UNAUTHENTICATION, { message: "UN_AUTHENTICATED", statusCode: process.env.UNAUTHENTICATION })
                }
                if(user.information?.isDeleted){
                    return this.response(process.env.UNAUTHENTICATION, { message: "this account has blocked by admin", statusCode: process.env.UNAUTHENTICATION })
                }
                else {
                    this.req.user = user
                    this.next()
                }
            })
        } catch (err) {
            console.log({ err });
        }
    }
    requiredAdminAccount() {
        let token = this.req.headers['authorization'];
        if (token && token.includes(" "))
            token = token.split(" ")[1]
        if (!token) {
            return this.response(process.env.UNAUTHENTICATION, { message: "unAuthenticated", statusCode: process.env.UNAUTHENTICATION })
        }
        try {
            jwt.verify(token, process.env.TOKEN_KEY, async(error, result) => {
                if (error) {
                    return this.response(process.env.UNAUTHENTICATION, { message: "unAuthenticated", statusCode: process.env.UNAUTHENTICATION })
                }
                const user = await userModel.findById(result?.user?._id).populate('information')
                if(user?.information?.isDeleted){
                    return this.response(process.env.UNAUTHENTICATION, { message: "this account has blocked by admin", statusCode: process.env.UNAUTHENTICATION })
                }
                if (!user) {
                    return this.response(process.env.UNAUTHENTICATION, { message: "UN_AUTHENTICATED", statusCode: process.env.UNAUTHENTICATION })
                }
                else {
                    if (user.information?.role == "ADMIN" || user.information?.role == "SUPER_ADMIN") {
                        this.req.user = user
                        this.next()
                    }
                    else {
                        return this.response(process.env.FORBIDDEN, { message: "Can't access", statusCode: process.env.FORBIDDEN })
                    }
                }
            })
        }
        catch (error) {
            throw new Error(error)
        }

    }
    statusAccount() {
        const user = this.req.user
        if (!user) {
            return this.response(process.env.UNAUTHENTICATION, { message: "UNAUTHENTICATION", statusCode: process.env.UNAUTHENTICATION })
        }
        if (user.information?.isDeleted) {
            return this.response(process.env.UNAUTHENTICATION, { message: "Account has been bloked by administrator", statusCode: process.env.UNAUTHENTICATION })
        }
        this.next()
    }
}

module.exports = Middleware
const userModel = require("../Model/userModel")
const informationModel = require("../Model/informationModel")
const optModel = require("../Model/otpModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const BaseController = require("../Controller/baseController");
const otpModel = require("../Model/otpModel");
const roomModel = require("../Model/roomModel")
class User extends BaseController {

    constructor(req, res) {
        super(req, res)
        this.req = req
        this.res = res
    }


    async Login() {
        const { string, password } = this.req.body;
        let config = {}
        if (!string || !password)
            return this.response(process.env.ERROR, {
                message: "all fields are required"
            })
        if (this.isEmail(string)) config = { email: string }
        else config = { username: string }
        try {
            const user = await userModel.findOne(config).populate('information')
            if (!user)
                return this.response(process.env.ERROR, {
                    message: "resource requested not found",
                    statusCode: process.env.ERROR
                })
            if (user.information?.isDeleted) {
                return this.response(process.env.UNAUTHENTICATION, {
                    message: "this account has been bloked by admin",
                    statusCode: process.env.UNAUTHENTICATION
                })
            }
            const comparePassword = bcrypt.compareSync(password, user.password)
            if (!comparePassword)
                return this.response(process.env.ERROR, {
                    message: "Incorrect password",
                    statusCode: process.env.ERROR
                })

            return this.response(process.env.OK, {
                message: "Login successfully",
                token: this.getToken(user),
                user,
                statusCode: process.env.OK
            })
        } catch (error) {
            console.log(error);
        }

    }

    async signUp() {
        const { email, password } = this.req.body
        if (!email || !password)
            return this.response(process.env.ERROR, {
                message: "data is required",
                statusCode: process.env.ERROR
            })
        try {
            const name = this.getNameFromEmail(email)
            const createInfo = await informationModel.create({ name })
            if (!createInfo)
                return this.response(process.env.ERROR, {
                    message: "low internet connection",
                    statusCode: process.env.ERROR
                })

            const hashPassword = bcrypt.hashSync(password, Number(process.env.SALT))
            const create = await userModel.create({ email, password: hashPassword, information: createInfo._id })
            if (!create)
                return this.response(process.env.ERROR, {
                    message: "low internet connection",
                    statusCode: process.env.ERROR
                })
            await roomModel.create({ roomType: 'PERSONAL', members: [createInfo._id, process.env.SUPER_ADMIN] })
            return this.response(process.env.CREATE, {
                message: "okay, created",
                statusCode: process.env.CREATE
            })

        } catch (error) {
            throw new Error(error)
        }
    }

    async verifyEmail() {
        const { email } = this.req.body;
        let otp = this.generateOtp()
        while (otp.toString().length < 4) {
            otp = this.generateOtp()
        }
        if (!email || !otp)
            return this.response(process.env.ERROR, {
                message: "all field are required",
                statusCode: process.env.ERROR
            })
        await this.mailSender({
            email,
            name: this.getNameFromEmail(email),
            message: `<p style="letter-spacing:.5px;font-size=12px;">Email verification ,
            Your otp code to verify KhmeeerChat is <span style="color:blue;"><u><b>${otp}</b></u></span>.
            Don't share this code to others.
            Thanks full for using KhmeeerChat!.</p>`
        })
        const checkEmail = await userModel.findOne({ email })
        if (checkEmail)
            return this.response(process.env.ERROR, {
                message: "This email is already register, please go to login",
                statusCode: process.env.ERROR
            })
        const sentOtp = await otpModel.create({ email, code: otp })
        if (sentOtp)
            return this.response(process.env.CREATE, {
                message: "Ok, otp code created successfully",
                statusCode: process.env.CREATE
            })
        return this.response(process.env.ERROR, {
            message: "error! Something went wrong",
            statusCode: process.env.ERROR
        })
    }

    async setInformation() {
        const { name, birthDate, gender, userType, profileImage, coverImage } = this.req.body
        const id = this.req.params.id
        if (!id) return
        try {
            await informationModel.findByIdAndUpdate(id, {
                name, birthDate, profileImage, gender, coverImage, userType
            }, { new: true })
                .then((data) => {
                    return this.response(process.env.CREATE, {
                        message: "okay, infomation was saved",
                        data,
                        statusCode: process.env.CREATE
                    })
                })
        } catch (error) {
            console.log(error);
        }
    }
    async GET_PROFILE() {
        const {user} = this.req
        return this.response(process.env.OK,{message:"OK",user,statusCode: process.env.OK})
    }

    // profile request
    async getProfileDeatil() {
        const id = this.req.params.id
        try {
            await informationModel.findById(id)
                .then(user => {
                    return this.response(process.env.OK, {
                        message: "ok",
                        data: user,
                        statusCode: process.env.OK
                    })
                })
        } catch (error) {
            console.log(error);
        }
    }

    verifyOTP = async () => {
        const { email, otp } = this.req.body
        if (!email || !otp)
            return this.response(process.env.ERROR, {
                statusCode: process.env.ERROR,
                message: "all field are required"
            })
        const checkOTP = await otpModel.find({ email })
        if (!checkOTP.length)
            return this.response(process.env.ERROR, {
                statusCode: process.env.ERROR,
                message: "the resouce requested not found"
            })
        const lastOtp = checkOTP[checkOTP.length - 1]
        if (lastOtp.code != otp)
            return this.response(process.env.ERROR, {
                statusCode: process.env.ERROR,
                message: "Invalid otp",
            })
        const verifyToken = this.getSubToken(lastOtp)
        return this.response(process.env.OK, {
            statusCode: process.env.OK,
            message: "OK",
            verifyToken
        })
    }


    setNewPassword = async () => {
        const { email, password } = this.req.body;
        if (!email || !password)
            return this.response(process.env.ERROR, {
                message: "data is required",
                statusCode: process.env.ERROR
            })
        try {
            const hashPassword = bcrypt.hashSync(
                password,
                Number(process.env.SALT)
            )
            const savedPassword = await userModel.findOneAndUpdate({email}, {
                password: hashPassword
            })
            if (!savedPassword)
                return this.response(process.env.ERROR, {
                    message: "something went wrong",
                    statusCode: process.env.ERROR
                })
            return this.response(process.env.OK, {
                message: "password was changed successfully",
                statusCode: process.env.OK
            })

        } catch (error) {
            console.log({ error });
        }
    }

    changeProfileImage = async () => {
        const { profileImage } = this.req.body
        const user = this.req.user
        if (!user)
            return this.response(process.env.ERROR, {
                message: "invalid token"
            })
        if (!profileImage)
            return this.response(process.env.ERROR, ({
                message: "data are required",
                statusCode: process.env.ERROR
            }))
        try {
            const uploadImg = await this.uploadFile(profileImage)
            if (!uploadImg)
                return this.response(process.env.ERROR, {
                    message: "low internet connection",
                    statusCode: process.env.ERROR
                })

            const save = await informationModel.findByIdAndUpdate(user.information._id, {
                profileImage: uploadImg.secure_url
            }, { new: true })
            user.information = save
            const token = await this.getToken(user)
            return this.response(process.env.OK, {
                message: "ok",
                user,
                token,
                statusCode: process.env.OK
            })
        } catch (e) {
            console.log({ e });
        }
    }
    changeCoverImage = async () => {
        const { profileCover } = this.req.body
        const user = this.req.user
        if (!user)
            return this.response(process.env.ERROR, {
                message: "invalid token"
            })
        if (!profileCover)
            return this.response(process.env.ERROR, ({
                message: "data are required",
                statusCode: process.env.ERROR
            }))
        try {
            const uploadImg = await this.uploadFile(profileCover)
            if (!uploadImg)
                return this.response(process.env.ERROR, {
                    message: "low internet connection",
                    statusCode: process.env.ERROR
                })
            const save = await informationModel.findByIdAndUpdate(user.information._id, {
                profileCover: uploadImg.secure_url
            }, { new: true })
            user.information = save
            const token = await this.getToken(user)
            return this.response(process.env.OK, {
                message: "ok",
                user,
                token,
                statusCode: process.env.OK
            })
        } catch (e) {
            console.log({ e });
        }
    }
    changeInformation = async () => {
        const user = this.req.user
        const { bio, name, phone } = this.req.body
        if (!bio || !name || !phone)
            return this.response(process.env.ERROR, {
                message: "data required",
                statusCode: process.env.ERROR
            })
        if (!user)
            return this.response(process.env.ERROR, {
                message: "invalid token",
                statusCode: process.env.ERROR
            })
        try {
            const save = await informationModel.findByIdAndUpdate(user.information._id, {
                name, bio, phone
            }, { new: true })
            if (!save)
                return this.response(process.env.ERROR, {
                    message: "something went wrong",
                    statusCode: process.env.ERROR
                })
            user.information = save
            const token = await this.getToken(user)
            return this.response(process.env.OK, {
                statusCode: process.env.OK,
                message: "ok",
                token,
                user
            })
        } catch (error) {
            console.log({ error });
        }
    }

    checkUsername = async () => {
        const { username } = this.req.body
        if (!username)
            return this.response(process.env.ERROR, {
                message: "username is required",
                statusCode: process.env.ERROR
            })
        try {
            const searchUsername = await userModel.findOne({ username })
            if (searchUsername)
                return this.response(process.env.ERROR, {
                    message: "this username is already exists",
                    statusCode: process.env.ERROR,
                    isFound: true
                })
            return this.response(process.env.OK, {
                message: "ok",
                statusCode: process.env.OK,
                isFound: false
            })
        } catch (error) {
            throw new Error(error)
        }
    }

    updateAccount = async () => {
        const user = this.req.user
        const { email, password, username } = this.req.body
        if (!user)
            return this.response(process.env.ERROR, {
                message: "invalid token",
                statusCode: process.env.ERROR
            })
        if (!email || !password || !username)
            return this.response(process.env.ERROR, {
                message: "data required",
                statusCode: process.env.ERROR
            })
        const hashPassword = bcrypt.hashSync(
            password,
            Number(process.env.SALT))
        try {
            const changeAccount = await userModel.findByIdAndUpdate(user._id, {
                email,
                password: hashPassword
            }, { new: true })
            if (!changeAccount)
                return this.response(process.env.ERROR, {
                    message: "can't change account",
                    token,
                    user,
                    statusCode: process.env.ERROR
                })
            user.email = email
            user.password = hashPassword
            const token = await this.getToken(user)
            return this.response(process.env.OK, {
                message: "account changed",
                token,
                user,
                statusCode: process.env.OK
            })
        } catch (e) {
            console.log({ e });
        }

    }

    updateEmail = async () => {
        const { email } = this.req.body;
        const user = this.req.user
        if (!user)
            return this.response(process.env.ERROR, {
                message: "invalid token",
                statusCode: process.env.ERROR
            })
        if (!email)
            return this.response(process.env.ERROR, {
                message: "email is required",
                statusCode: process.env.ERROR
            })
        try {
            const update = await userModel.findByIdAndUpdate(user._id, { email }, { new: true })
            if (!update)
                return this.response(process.env.ERROR, {
                    message: "something went wrong",
                    statusCode: process.env.ERROR
                })
            user.email = email
            const token = await this.getToken(user)
            return this.response(process.env.OK, {
                message: "okay, updated",
                statusCode: process.env.OK,
                token,
                user
            })

        } catch (error) {
            throw new Error(error)
        }
    }

    upadateUsername = async () => {
        const { username } = this.req.body
        const user = this.req.user
        if (!user)
            return this.response(process.env.UNAUTHENTICATION, {
                message: "auAuthentication",
                statusCode: process.env.UNAUTHENTICATION
            })
        if (!username)
            return this.response(process.env.ERROR, {
                message: "username is required",
                statusCode: process.env.ERROR
            })
        try {

            const update = await userModel.findByIdAndUpdate(user._id, { username })
            if (!update)
                return this.response(process.env.ERROR, {
                    message: "something when wrong",
                    statusCode: process.env.ERROR,
                })
            user.username = username
            const token = this.getToken(user)
            return this.response(process.env.OK, {
                message: "okay, Username was updated",
                token,
                user,
                statusCode: process.env.OK
            })

        } catch (error) {
            throw new Error(error)
        }
    }

    updatePassword = async () => {
        const { password, confirmPassword } = this.req.body
        const user = this.req.user
        if (!password)
            return this.response(process.env.ERROR, {
                message: "all field are required",
                statusCode: process.env.ERROR
            })
        if (!user)
            return this.response(process.env.FORBIDDEN, {
                message: "invalid token",
                statusCode: process.env.FORBIDDEN
            })
        if (password != confirmPassword)
            return this.response(process.env.ERROR, {
                message: "the password not match",
                statusCode: process.env.ERROR
            })
        try {
            const hashPassword = bcrypt.hashSync(
                password,
                Number(process.env.SALT)
            )
            const chnagePassword = await userModel.findByIdAndUpdate(user._id, { password: hashPassword })
            if (!chnagePassword)
                return this.response(process.env.ERROR, {
                    message: "something went wrong",
                    statusCode: process.env.ERROR
                })
            user.password = hashPassword
            const token = await this.getToken(user)
            return this.response(process.env.OK, {
                message: "okay, password was updated",
                statusCode: process.env.OK,
                token,
                user
            })
        } catch (error) {
            console.log(error);
        }
    }

    checkEmail = async () => {
        const { email } = this.req.query
        if (!email)
            return this.response(process.env.ERROR, {
                message: "email required",
                statusCode: process.env.ERROR
            })
        try {
            const check = await userModel.findOne({email})
            if (check) {
                return this.response(process.env.ERROR, {
                    message: "this email is already exist",
                    statusCode: process.env.ERROR,
                    isFound: true
                })
            }
            return this.response(process.env.OK, {
                statusCode: process.env.OK,
                isFound: false,
                message: "unknown is email"
            })
        } catch (e) {
            console.log({ e });
        }
    }
    verifyOtp = async () => {
        const { otp, email } = this.req.body;
        if (!otp || !email)
            return this.response(process.env.ERROR, {
                message: "data required",
                statusCode: process.env.ERROR
            })
        try {
            const find = await otpModel.find({ email })
            if (!find.length)
                return this.response(process.env.ERROR, {
                    message: "the resource requested not found",
                    statusCode: process.env.ERROR
                })
            const last = find[find.length - 1];
            if (last.code != otp)
                return this.response(process.env.ERROR, {
                    message: "invalid otp",
                    statusCode: process.env.ERROR
                })
            return this.response(process.env.OK, {
                statusCode: process.env.OK,
                message: "ok",
            })
        } catch (e) {
            console.log(e);
        }
    }
    getOTP = async () => {
        const { email } = this.req.body
        let otp = this.generateOtp()
        while (otp.toString().length < 4) {
            otp = this.generateOtp()
        }
        if (!email || !otp)
            return this.response(process.env.ERROR, {
                message: "all field are required",
                statusCode: process.env.ERROR
            })
        try {
            const checkEmail = await userModel.findOne({ email })
            if (!checkEmail)
                return this.response(process.env.ERROR, {
                    statusCode: process.env.ERROR,
                    message: "email is't register yet"
                })
            await this.mailSender({
                email,
                name: this.getNameFromEmail(email),
                message: `<p style="letter-spacing:.5px;font-size=12px;">Recover password ,
                Your otp code to verify KhmeeerChat is <span style="color:blue;"><u><b>${otp}</b></u></span>.
                Don't share this code to others.
                Thanks full for using KhmeeerChat!.</p>`
            })
            const sent = await otpModel.create({ email, code: otp })
            if (!sent)
                return this.response(process.env.ERROR, {
                    statusCode: process.env.ERROR,
                    message: "something went wrong"
                })
            return this.response(process.env.CREATE, {
                statusCode: process.env.CREATE,
                message: "Ok, created successfully"
            })
        } catch (error) {
            console.log(error);
        }
    }

    generateOTP = async () => {
        const { email } = await this.req.body;
        if (!email)
            return this.response(process.env.ERROR, {
                message: "data required",
                statusCode: process.env.ERROR
            })
        let otp = this.generateOtp()
        while (otp < 1000) {
            otp = this.generateOtp()
        }
        try {
            const save = await otpModel.create({
                email,
                code: otp
            })
            if (!save)
                return this.response(process.env.ERROR, ({
                    message: "something went wrong",
                    statusCode: process.env.ERROR
                }))
            return this.response(process.env.CREATE, ({
                message: "okay, created",
                statusCode: process.env.CREATE,
                otp
            }))
        } catch (error) {
            console.log({ error });
        }
    }

    async searchUser() {
        const user = this.req.user;
        const { searchText } = this.req.query;
        let config = {};
        if (!user) {
            return this.response(process.env.UNAUTHENTICATION, {
                statusCode: process.env.UNAUTHENTICATION,
                message: "Unauthenticated"
            })
        }
        if (!searchText) {
            return this.response(process.env.ERROR, {
                message: "email or username is required",
                statusCode: process.env.ERROR
            })
        }
        if (this.isEmail(searchText)) config = { email: searchText }
        else config = { 'username': { '$regex': searchText, '$options': 'i' } }
        try {
            const user = await userModel.findOne(config).populate('information')
            if (!user) {
                return this.response(process.env.ERROR, {
                    message: "No Data Found",
                    statusCode: process.env.ERROR
                })
            }
            else {
                return this.response(process.env.OK, {
                    message: "ok",
                    statusCode: process.env.OK,
                    user
                })
            }

        } catch (e) {
            console.log({ e });
        }

    }
    
}

module.exports = User
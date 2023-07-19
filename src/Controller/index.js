const authController = require("./authController")

class Controller extends authController {
    constructor(req,res){
        super(req,res)
    }
}

module.exports = Controller
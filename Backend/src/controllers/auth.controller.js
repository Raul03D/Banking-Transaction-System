const userModel = require('../models/user.model');
const jwt = require("jsonwebtoken");
const emailservice = require('../services/email.service');
const tokenBlacklistModel = require('../models/blacklist.model');

async function userRegisterController(req, res) {
    try {
        const { email, name, password } = req.body;

        const isExists = await userModel.findOne({
            email: email
        });

        if (isExists) {
            return res.status(422).json({
                message: "User already exists",
                status: "failed"
            });
        }

        const user = await userModel.create({
            email,
            name,
            password
        });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" });
        res.cookie("token", token);

        res.status(201).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                systemUser: user.systemUser
            },
            token
        });

        await emailservice.sendRegistrationEmail(user.email, user.name);
        
    } catch (error) {
        return res.status(400).json({
            message: error.message,
            status: "failed"
        });
    }

    
}

async function userLoginController(req,res){
    const {email,password} = req.body;

    const user = await userModel.findOne({email}).select("+password +systemUser");

    if(!user){
        return res.status(404).json({
            message:"User or password is incorrect",
        })
    }

    const isValidPassword = await user.comparePassword(password);

    if(!isValidPassword){
        return res.status(404).json({
            message:"User or password is incorrect",
        })
    }

    const token = jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:"3d"});
    res.cookie("token",token);

    res.status(200).json({
        user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            systemUser: user.systemUser
        },
        token
    });

}

async function userLogoutController(req,res){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if(!token){
        return res.status(400).json({message:"User logout successfully"});
    }

    await tokenBlacklistModel.create({ token });
    res.clearCookie("token");
    res.status(200).json({message:"User logout successfully"});
}

module.exports = { userRegisterController, userLoginController, userLogoutController };
const userModel = require('../model/user_model');
const userService = require('../services/user_services');
const {validationResult} = require('express-validator');

const register = async (req,res,next) => {
    //Check data is correct
    const errors = validationResult(req);
    if(!errors) return res.status(400).json({error: errors.array()});

    //Get data from user after validation
    const {fullname, email, password} = req.body;

    // Encrypt the password
    const hashpass = await userModel.hashPassword(password);

    //Create user in MongoDB
    const user = await userService.createUser({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password : hashpass
    });

    //Generate JWT Token
    const token = await user.generateAuthToken();
    return res.status(201).json({message : "user Sucessfully created",info : {token,user}},)
}

const login = async (req,res,next) => {
    //Check data is correct
    const errors = validationResult(req);
    if(!errors) return res.status(400).json({error: errors.array()});

    //Get data from user after validation
    const {email, password} = req.body;

    //Find user by email
    const user = await userModel.findOne({ email }).select('+password');
    if(!user) return res.status(400).json({error : "User not found"});

    //Compare password
    const isMatch = await user.comparePassword(password,user.password);
    if(!isMatch) return res.status(400).json({error : "Invalid Credentials"});

    //Generate JWT Token
    const token = await user.generateAuthToken();
    return res.status(200).json({message : "user Sucessfully logged in",info : {token,user}},);
}


module.exports = {register, login};
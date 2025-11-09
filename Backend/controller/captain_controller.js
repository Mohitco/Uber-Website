const { validationResult } = require('express-validator');
const captainService = require('../services/captain_service');
const captainModel = require('../model/captain.model');
const blacklistTokenModel = require('../model/blacklistToken');

const registerCaptain = async(req,res) => {

    //Check for validation errors
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    //Extract data from request body
    const {fullname,email,password,vehicle} = req.body;

    //Check if captain with the same email already exists
    const existingCaptain = await captainModel.findOne({ email });
    if(existingCaptain){
        return res.status(400).json({ error: 'Captain with this email already exists' });
    }

    //Hash the password
    const hashPass = await captainModel.hashPassword(password);

    //Create the captain
    try{
        const captain = await captainService.createCaptain({
            firstname: fullname.firstname,
            lastname: fullname.lastname,
            email,
            password: hashPass,
            color: vehicle.color,
            plateNumber: vehicle.plateNumber,
            capacity: vehicle.capacity,
            vehicleType: vehicle.vehicleType
        });

        // Generate auth token
        const token = await captain.generateAuthToken(captain._id);

        return  res.status(201).json({
            message: 'Captain registered successfully',
            info : { token, captain }
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const loginCaptain = async(req,res) => {
    //Check for validation errors
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    //Extract data from request body
    const {email,password} = req.body;

    try {
        // Find captain by email
        const captain = await captainModel.findOne({ email }).select('+password');
        if(!captain){
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Compare passwords
        const isMatch = await captain.comparePassword(password, captain.password);
        if(!isMatch){
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate auth token
        const token = await captain.generateAuthToken(captain._id);
        res.cookie('token', token);

        return res.status(200).json({
            message: 'Captain logged in successfully',
            info: { token, captain }
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getCaptainProfile = async (req, res) => {
    try {
        const captain = req.captain;
        return res.status(200).json({ captain });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const logoutCaptain = async (req, res) => {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1]; 
    await blacklistTokenModel.create({ token });
    res.clearCookie('token');
    return res.status(200).json({ message: 'Captain logged out successfully' });
};


module.exports = {
    registerCaptain,
    loginCaptain,
    getCaptainProfile,
    logoutCaptain
};
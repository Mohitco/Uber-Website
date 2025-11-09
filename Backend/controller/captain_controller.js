const { validationResult } = require('express-validator');
const captainService = require('../services/captain_service');
const captainModel = require('../model/captain.model');

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


module.exports = {
    registerCaptain
};
const userModel = require('../model/user_model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports.authUser = async (req, res, next) => {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if(!token){
        return res.status(401).json({error : "No token, authorization denied"});
    }

    const isBlacklisted = await require('../model/blacklistToken').findOne({token});
    
    if(isBlacklisted){
        return res.status(401).json({error : "Token is blacklisted, authorization denied"});
    }
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);
        if(!user){
            return res.status(401).json({error : "User not found, authorization denied"});
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({error : "Token is not valid"});    
    }
};


module.exports.authCaptain = async (req, res, next) => {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if(!token){
        return res.status(401).json({error : "No token, authorization denied"});
    }
    const isBlacklisted = await require('../model/blacklistToken').findOne({token});
    
    if(isBlacklisted){
        return res.status(401).json({error : "Token is blacklisted, authorization denied"});
    }
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const captain = await require('../model/captain.model').findById(decoded.id);
        if(!captain){
            return res.status(401).json({error : "Captain not found, authorization denied"});
        }
        req.captain = captain;
        next();
    } catch (error) {
        return res.status(401).json({error : "Token is not valid"});    
    }
};
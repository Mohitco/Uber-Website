const express = require('express');
const { body } = require('express-validator');
const { registerCaptain,loginCaptain,getCaptainProfile, logoutCaptain } = require('../controller/captain_controller');
const { authCaptain } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register/captain',[
    body('fullname.firstname').not().isEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('vehicle.color').not().isEmpty().withMessage('Vehicle color is required'),
    body('vehicle.plateNumber').not().isEmpty().withMessage('Vehicle number is required'),
    body('vehicle.capacity').isInt({ min: 1 }).withMessage('Vehicle capacity must be at least 1'),
    body('vehicle.vehicleType').not().isEmpty().withMessage('Vehicle type is required'),
],registerCaptain
);

router.post('/login/captain',[
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').not().isEmpty().withMessage('Password is required'),
],loginCaptain);

router.get('/captain/profile',authCaptain,getCaptainProfile);
router.get('/logout/captain',authCaptain,logoutCaptain);

module.exports = router;
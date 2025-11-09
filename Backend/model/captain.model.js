const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const captainSchema = new mongoose.Schema({
    fullname:{
        firstname:{
            type: String,
            required: true,
            minLength : [3, 'First name must be at least 3 characters long']
        },
        lastname:{
            type: String,
            minLength : [3, 'Last name must be at least 3 characters long'],
            default: ''
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    password:{
        type: String,
        required: true,
        select: false
    },
    socketId:{
        type: String
    },
    status:{
        type: String,
        enum: ['active','inactive'],
        default: 'inactive'
    },
    vehicle:{
        color:{
            type: String,
            required: true,
            minLength: [3, 'Color must be at least 3 characters long']
        },
        plateNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minLength: [3, 'Plate number must be at least 3 characters long']
        },
        capacity: {
            type: Number,
            required: true,
            min: [1, 'Capacity must be at least 1'],
            max: [5, 'Capacity cannot exceed 5']
        },
        vehicleType: {
            type: String,
            required: true,
            enum: ['car', 'motorbike', 'auto']
        }
    },
    location:{
        lat:{
            type: Number,
        },
        lng:{
            type: Number,
        }
    }
});


captainSchema.methods.generateAuthToken = async function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

captainSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

captainSchema.statics.hashPassword = async function(password) {
    return await bcrypt.hash(password, 10);
};

const captainModel = mongoose.model('captain',captainSchema);

module.exports = captainModel;
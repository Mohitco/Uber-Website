const mongoose = require('mongoose');


const connectDb = async() => {
   try {
     await mongoose.connect(process.env.MONGO_URL);
     console.log('Database Connected Sucessfully');
   } catch (error) {
    console.log('Error in Database Connection',error);
    
   }
};

module.exports = connectDb;
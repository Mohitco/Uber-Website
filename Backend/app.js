const express = require('express');
require('dotenv').config();
const cors = require('cors');
const connectDb = require('./config/db');
const userRoutes = require('./routes/user_routes')
const app = express();

connectDb();

app.use(cors());
app.use(express.json());

app.get('/',(req,res) => {
    res.send('Radhe Radhe');
})

app.use('/api/v1',userRoutes);

module.exports = app;
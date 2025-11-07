const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();


app.use(cors());

app.get('/',(req,res) => {
    res.send('Radhe Radhe');
})

module.exports = app;
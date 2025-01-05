const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./route/userRoute');

const connectDB = require('./config/dbConfig');


const app = express();
app.use(express.json());



dotenv.config();

connectDB();


app.use('/user', userRoutes);

// ACCOUNTSID='ACaf96cdc7bd7254a1eb15cc014e1775d5'
// AUTHTOKEN='b1c4876f44e2d24cccb11d564ca0a0a3'

app.listen(process.env.PORT , ()=>{
    console.log(`server is listening on port ${process.env.PORT}`)
})
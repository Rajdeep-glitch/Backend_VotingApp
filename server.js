const express = require('express')
const app = express();
const db = require('./db');
require('dotenv').config();


const bodyparser = require('body-parser');
app.use(bodyparser.json());
const PORT = process.env.PORT || 3000;

const {jwtAuthMiddleware} = require('./jwt');

//Import the router files
const UserRoutes= require('./Routes/UserRoutes');
const candidateRoutes= require('./Routes/candidateRoute');


//use the routers
app.use('/user', UserRoutes);
app.use('/candidate', candidateRoutes);



app.listen(PORT, () =>{
    console.log("listening on port 3000");
})
const express = require('express');
const router = express.Router();
const {jwtAuthMiddleware, generateToken} = require('./../jwt');
const user = require('./../models/user');

// POST route to add a user
router.post('/signup', async (req, res) =>{
    try{
        const data = req.body // Assuming the request body contains the user  data

        // Create a new user document using the Mongoose model
        const newuser = new user(data);

        // Save the new user  to the database
        const response = await newuser.save();
        console.log('data saved');

        const payload = {
            id: response.id
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("Token is : ", token);

        res.status(200).json({response: response, token: token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

// Login Route
router.post('/login', async(req, res) => {
    try{
        // Extract addharcardNumber and password from request body
        const {addharcardNumber, password} = req.body;

        // Find the user by addharcardNumber
        const user = await user.findOne({addharcardNumber: addharcardNumber});

        // If user does not exist or password does not match, return error
        if( !user || !(await user.comparePassword(password))){
            return res.status(401).json({error: 'Invalid username or password'});
        }

        // generate Token 
        const payload = {
            id: user.id,
        }
        const token = generateToken(payload);

        // resturn token as response
        res.json({token})
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Profile route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try{
        const userData = req.user;
        const userId = userData.id;
        const user = await Person.findById(userId);
        res.status(200).json({user});
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.put('/profile/password', jwtAuthMiddleware, async (req, res)=>{
    try{
        const userId = req.user.id; // Extract the id from token
        const {currentPassword,newPassword}= req.body //extracting passwords form the body


        //finding user using userId
        const user = await user.findOne(userId);

        // If password does not match, return error
        if( !(await user.comparePassword(currentPassword))){
            return res.status(401).json({error: 'Invalid username or password'});
        }

        //Update the users password
        user.password = newPassword;
        await user.save();

        console.log('Password updated');
        res.status(200).json({message: "password updated"});
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

module.exports = router;
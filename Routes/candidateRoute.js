const express = require('express');
const router = express.Router();
const {jwtAuthMiddleware, generateToken} = require('../jwt');
const candidate = require('../models/candidate');
const user = require('../models/user');


const checkAdminRole = async(userId) =>{
    try{
        const User = await user.findById(userId);
     if(User.role === 'admin'){
             return true;
        }
     
    }
    catch(err){                                      
        return false;

    }
}
// POST route to add a candidate
router.post('/', jwtAuthMiddleware, async (req, res) =>{
    try{
        if (! (await checkAdminRole(req.user.id)))
            return res.status(403).json({message:"user does not have admin role"});
        
        const data = req.body // Assuming the request body contains the candidate data

        // Create a new user document using the Mongoose model
        const newCandidate = new candidate(data);

        // Save the new user  to the database
        const response = await newCandidate.save();
        console.log('data saved');

        res.status(200).json({response: response});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});


router.put('/:candidateId', jwtAuthMiddleware, async (req, res)=>{
    try{
        if (!(await checkAdminRole(req.user.id)))
            return res.status(403).json({message:"user does not have admin role"});

        const candidateId = req.params.candidateId; // Extract the id from the URL parameter
        const updatedCandidateData = req.body; // Updated data for the person

        const response = await candidate.findByIdAndUpdate(candidateId, updatedCandidateData, {
            new: true, // Return the updated document
            runValidators: true, // Run Mongoose validation
        })

        if (!response) {
            return res.status(404).json({ error: 'candidate not found' });
        }

        console.log('candidate data updated');
        res.status(200).json(response);;
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

router.delete('/:candidateId', jwtAuthMiddleware, async (req, res)=>{
    try{
        if (!(await checkAdminRole(req.user.id)))
            return res.status(403).json({message:"user does not have admin role"});

        const candidateId = req.params.candidateId; // Extract the id from the URL parameter

        const response = await candidate.findByIdAndDelete(candidateId);

        if (!response) {
            return res.status(404).json({ error: 'candidate not found' });
        }

        console.log('Candidate Deleted');
        res.status(200).json(response);;
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

// lets start voting
router.post('/vote/:candidateId', jwtAuthMiddleware, async (req, res) =>{
    //No admin can vote
    const candidateId= req.params.candidateId;
    const userid= req.user.id;


    try{
        const Candidate = await candidate.findById(candidateId);
        if (!Candidate) {
            return res.status(404).json({ error: 'candidate not found' });
        }

        const User= await user.findById(userid);
        if (!User) {
            return res.status(404).json({ error: 'user not found' });
        }
        if(User.isvoted){
            return res.status(400).json({message:"you already voted"});
        }
        if(User.role =='admin'){
            return res.status(403).json({message:"admin cannot vote"});
        }

        //update the candidate document to record the vote
        Candidate.Votes.push({user: userid})
        Candidate.votecount++;
        await Candidate.save();
        
        //update the user document to record the vote
        User.isvoted=true;
        await User.save();

        res.status(200).json({message: "You voted succesfully"});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});

    }
    
});

//vote count
router.get('/vote/count', async (req, res) =>{
    try{
        //Find all candidates and sorting them
        const Candidates = await candidate.find().sort({votecount: 'desc'});

        //Map the candidate to return their name and vote count
        const voterecord = Candidates.map((data) =>{
            return{
                name: data.name,
                Party: data.Party,
                count: data.votecount
            }
        });

        return res.status(200).json(voterecord);

    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});
module.exports = router;
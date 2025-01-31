const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
    Name:{
        type:String,
        required:true
    },
    Party: {
        type: String,
        required: true
    },
    Age: {
        type: Number,
        required: true
    },
    Votes: [
        {
            user:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            votedAt:{
                type: Date,
                default: Date.now()
            }
        }
    ],
    votecount:{
        type:Number,
        default:0
    }

});

const candidate = mongoose.model('candidate', CandidateSchema);
module.exports = candidate;

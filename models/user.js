const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the Person schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age:{
        type: Number
    },
    mobile:{
        type: String
    },
    email:{
        type:String,
    },
    address:{
        type:String
    },
    password:{
        type:String,
        required:true
    },
    addharcardNumber:{
        type: Number,
        required: true,
        unique: true
    },
    role:{
        type:String,
        enum: ['admin', 'user'],
        default:'voter'
    },
    isvoted:{
        type:Boolean,
        default:false
    }
});


userSchema.pre('save', async function(next){
    const person = this;

    // Hash the password only if it has been modified (or is new)
    if(!person.isModified('password')) return next();

    try{
        // hash password generation
        const salt = await bcrypt.genSalt(10);

        // hash password
        const hashedPassword = await bcrypt.hash(person.password, salt);
        
        // Override the plain password with the hashed one
        person.password = hashedPassword;
        next();
    }catch(err){
        return next(err);
    }
})

userSchema.methods.comparePassword = async function(candidatePassword){
    try{
        // Use bcrypt to compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    }catch(err){
        throw err;
    }
}

// Create Person model
const user = mongoose.model('user', userSchema);
module.exports = user;
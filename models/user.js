const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true
    },
    phone:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true,
        trim:true
    },
    loggedIn:{
        type:Boolean,
        default:true
    }
})

module.exports = mongoose.model('user', userSchema)
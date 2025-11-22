const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    loggedIn: {
        type: Boolean,
        default: true
    }
})

module.exports = mongoose.model('admin', adminSchema)
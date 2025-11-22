const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    category: {
        type: String,
        trim: true,
        required: true
    },
    price: {
        type: Number,
        min: 0,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    publicId: {
        type: String,
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model('product', productSchema)
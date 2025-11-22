const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },

    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product',
                required: true
            },

            quantity: {
                type: Number,
                required: true,
                min: 1
            },

            // Snapshot the price at the moment of purchase
            priceAtPurchase: {
                type: Number,
                required: true
            },

            // Snapshot the name at the moment of purchase
            nameAtPurchase: {
                type: String,
                required: true
            }
        }
    ],

    // Order-level total amount
    total: {
        type: Number,
        required: true,
        min: 0
    },

    fulfilled: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

module.exports = mongoose.model('order', orderSchema);

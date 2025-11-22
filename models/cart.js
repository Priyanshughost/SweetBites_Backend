const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', 
    required: true,
    unique:true
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
        default: 1
      }
    }
  ]
});

module.exports = mongoose.model('Cart', cartSchema);

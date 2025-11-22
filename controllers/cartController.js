const Cart = require("../models/cart");
const Product = require("../models/product");
const Order = require("../models/order");
const mongoose = require("mongoose");
const product = require("../models/product");

// GET CART
exports.getCart = async (req, res) => {
    try {
        const { userId } = req.params;

        const cart = await Cart.findOne({ user: userId })
            .populate("products.product");

        if (!cart) {
            return res.status(200).json({ message: "No products in Cart" });
        }

        res.status(200).json({ cart: cart });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// ADD TO CART
exports.addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        let cart = await Cart.findOne({ user: userId });
        const stock = await product.findOne({ _id: productId })
        if (!stock) {
            return res.status(404).json({
                message: "Product not found"
            })
        }
        // If user has no cart, create one
        if (!cart) {
            cart = await Cart.create({
                user: userId,
                products: [{ product: productId, quantity }]
            });
        } else {
            // Check if product already exists in cart
            const item = cart.products.find(
                (p) => p.product.toString() === productId
            );

            if (item) {
                item.quantity += quantity;
            } else {
                cart.products.push({ product: productId, quantity });
            }

            await cart.save();
        }

        const populated = await Cart.findById(cart._id).populate("products.product");
        res.status(200).json(populated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// UPDATE QUANTITY
exports.updateCartItem = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        // Step 1: apply increment / decrement
        const result = await Cart.updateOne(
            { user: userId, "products.product": productId },
            { $inc: { "products.$.quantity": quantity } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Product not in cart" });
        }

        // Step 2: remove items whose quantity is 0
        await Cart.updateOne(
            { user: userId },
            { $pull: { products: { quantity: { $lte: 0 } } } }
        );

        // Step 3: return updated cart populated
        const updated = await Cart.findOne({ user: userId }).populate("products.product");

        res.status(200).json(updated);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// REMOVE ITEM
exports.removeFromCart = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({
                message: "Missing Parameters in request"
            });
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        await Cart.updateOne(
            { user: userId },
            { $pull: { products: { product: productId } } }
        );

        const updated = await Cart.findOne({ user: userId })
            .populate("products.product");

        res.status(200).json(updated);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


// CHECKOUT
exports.checkout = async (req, res) => {
    try {
        const { userId } = req.body;

        const cart = await Cart.findOne({ user: userId }).populate("products.product");
        if (!cart || cart.products.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        const orderItems = cart.products.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
            priceAtPurchase: item.product.price,
        }));

        const totalAmount = orderItems.reduce((sum, item) => {
            return sum + item.priceAtPurchase * item.quantity;
        }, 0);

        const order = await Order.create({
            user: userId,
            products: orderItems,
            totalAmount,
        });

        await Cart.findOneAndDelete({ user: userId });

        const populatedOrder = await Order.findById(order._id).populate("products.product");

        res.status(201).json({ success: true, order: populatedOrder });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

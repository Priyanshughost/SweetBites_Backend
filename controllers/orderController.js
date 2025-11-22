const Order = require("../models/order");
const User = require("../models/user");
const Product = require("../models/product");
const mongoose = require("mongoose");
const cart = require("../models/cart");

exports.createOrder = async (req, res) => {
    try {
        const { userId, items } = req.body;

        // Ensure items are provided
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Order cannot be empty" });
        }

        // Validate userId
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid userId" });
        }

        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({ message: "User does not exist" });
        }

        // Extract product IDs from items
        const productIds = items.map(i => i.productId);

        // Validate all product IDs
        if (productIds.some(id => !mongoose.Types.ObjectId.isValid(id))) {
            return res.status(400).json({ message: "Invalid productId format" });
        }

        // Fetch product data
        const products = await Product.find({ _id: { $in: productIds } });

        if (products.length !== productIds.length) {
            return res.status(400).json({
                message: "One or more Products do not exist"
            });
        }

        // Build product array with price snapshots
        let totalAmount = 0;

        const formattedItems = items.map(item => {
            const prod = products.find(p => p._id.toString() === item.productId);

            const itemTotal = prod.price * item.quantity;
            totalAmount += itemTotal;

            return {
                product: item.productId,
                quantity: item.quantity,
                priceAtPurchase: prod.price,
                nameAtPurchase: prod.name
            };
        });

        const newOrder = await Order.create({
            user: userId,
            products: formattedItems,
            fulfilled: false,
            total: totalAmount
        });

        await cart.findOneAndDelete({ user: userId });
        
        const populated = await Order.findById(newOrder._id)
            .populate("products.product");

        res.status(201).json({
            message: "Order Placed",
            order: populated
        });

    } catch (error) {
        console.error("Order creation error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "name email phone")
            .populate("products.product")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("Get all orders error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid userId" });
        }

        const orders = await Order.find({ user: userId })
            .populate("products.product")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("User orders error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.markFulfilled = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: "Invalid orderId" });
        }

        const order = await Order.findByIdAndDelete({_id: orderId})
        const orders = await Order.find()

        if (!order) {
            return res.status(404).json({ message: "Order not found"});
        }

        res.status(200).json({ message: "Order Delivered", orders});

    } catch (error) {
        console.error("Fulfill order error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: "Invalid orderId" });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        await Order.findByIdAndDelete(orderId);

        res.status(200).json({ success: true, message: "Order deleted" });
    } catch (error) {
        console.error("Delete order error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

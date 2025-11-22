const product = require('../models/product')
const cloudinary = require('../config/cloudinary')
const fs = require('fs')

exports.getAllProducts = async (req, res) => {
    try {
        const productList = await product.find()
        res.status(200).json({
            products: productList
        })
    }
    catch (e) {
        console.log(e)
        res.status(500).json({
            message: "Something went wrong"
        })
    }
}

exports.getSomeProducts = async (req, res) => {
    try {
        const productList = await product.aggregate([
            { $sample: { size: 5 } }
        ])

        res.status(200).json({products: productList})
    }
    catch (e) {
        console.log(e)
        res.status(500).json({
            message: "Something went wrong"
        })
    }
}

exports.uploadProducts = async (req, res) => {
    try {
        const { name, category, price } = req.body;
        const file = req.files?.file;
        console.log(file)

        if (!name || !category || !price || !file) {
            return res.status(400).json({
                success: false,
                message: "All fields (name, category, price, file) are required"
            });
        }

        const parsedPrice = Number(price);
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid price"
            });
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: "Only JPG, PNG, WebP images are allowed"
            });
        }

        const uniqueName = `${Date.now()}-${file.name.split('.')[0]}`;

        const uploadResult = await cloudinary.uploader.upload(
            file.tempFilePath,
            {
                folder: "products",
                public_id: uniqueName,
                overwrite: false
            }
        );

        fs.unlink(file.tempFilePath, () => {});

        const newProduct = await product.create({
            name,
            category,
            price: parsedPrice,
            imageUrl: uploadResult.secure_url,
            publicId: uploadResult.public_id   
        });

        return res.status(201).json({
            success: true,
            message: "Product created",
            product: newProduct
        });

    } catch (error) {
        console.error("Upload product error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

exports.updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { name, price, category } = req.body;
        const file = req.files?.file;

        if (!productId) {
            return res.status(400).json({ message: "productId is required" });
        }

        let prod = await product.findById(productId);

        if (!prod) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (name) prod.name = name;
        if (category) prod.category = category;

        if (price) {
            const parsedPrice = Number(price);
            if (isNaN(parsedPrice) || parsedPrice <= 0) {
                return res.status(400).json({ message: "Invalid price" });
            }
            prod.price = parsedPrice;
        }

        if (file) {
            const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
            if (!allowedTypes.includes(file.mimetype)) {
                return res.status(400).json({
                    message: "Only JPG, PNG, WebP images allowed"
                });
            }

            // const parts = prod.imageUrl.split('/');
            // const oldFile = parts.at(-1);
            // const oldPublicId = `products/${oldFile.split('.')[0]}`;

            try {
                await cloudinary.uploader.destroy(prod.publicId);
            } catch (err) {
                console.error("Cloudinary delete error:", err);
            }

            const uniqueName = `${Date.now()}-${file.name}`;
            const upload = await cloudinary.uploader.upload(
                file.tempFilePath,
                {
                    folder: "products",
                    public_id: uniqueName,
                    overwrite: false
                }
            );

            fs.unlink(file.tempFilePath, () => {});

            prod.imageUrl = upload.secure_url;
            prod.publicId = upload.public_id
        }

        await prod.save();

        return res.status(200).json({
            success: true,
            message: "Product updated",
            prod
        });

    } catch (error) {
        console.error("Update product error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({ message: "productId is required" });
        }

        const prod = await product.findById(productId);
        if (!prod) {
            return res.status(404).json({ message: "Product not found" });
        }

        try {
            await cloudinary.uploader.destroy(prod.publicId);
        } catch (err) {
            console.error("Cloudinary delete error:", err);
        }

        await product.findByIdAndDelete(productId);

        return res.status(200).json({
            success: true,
            message: "Product deleted"
        });

    } catch (error) {
        console.error("Delete product error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};


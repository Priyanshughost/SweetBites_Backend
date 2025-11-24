const admin = require("../models/admin")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password || email.trim() === "" || password.trim() === "") {
            return res.status(400).json({ message: "Please fill the details" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existingUser = await admin.findOne({ email })
        if (existingUser) {
            const validPass = await bcrypt.compare(password, existingUser.password)

            if (!validPass) {
                return res.status(401).json({
                    message: 'Invalid Credentials'
                })
            }
            const payload = {
                role: 'admin',
                id: existingUser._id,
                email: existingUser.email
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: '7d'
            })

res.cookie("sweetToken", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

            existingUser.password = undefined
            existingUser.role = 'admin'
            return res.status(200).json({
                message: 'Login Successful',
                user: existingUser,
                token: token
            });
        }
        else {
            const adminEmail = process.env.ADMIN_EMAIL
            if (email === adminEmail) {
                const hashed = await bcrypt.hash(password, 10)
                const createdUser = await admin.create({ email, password: hashed })
                const payload = {
                    role: 'admin',
                    id: createdUser._id,
                    email: createdUser.email
                }
                const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' })
                res.cookie("sweetToken", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});
                return res.status(200).json({
                    message: 'Registration Successfull',
                    user: createdUser,
                    token: token
                })
            }

            return res.status(403).json({
                message: "Access Denied"
            })
        }
    }
    catch (e) {
        res.status(500).json({
            message: 'Failed to Login'
        })
    }
}
exports.logout = async (req, res) => {
    res.clearCookie('sweetToken', {
        httpOnly: true,
        sameSite: "none",
        secure: true,                             // if frontend is same-site
        path: '/'                                       // match how it was set
    });

    return res.status(200).json({ message: 'Admin Logged Out' });

}

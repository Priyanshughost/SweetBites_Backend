const jwt = require("jsonwebtoken")
const user = require("../models/user")
require('dotenv').config()
const bcrypt = require('bcrypt')

exports.signup = async (req, res) => {
    try {
        const { name, email, phone, password, address } = req.body
        if (await user.findOne({ email })) {
            return res.status(400).json({
                message: 'Email already registered'
            })
        }

        const hashed = await bcrypt.hash(password, 10)
        const createdUser = await user.create({ name, email, phone, password: hashed, address })
        const payload = {
            role: 'user',
            email: email,
            id: createdUser._id
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '7d'
        })

        res.cookie('sweetToken', token, {
            httpOnly: true,
            sameSite: "none",
            secure: true
        });

        createdUser.role = "user"
        res.status(200).json({
            message: 'Signin Successful',
            user: createdUser,
            role: "user",
            token: token
        })
    }
    catch (e) {
        res.status(500).json({
            message: 'Failed to Register'
        })
    }
}

exports.login = async (req, res) => {
    try {
        // res.status(200).json({email: req.body})
        const { email, password } = req.body
        if (!email || !password || email === "" || password === "") {
            return res.status(400).json({ message: "Please fill the details" })
        }

        const existingUser = await user.findOne({ email })
        if (existingUser) {
            const validPass = await bcrypt.compare(password, existingUser.password)

            if (!validPass) {
                return res.status(401).json({
                    message: 'Inavlid Password'
                })
            }
            const payload = {
                role: 'user',
                email: existingUser.email,
                id: existingUser._id
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: '7d'
            })

            res.cookie('sweetToken', token, {
                httpOnly: true,
                secure: false, // set true in production (HTTPS)
                sameSite: "none",
                secure: true
            });

            existingUser.role = "user"
            return res.status(200).json({
                message: 'Login Successful',
                user: existingUser,
                role: "user",
                token: token
                // no need to return token if cookie is used
            });
        }
        else {
            return res.status(404).json({
                message: 'User Not Found'
            })
        }
    }
    catch (e) {
        res.status(500).json({
            message: 'Failed to Login'
        })
    }
}

exports.logout = (req, res) => {
    try {
        res.clearCookie('sweetToken', {
            httpOnly: true,
            sameSite: "none",
            secure: true,                             // if frontend is same-site
            path: '/'                                       // match how it was set
        });

        res.status(200).json({ message: 'Logout Successful' });
    }
    catch (e) {
        res.status(400).json({ message: "Token not available" })
    }
};

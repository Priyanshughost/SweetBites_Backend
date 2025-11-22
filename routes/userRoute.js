const express = require('express')
const { signup, logout, login } = require('../controllers/userAuth')
const {createOrder, getUserOrders} = require('../controllers/orderController')
const {auth} = require("../middlewares/isUser")
const { getCart, addToCart, updateCartItem, removeFromCart } = require('../controllers/cartController')
const { getSomeProducts, getAllProducts } = require('../controllers/productController')
const userRouter = express.Router()
const { isAuth } = require('../middlewares/isAuth')

userRouter.post('/signup', signup)
userRouter.post('/logout', isAuth, logout)
userRouter.post('/login', login)

userRouter.post('/order', auth, createOrder)
userRouter.get('/getMyOrders/:userId', getUserOrders)

userRouter.get('/getCart/:userId', getCart)
userRouter.post('/addToCart', auth, addToCart)
userRouter.post('/updateCart', auth, updateCartItem)
userRouter.post('/removeFromCart',auth , removeFromCart)

userRouter.get('/getProducts', getSomeProducts)
userRouter.get('/getAllProducts', getAllProducts)
module.exports = userRouter
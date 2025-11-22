const express = require('express')
const { login, logout } = require('../controllers/adminAuth')
const { isAuth } = require('../middlewares/isAuth')
const { uploadProducts, getAllProducts, deleteProduct, updateProduct } = require('../controllers/productController')
const { getAllOrders, markFulfilled, deleteOrder } = require('../controllers/orderController')
const { auth } = require('../middlewares/isAdmin')
const adminRouter = express.Router()

adminRouter.post('/login', login)
adminRouter.post('/logout', isAuth, logout)
adminRouter.post('/upload', auth, uploadProducts)
adminRouter.post('/deleteProduct/:productId', auth, deleteProduct)
adminRouter.post('/updateProduct/:productId', auth, updateProduct)
adminRouter.get('/getAllProducts', getAllProducts)
adminRouter.get('/getAllOrders', getAllOrders)
adminRouter.post('/completed/:orderId', auth, markFulfilled)
adminRouter.post('/deleteOrder/:orderId', auth, deleteOrder)

module.exports = adminRouter
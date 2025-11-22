const express = require('express')
const app = express()
require('dotenv').config()
const dbConnect = require('./config/database')
const  userRouter = require('./routes/userRoute')
const  adminRouter = require('./routes/adminRoute')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const cors = require('cors')
require('./config/cloudinary')

app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: process.env.ORIGIN, // whatever your frontend runs on
  credentials: true
}))
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));
app.use('/api/user', userRouter)
app.use('/api/admin', adminRouter)
app.get('/', (req, res) => {
  res.status(200).json({message:"Connection Succesfull"})
})
dbConnect()
app.listen(process.env.PORT, () => {
    console.log("Server Started")
})
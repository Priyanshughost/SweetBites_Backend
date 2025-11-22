const mongoose = require('mongoose')

const dbConnect = () => {
    mongoose.connect(process.env.DB_URL).then(() => {
        console.log('Database Connection Successful')
    }).catch((e) => {
        console.log("Database Connection Failed", e)
        process.exit(1)
    })
}

module.exports = dbConnect
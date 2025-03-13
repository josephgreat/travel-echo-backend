require('express-async-errors')
const express = require('express')
const errorHandler = require('#middleware/error-handler')
const initializeDatabase = require('#database/db')
const initializeCloudinary = require('#config/cloudinary.config')
const corsConfig = require('#config/cors.config')
//const limiter = require('./config/rate-limit.config')
const routes = require('./routes')

initializeDatabase()
initializeCloudinary()

const app = express()

//Middleware
app.use(corsConfig)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static('public'))
//app.use(limiter)

app.use(routes())

//Error handling middleware must be the last
app.use(errorHandler)

module.exports = app

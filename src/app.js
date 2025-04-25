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

//Routes
app.use(routes())

//Error handling middleware must be the last
app.use(errorHandler)

module.exports = app

/**
 * @def {searchParams}
 * @par {sort?} @query To sort the data e.g sort=createdAt,ASC
 * @par {limit?} @query To limit the number of results e.g limit=10
 * @par {skip?} @query To skip a number of results e.g skip=10
 */

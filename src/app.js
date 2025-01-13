require('express-async-errors')
const express = require('express')
const errorHandler = require('./middleware/error-handler')
const initializeDatabase = require('./config/database.config')
const corsConfig = require('./config/cors.config')
const routes = require('./routes')

initializeDatabase()

const app = express()

//Middleware
app.use(corsConfig)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(routes())

//Error handling middleware must be the last
app.use(errorHandler)

module.exports = app

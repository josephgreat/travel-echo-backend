const path = require('path')
const env = require('./env')
const swaggerAutogen = require('swagger-autogen')()

const doc = {
  info: {
    version: '1.0.0',
    title: 'Travel Echo REST API'
  },
  host: env.get('BASE_URL', 'localhost:5000'),
  basePath: '/',
  schemes: ['http', 'https']
}

const outputFile = path.resolve('docs/swagger-doc.json')
const routes = ['../app.js']

swaggerAutogen(outputFile, routes, doc)
//.then(() => require('../server'))

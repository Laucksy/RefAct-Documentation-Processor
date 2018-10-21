import mongoose from 'mongoose'
import express from 'express'
import q from 'q'
import http from 'http'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import routes from './routes'
import cfg from './config'
import {
  log
} from './helpers'

mongoose.Promise = q.Promise
mongoose.connect(`mongodb://${cfg.mongo.url}/${cfg.mongo.db}`, {useMongoClient: true})

const app = express()

let server = http.createServer(app)

app.use(morgan('dev'))
app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({extended: true}))

// Add routes
const { index } = routes
app.use('/', index)
app.use(express.static('public'))

app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

app.use((err, req, res, next) => { // eslint-disable-line
  let status = err.status || 500
  res.status(status).send('Error: ' + status)
})

server.listen(cfg.server.port, () => {
  log('Connected to GoPeerAPI')
})

module.exports = app

import express from 'express'
import cfg from '../config'
import {
  sendResponse
} from '../helpers'

const index = express.Router()

index.route('/').get((req, res) => {
  sendResponse(res, {
    version: cfg.server.version,
    description: 'This is the API for the RefAct Documentation Processor.'
  })
})

export default { index }

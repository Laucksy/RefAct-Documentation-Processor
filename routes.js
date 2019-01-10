import express from 'express'
import path from 'path'
import latex from 'node-latex'
import cfg from './config'
import {
  Category,
  Task,
  Paperwork
} from './db'
import {
  generateOutputStream,
  logError,
  logger,
  readFromFile,
  sendResponse,
  writeToFile
} from './helpers'

const index = express.Router()

const wrap = fn => {
  return (req, res, next) => {
    logger(0, {method: req.originalUrl, data: req.body})
    res.set('Access-Control-Allow-Origin', '*')
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

index.route('/').get((req, res) => {
  sendResponse(res, {
    version: cfg.server.version,
    description: 'This is the API for the RefAct Documentation Processor.'
  })
})

index.route('/home').get((req, res) => {
  res.sendFile(path.join(__dirname, 'html/index.html'))
})

index.route('/data').get(wrap(async (req, res) => {
  const categories = await Category.find().exec()
  const tasks = await Task.find().exec()
  const paperwork = await Paperwork.find().exec()

  sendResponse(res, {categories, tasks, paperwork})
}))

index.route('/category').post(wrap(async (req, res) => {
  const data = req.body

  Category.findOneAndUpdate({title: data.title}, {$set: data}, {upsert: true, new: true}).exec().then(category => {
    sendResponse(res, category)
  })
})).options(wrap(async (req, res) => {
  res.set('Access-Control-Allow-Methods', 'POST')
  res.set('Access-Control-Allow-Headers', 'accept, content-type')
  res.set('Access-Control-Max-Age', '1728000')
}))

index.route('/generate').get(wrap(async (req, res) => {
  // TODO: Pull information from db
  // TODO: Write information to file

  const inputFile = 'test.tex'
  const outputFile = 'output.pdf'

  const categories = await Category.find().exec()

  writeToFile(inputFile, categories)

  const pdf = latex(readFromFile(inputFile), {passes: 2})
  pdf.pipe(generateOutputStream(outputFile))

  pdf.on('error', err => logError(err))
  pdf.on('finish', () => sendResponse(res, `http://54.183.93.210:3001/${outputFile}`))
}))

export default { index }

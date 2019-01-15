import express from 'express'
import path from 'path'
import latex from 'node-latex'
import cfg from './config'
import { TIME_PERIODS } from './constants'
import {
  Category,
  Task,
  Paperwork
} from './db'
import {
  generateFullReport,
  generateOutputStream,
  generateTimeline,
  logError,
  logger,
  readFromFile,
  sendResponse,
  writeToFile
} from './helpers'

const index = express.Router()

const wrap = fn => {
  return (req, res, next) => {
    logger(0, {method: req.method + ' ' + req.originalUrl, data: req.body})
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
  const tasks = await Task.find()
                            .populate('prereqs', 'title description')
                            .populate({path: 'paperworkRequired', model: 'Paperwork', select: 'title description'})
                            .populate({path: 'paperworkReceived', model: 'Paperwork', select: 'title description'})
                            .populate('category', 'number title')
                            .exec()
  const paperwork = await Paperwork.find()
                            .populate('category', 'number title')
                            .exec()

  sendResponse(res, {categories, tasks, paperwork, TIME_PERIODS})
}))

index.route('/data/:collection').post(wrap(async (req, res) => {
  const data = req.body
  let query = data._id ? {_id: data._id} : {title: data.title}
  let Collection = req.params.collection === 'category' ? Category : (req.params.collection === 'task' ? Task : Paperwork)

  Collection.findOneAndUpdate(query, {$set: data}, {upsert: true, new: true}).exec().then(item => {
    sendResponse(res, item._doc)
  })
})).options(wrap(async (req, res) => {
  res.set('Access-Control-Allow-Methods', 'POST')
  res.set('Access-Control-Allow-Headers', 'accept, content-type')
  res.set('Access-Control-Max-Age', '1728000')
  res.sendStatus(200)
}))

index.route('/generate/:type').get(wrap(async (req, res) => {
  const type = req.params.type || 'timeline'
  const inputFile = 'test.tex'
  const outputFile = 'output.pdf'

  const categories = await Category.find().exec()
  const tasks = await Task.find()
                            .populate('prereqs', 'title description category')
                            .populate({path: 'paperworkRequired', model: 'Paperwork', select: 'title description'})
                            .populate({path: 'paperworkReceived', model: 'Paperwork', select: 'title description'})
                            .populate('category', 'number title')
                            .exec()
  const paperwork = await Paperwork.find()
                            .populate('category', 'number title')
                            .exec()

  try {
    if (type === 'report') writeToFile(inputFile, generateFullReport(categories, tasks, paperwork))
    else if (type === 'timeline') writeToFile(inputFile, generateTimeline(tasks))

    const pdf = latex(readFromFile(inputFile), {passes: 2})
    pdf.pipe(generateOutputStream(outputFile))

    pdf.on('error', err => logError(err))
    pdf.on('finish', () => sendResponse(res, `http://54.183.93.210:3001/${outputFile}`))
  } catch (e) {
    logError(e)
  }
}))

export default { index }

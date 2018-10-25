import express from 'express'
import path from 'path'
import latex from 'node-latex'
import cfg from './config'
import {
  Chapter
} from './db'
import {
  generateOutputStream,
  logError,
  readFromFile,
  sendResponse,
  writeToFile
} from './helpers'

const index = express.Router()

const wrap = fn => {
  return (req, res, next) => {
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

index.route('/generate').get(wrap(async (req, res) => {
  // TODO: Pull information from db
  // TODO: Write information to file

  const inputFile = 'test.tex'
  const outputFile = 'output.pdf'

  const chapters = await Chapter.find().exec()

  writeToFile(inputFile, chapters)

  const pdf = latex(readFromFile(inputFile), {passes: 2})
  pdf.pipe(generateOutputStream(outputFile))

  pdf.on('error', err => logError(err))
  pdf.on('finish', () => sendResponse(res, `http://54.183.93.210:3001/${outputFile}`))
}))

export default { index }

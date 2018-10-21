import express from 'express'
import fs from 'fs'
import path from 'path'
import latex from 'node-latex'
import cfg from './config'
import {
  logError,
  sendResponse
} from './helpers'

const index = express.Router()

index.route('/').get((req, res) => {
  sendResponse(res, {
    version: cfg.server.version,
    description: 'This is the API for the RefAct Documentation Processor.'
  })
})

index.routes('/home').get((req, res) => {
  res.sendFile(path.join(__dirname, 'html/index.html'))
})

index.route('/generate').get((req, res) => {
  // TODO: Pull information from db
  // TODO: Write information to file

  const input = fs.createReadStream('tex/test.tex')
  const output = fs.createWriteStream('public/output.pdf')
  const pdf = latex(input)

  pdf.pipe(output)
  pdf.on('error', err => logError(err))
  pdf.on('finish', () => sendResponse(res, {url: ''}))
})

export default { index }

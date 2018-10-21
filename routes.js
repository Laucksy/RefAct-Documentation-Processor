import express from 'express'
import path from 'path'
import latex from 'node-latex'
import cfg from './config'
import {
  generateOutputStream,
  logError,
  readFromFile,
  sendResponse,
  writeToFile
} from './helpers'

const index = express.Router()

index.route('/').get((req, res) => {
  sendResponse(res, {
    version: cfg.server.version,
    description: 'This is the API for the RefAct Documentation Processor.'
  })
})

index.route('/home').get((req, res) => {
  res.sendFile(path.join(__dirname, 'html/index.html'))
})

index.route('/generate').get((req, res) => {
  // TODO: Pull information from db
  // TODO: Write information to file

  const inputFile = 'test.tex'
  const outputFile = 'output.pdf'

  const chapters = [{
    name: 'The Resettlement Agency',
    intro: '\t There are 9 major resettlement agencies in the US, with each one having smaller, affiliate organizations that somewhat-independently conduct their own resettlement operations. The agency for the Lehigh Valley is Bethany Christian Services (BCS, which will refer directly to the Lehigh Valley office), which is an affiliate of Lutheran Immigration and Refugee Services (LIRS). Though BCS used to be rather sizable, budget cuts in recent years have reduced the organization to three paid staff, along with a network of volunteers. The three staff members are Marla Sell, the director, Mohammed Obaid, the general case worker, and Mu Kpaw, the employment case worker. The general case worker will be referenced as just the case worker, since they handle everything except for employment. The BCS office is located at the corner of 5th Street and Linden Street in Allentown, in the second floor offices of the Grace Episcopal Church. \n\t Once BCS has notified you (the sponsoring organization) of an arrival, it is up to you to determine if you should decide to spoonsor them. There may be a variety of factors involved, such as the number of people, their ages, the availability of housing, etc. BCS will provide a biodata form that gives basic information about each person in the case, including their name, date of birth, country of nationality, country of origin (which necessarily must be different than country of nationality to be considered a refugee by the UNHCR), notable medical concerns, languages spoken/literate in, education experience, and employment experience. This information is all that you get prior to their arrival, so you must do your best to prepare with it. A lot of things can be acted upon with just this, such as gathering beds/furniture, identifying a culturally appropriate meal for the night of their arrival, and searching (in-group and out) for translators, but other things, such as school enrollment and necessary medical appointments, must wait until their arrival. \n'
  }]

  writeToFile(inputFile, chapters)

  const pdf = latex(readFromFile(inputFile), {passes: 2})
  pdf.pipe(generateOutputStream(outputFile))

  pdf.on('error', err => logError(err))
  pdf.on('finish', () => sendResponse(res, `http://54.183.93.210:3001/${outputFile}`))
})

export default { index }

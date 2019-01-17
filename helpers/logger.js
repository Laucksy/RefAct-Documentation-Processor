import fs from 'fs'

/*
  Type 0: Request
  Type 1: Response
  Type 2: Debugging
  Type 3: Error
*/
export const logger = (type, payload) => {
  if (process.env.SILENT) return

  if (payload.data instanceof Object) payload.data = Object.assign({}, payload.data)
  if (payload.data && payload.data.password) payload.data.password = '*******'
  if (payload.data && payload.data.oldPass) payload.data.oldPass = '*******'
  if (payload.data && payload.data.newPass) payload.data.newPass = '*******'

  let buffer = ''
  if (type === 0 && payload && payload.method && payload.data) {
    buffer += `[REQUEST]: ${payload.method}\nData: ${JSON.stringify(payload.data, null, '\t')}\n`
  }

  if (type === 1 && payload && payload.method && (payload.message || payload.data !== undefined)) {
    buffer += `[RESPONSE]: ${payload.method}\n`
    if (payload.message) buffer += `Message: ${payload.message}\n`
    if (payload.data) buffer += `Data: ${JSON.stringify(payload.data, null, '\t')}\n`
  }

  if (type === 1 && payload && payload.method && payload.error) {
    buffer += `[RESPONSE][ERROR]: ${payload.method}\nMessage: ${payload.error}\n`
  }

  if (type === 2 && payload && payload.method && (payload.message || payload.data !== undefined)) {
    buffer += `[DEBUGGER]: ${payload.method}\n`
    if (payload.message) buffer += `Message: ${payload.message}\n`
    if (payload.data) buffer += `Data: ${JSON.stringify(payload.data, null, '\t')}\n`
  }

  if (type === 2 && payload && payload.method === null && payload.message) {
    buffer += `[DEBUGGER]: ${payload.message}\n`
  }

  if (type === 3 && payload && payload.method && payload.error) {
    buffer += `[ERROR]: ${payload.method}\nMessage: ${payload.error}\n`
  }

  if (type === 3 && payload && payload.method === null && payload.error) {
    buffer += `[ERROR]: ${payload.error}\n`
  }

  if (buffer !== '') {
    console.log(`\n\n${buffer}`) // eslint-disable-line

    let d = new Date()
    fs.appendFile(`${__dirname}/../api_logs/${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}.txt`, `\n\n${d.toISOString()} -\n${buffer}`, err => {
      if (err) console.log(`[FILE WRITE ERROR]: ${err}`) // eslint-disable-line
    })
  }
}

export const log = (message, method = null) => {
  logger(2, {method: method, message: message})
}

export const logError = (err, method = null) => {
  logger(3, {method: method, error: typeof err === 'string' ? err : err.stack})
}

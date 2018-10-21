import {
  logger
} from '../helpers'

const condenseArrays = true

export const sendResponse = (res, data, status = 200) => {
  let result
  if (condenseArrays) {
    if (data instanceof Array) result = data.length
    else if (typeof data === 'object') {
      result = {}
      Object.keys(data).forEach(key => {
        if (data[key] instanceof Array && data[key].length > 3) result[key] = `${data[key].length} items(s)`
        else result[key] = data[key]
      })
    } else result = data
  }
  logger(1, {method: res.req.originalUrl, data: result})
  res.status(status).send(data)
}

export const sendError = (res, error, message = null) => {
  sendResponse(res, error.description + (message ? ' - ' + message : ''), error.code)
}

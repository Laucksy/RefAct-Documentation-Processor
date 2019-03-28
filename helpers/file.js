import fs from 'fs'

export const writeToFile = (file, data) => {
  fs.writeFileSync(`public/${file}`, data)
}

export const readFromFile = (inputFile) => {
  return fs.readFileSync(`public/${inputFile}`, 'utf-8')
}

export const generateOutputStream = (outputFile) => {
  return fs.createWriteStream(`public/${outputFile}`)
}

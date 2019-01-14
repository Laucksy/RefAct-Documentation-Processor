import fs from 'fs'

export const writeToFile = (file, data) => {
  fs.writeFileSync(`tex/${file}`, data)
}

export const readFromFile = (inputFile) => {
  return fs.readFileSync(`tex/${inputFile}`, 'utf-8')
}

export const generateOutputStream = (outputFile) => {
  return fs.createWriteStream(`public/${outputFile}`)
}

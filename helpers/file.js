import fs from 'fs'
import {
  generateHeader,
  generateFooter
} from './generator'

export const writeToFile = (file, chapters) => {
  let result = ''

  result += generateHeader() + '\n'

  chapters.sort((a, b) => a.number - b.number).forEach(chapter => {
    result += `\\chapter{${chapter.name}}\n`
    result += chapter.intro.replace(/\t/g, '\\tab').replace(/\n/g, '\\\\\n')
    result += '\n'
  })

  result += generateFooter()

  fs.writeFileSync(`tex/${file}`, result)
}

export const readFromFile = (inputFile) => {
  return fs.readFileSync(`tex/${inputFile}`, 'utf-8')
}

export const generateOutputStream = (outputFile) => {
  return fs.createWriteStream(`public/${outputFile}`)
}

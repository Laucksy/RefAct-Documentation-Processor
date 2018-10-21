import fs from 'fs'
import {
  generateHeader,
  generateFooter
} from './generator'

export const writeToFile = (file, chapters) => {
  let result = ''

  result += generateHeader() + '\n'

  chapters.forEach(chapter => {
    result += `\\chapter{${chapter.name}}\n`
    result += chapter.intro.replace(/\t/g, '\\tab').replace(/\n/g, '\\\\\n')
    result += '\n'
  })

  result += generateFooter()

  fs.writeFileSync(`tex/${file}`, result)
}

export const generateInputStream = (inputFile) => {
  return fs.createReadStream(`tex/${inputFile}`)
}

export const generateOutputStream = (outputFile) => {
  return fs.createWriteStream(`public/${outputFile}`)
}

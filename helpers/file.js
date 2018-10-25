import fs from 'fs'
import {
  generateHeader,
  generateFooter
} from './generator'

export const writeToFile = (file, chapters) => {
  let result = ''

  result += generateHeader() + '\n'

  chapters.sort((a, b) => a.number - b.number).forEach(chapter => {
    result += `\\chapter{${chapter.title}}\n`
    result += formatText(chapter.intro)
    chapter.sections.forEach(section => {
      result += `\\section{${section.title}}\n`
      result += formatText(section.description)
    })
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

export const formatText = (str) => {
  let output = str.replace(/\t/g, '\\tab').replace(/\n/g, '\\\\\n')

  if (output.indexOf('LIST[[') >= 0) {
    let index = output.indexOf('LIST[[')
    let front = output.substring(0, index)
    let back = output.substring(output.indexOf(']]', index) + 1)

    index += 5
    let list = '\\begin{enumerate}\n\\itemsep0em\n\\setlength{\\itemindent}{2em}\n'
    while (output.indexOf('[', index) > 0) {
      list = list + '\\item ' + output.substring(output.indexOf('[', index) + 1, output.indexOf(']', index)) + '\n'
      index = output.indexOf(']', index) + 1
    }
    list = list + '\\end{enumerate}\n'

    output = front + list + back
  }

  return output
}

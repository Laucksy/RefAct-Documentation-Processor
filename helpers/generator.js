import { REPORT_HEADER, FOOTER } from '../constants'

export const generateFullReport = (categories, tasks, paperwork) => {
  let result = ''

  result += REPORT_HEADER + '\n'

  categories.sort((a, b) => a.number - b.number).forEach(category => {
    result += `\\chapter{${category.title}}\n`
    result += formatText(category.intro)

    let tasksForCategory = tasks.filter(t => t.category === category._id)
    let paperworkForCategory = paperwork.filter(p => p.category === category._id)

    result += '\\section{Tasks}\n'
    tasksForCategory.forEach(task => {
      result += `\\subsection{${task.title}}\n`
      result += formatText(task.description)
    })

    result += '\\section{Paperwork}\n'
    paperworkForCategory.forEach(paperwork => {
      result += `\\subsection{${paperwork.title}}\n`
      result += formatText(paperwork.description)
    })

    result += '\n'
  })

  result += FOOTER
  return result
}

export const formatText = (str) => {
  let output = str.replace(/<tab>/g, '\\tab').replace(/\n/g, '\\\\\n')

  if (output.indexOf('LIST[[') >= 0) {
    let index = output.indexOf('LIST[[')
    let front = output.substring(0, index)
    let back = output.substring(output.indexOf(']]', index) + 2)

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

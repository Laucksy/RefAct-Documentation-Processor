import { REPORT_HEADER, FOOTER, TIME_PERIODS } from '../constants'

export const generateFullReport = (categories, tasks, paperwork) => {
  let result = ''

  result += REPORT_HEADER + '\n'

  categories.sort((a, b) => a.number - b.number).forEach(category => {
    result += `\\chapter{${category.title}}\n`
    result += formatText(category.intro)

    let tasksForCategory = tasks.filter(t => t.category._id.toString() === category._id.toString())
    let paperworkForCategory = paperwork.filter(p => p.category._id.toString() === category._id.toString())

    result += '\\section{Tasks}\n'
    TIME_PERIODS.forEach(period => {
      let tasksForTimePeriod = tasksForCategory.filter(t => t.timeline === period)
      if (tasksForTimePeriod.length > 0) result += `\\subsection{${period}}\n`
      tasksForTimePeriod.forEach(task => {
        result += `\\paragraph{${task.title + (task.required ? '' : ' (Optional)')}}\n`
        result += formatText(task.description + '\n') + '\n'
        result += 'Pre-Requisites:' + (task.prereqs.length ? task.prereqs.map(p => ` ${p.title} (${categories.find(c => c._id.toString() === p.category.toString()).title})`) : ' None')
        result += formatText('\n')
      })
    })

    result += '\\section{Paperwork}\n'
    paperworkForCategory.forEach(paperwork => {
      result += `\\paragraph{${paperwork.title}}\n`
      result += formatText(paperwork.description + '\n') + '\n'
    })

    result += '\n'
  })

  result += FOOTER
  return result
}

export const formatText = (str) => {
  let output = str.replace(/<tab>/g, '\\tab ').replace(/\n/g, '\\\\\n')

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

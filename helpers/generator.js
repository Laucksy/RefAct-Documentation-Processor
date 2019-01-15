import { REPORT_HEADER, REPORT_FOOTER, TIMELINE_HEADER, TIMELINE_FOOTER, TIME_PERIODS } from '../constants'

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

        result += formatText('<tab>') + 'Pre-Requisites:' + (task.prereqs.length
          ? task.prereqs.map(p => ` ${p.title} (${categories.find(c => c._id.toString() === p.category.toString()).title})`)
          : ' None')
        result += formatText('\n')

        result += formatText('<tab>') + 'Paperwork Required:' + (task.paperworkRequired.length
          ? task.paperworkRequired.map(p => ` ${p.title} (${categories.find(c => c._id.toString() === p.category.toString()).title})`)
          : ' None')
        result += formatText('\n')

        result += formatText('<tab>') + 'Paperwork Received:' + (task.paperworkReceived.length
          ? task.paperworkReceived.map(p => ` ${p.title} (${categories.find(c => c._id.toString() === p.category.toString()).title})`)
          : ' None')
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

  result += REPORT_FOOTER
  return result
}

export const generateTimeline = (categories, tasks, paperwork) => {
  let result = ''

  result += TIMELINE_HEADER + '\n'

  /*
      % Place nodes
      \node [block] (init) {initialize model};
      \node [cloud, left of=init] (expert) {expert};
      \node [cloud, right of=init] (system) {system};
      \node [block, below of=init] (identify) {identify candidate models};
      \node [block, below of=identify] (evaluate) {evaluate candidate models};
      \node [block, left of=evaluate, node distance=3cm] (update) {update model};
      \node [decision, below of=evaluate] (decide) {is best candidate better?};
      \node [block, below of=decide, node distance=3cm] (stop) {stop};
      % Draw edges
      \path [line] (init) -- (identify);
      \path [line] (identify) -- (evaluate);
      \path [line] (evaluate) -- (decide);
      \path [line] (decide) -| node [near start] {yes} (update);
      \path [line] (update) |- (identify);
      \path [line] (decide) -- node {no}(stop);
      \path [line,dashed] (expert) -- (init);
      \path [line,dashed] (system) -- (init);
      \path [line,dashed] (system) |- (evaluate);
   */

  let queue = tasks.map(t => t)
  let done = []
  while (queue.length > 0) {
    let ready = queue.filter(t => t.prereqs.filter(p => queue.map(q => q.title).indexOf(p.title) >= 0).length === 0)

    let head = ready.shift()
    result += `\\node [block${done.length === 0 ? '' : ', below of=' + done[done.length - 1]._id.toString()}] (${head._id.toString()}) {${head.title}};\n`
    head.prereqs.forEach(p => {
      result += `\\path [line] (${p._id.toString()}) -- (${head._id.toString()});\n`
    })

    let prev = head._id.toString()
    ready.forEach(r => {
      result += `\\node [block, right of=${prev}] (${r._id.toString()}) {${r.title}};\n`
      r.prereqs.forEach(p => {
        result += `\\path [line] (${p._id.toString()}) -- (${r._id.toString()});\n`
      })
      prev = r._id.toString()
    })

    done.push(head)
    done = done.concat(ready)
    queue = queue.filter(q => q._id.toString() !== head._id.toString() && !ready.some(r => r._id.toString() === q._id.toString()))
  }

  result += TIMELINE_FOOTER
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

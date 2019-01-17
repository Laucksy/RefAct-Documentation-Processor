import { REPORT_HEADER, REPORT_FOOTER, TIMELINE_HEADER, TIMELINE_FOOTER, TIME_PERIODS } from '../constants'

const TIMELINE_ORIENTATION = 'landscape'

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

export const generateTimeline = (tasks) => {
  let result = ''

  result += TIMELINE_HEADER + '\n'

  TIME_PERIODS.forEach(period => {
    let relevantTasks = tasks.filter(t => t.timeline === period || t.prereqs.some(p => tasks.find(a => a.title === p.title).timeline === period))

    result += generatePartialTimeline(relevantTasks)
    result += '\n\\newpage\n'
  })

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

const generatePartialTimeline = (tasks) => {
  let result = ''
  let queue = tasks.map(t => t)
  let layers = []
  while (queue.length > 0) {
    let ready = queue.filter(t => t.prereqs.filter(p => queue.map(q => q.title).indexOf(p.title) >= 0).length === 0)
    layers.push(ready)
    queue = queue.filter(q => !ready.some(r => r._id.toString() === q._id.toString()))
  }

  layers.forEach((layer, index) => {
    let left = layer.slice(0, Math.floor(layer.length / 2))
    let right = layer.slice(Math.floor((layer.length + 1) / 2))
    let middle = getMiddleOfLayer(layer)

    let middleID = middle ? middle._id.toString() : `coordinate-${index}`
    let middleAboveID = index > 0 && getMiddleOfLayer(layers[index - 1]) ? getMiddleOfLayer(layers[index - 1])._id.toString() : `coordinate-${index - 1}`

    let nextLayerDirec = (TIMELINE_ORIENTATION === 'portrait' ? 'below' : 'right')
    if (middle) {
      result += `\\node [block${index === 0 ? '' : ', ' + nextLayerDirec + '=1cm of ' + middleAboveID}] (${middleID}) {${taskToNode(middle)}};\n`
      result += addEdges(middle)
    } else result += `\\coordinate[${index === 0 ? '' : ', ' + nextLayerDirec + '=1cm of ' + middleAboveID}] (${middleID});\n`

    result += addToSide(middleID, left, 'left')
    result += addToSide(middleID, right, 'right')
  })
  return result
}

const getMiddleOfLayer = (layer) => layer.length % 2 === 1 ? layer[(layer.length - 1) / 2] : undefined

const addToSide = (middleID, arr, side) => {
  let result = ''
  let prev = middleID
  if (TIMELINE_ORIENTATION !== 'portrait' && side === 'left') side = 'above'
  else if (TIMELINE_ORIENTATION !== 'portrait') side = 'below'

  while (arr.length > 0) {
    let cur = side === 'left' || side === 'above' ? arr.pop() : arr.shift()

    result += `\\node [block, ${side}=1cm of ${prev}] (${cur._id.toString()}) {${taskToNode(cur)}};\n`
    result += addEdges(cur)
    prev = cur._id.toString()
  }
  return result
}

const addEdges = (node) => {
  let result = ''
  let firstSide = TIMELINE_ORIENTATION === 'portrait' ? 'south' : 'east'
  let secondSide = TIMELINE_ORIENTATION === 'portrait' ? 'north' : 'west'
  node.prereqs.forEach(p => {
    result += `\\draw [line] (${p._id.toString()}.${firstSide}) -- (${node._id.toString()}.${secondSide});\n`
  })
  return result
}

const taskToNode = (task) => {
  return formatText(task.title +
    '\nPaperwork Required:' + task.paperworkRequired.map(p => ' ' + p.title) +
    '\nPaperwork Received:' + task.paperworkReceived.map(p => ' ' + p.title))
}

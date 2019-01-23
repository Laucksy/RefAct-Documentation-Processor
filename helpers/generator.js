import {
  LIST_END,
  LIST_START,
  REPORT_HEADER,
  REPORT_FOOTER,
  TIMELINE_HEADER,
  TIMELINE_FOOTER,
  TIME_PERIODS
} from '../constants'

const TIMELINE_ORIENTATION = 'landscape'

export const generateFullReport = (categories, tasks, paperwork) => {
  let result = ''

  result += REPORT_HEADER + '\n'

  categories.sort((a, b) => a.number - b.number).forEach(category => {
    result += `\\chapter{${category.title}}\n`
    result += '\t' + formatText(category.intro, '\t') + '\n'

    let tasksForCategory = tasks.filter(t => t.category._id.toString() === category._id.toString())
    let paperworkForCategory = paperwork.filter(p => p.category._id.toString() === category._id.toString())

    result += '\t\\section{Tasks}\n'
    TIME_PERIODS.forEach(period => {
      let tasksForTimePeriod = tasksForCategory.filter(t => t.timeline === period)
      if (tasksForTimePeriod.length > 0) result += `\t\t\\subsection{${period}}\n`
      tasksForTimePeriod.forEach(task => {
        result += `\t\t\t\\paragraph{${formatText(task.title) + (task.required ? '' : ' (Optional)')}}\n`
        result += '\t\t\t' + formatText(task.description + '\n', '\t\t\t') + '\n'

        result += '\t\t\t' + formatText('<tab>') + 'Pre-Requisites:' + (task.prereqs.length
          ? task.prereqs.map(p => ` ${formatText(p.title)} (${categories.find(c => c._id.toString() === p.category.toString()).title})`)
          : ' None')
        result += formatText('\n')

        result += '\t\t\t' + formatText('<tab>') + 'Paperwork Required:' + (task.paperworkRequired.length
          ? task.paperworkRequired.map(p => ` ${formatText(p.title)} (${categories.find(c => c._id.toString() === p.category.toString()).title})`)
          : ' None')
        result += formatText('\n')

        result += '\t\t\t' + formatText('<tab>') + 'Paperwork Received:' + (task.paperworkReceived.length
          ? task.paperworkReceived.map(p => ` ${formatText(p.title)} (${categories.find(c => c._id.toString() === p.category.toString()).title})`)
          : ' None')
        result += formatText('\n')
      })
    })

    result += '\t\\section{Paperwork}\n'
    paperworkForCategory.forEach(paperwork => {
      result += `\t\t\\paragraph{${formatText(paperwork.title)}}\n`
      result += '\t\t' + formatText(paperwork.description + '\n', '\t\t') + '\n'
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
    let relevantTasks = tasks.filter(t => t.timeline === period)
    relevantTasks = relevantTasks.concat(tasks.filter(t => {
      return t.timeline !== period && relevantTasks.some(a => {
        return a.prereqs.map(p => p._id.toString()).indexOf(t._id.toString()) >= 0
      })
    }))

    if (relevantTasks.length > 0) {
      result += `\\section*{${period}}\n`
      result += '\\begin{tikzpicture}[node distance = 2cm, auto]\n'
      result += generatePartialTimeline(relevantTasks, period)
      result += '\\end{tikzpicture}\n'
      result += '\n\\newpage\n'
    }
  })

  result += TIMELINE_FOOTER
  return result
}

export const formatText = (str, tabs = '') => {
  let output = str.replace(/<tab>/g, '\\tab ').replace(/\n/g, '\\\\\n').replace(/&/g, '\\&').replace(/\$/g, '\\$')

  if (output.indexOf('LIST') >= 0) {
    let startIndex = output.indexOf('LIST')
    let endIndex = output.indexOf('ENDLIST', startIndex) + 9

    let front = output.substring(0, startIndex).replace(/\n/g, '\n' + tabs)
    let middle = output.substring(startIndex, endIndex)
    let back = output.substring(endIndex).replace(/\n/g, '\n' + tabs)

    let list = ''
    let depth = 0
    middle.split('\n').slice(1, -1).forEach(line => {
      let extraTabs = getExtraTabs(line)
      let newDepth = extraTabs.length

      if (newDepth > depth) list = list + LIST_START(tabs + (depth === 0 ? '' : extraTabs))
      else if (newDepth < depth) list = list + LIST_END(tabs + extraTabs)

      if (newDepth > 0) list = list + tabs + extraTabs + '\\item ' + line.substring(newDepth, line.length - 2) + '\n'
      depth = newDepth
    })
    list = list + LIST_END(tabs + '\t')

    output = front.substring(0, front.length - tabs.length) + list + back
  } else if (tabs) output = output.replace(/\n/g, '\n' + tabs)

  return output
}

const getExtraTabs = (line) => {
  if (line.substring(0, 5) === '-----') return '\t\t\t\t\t'
  else if (line.substring(0, 4) === '----') return '\t\t\t\t'
  else if (line.substring(0, 3) === '---') return '\t\t\t'
  else if (line.substring(0, 2) === '--') return '\t\t'
  else if (line.substring(0, 1) === '-') return '\t'
  else return ''
}

const generatePartialTimeline = (tasks, period) => {
  let result = ''

  tasks = tasks.map(t => {
    return {...t, prereqs: t.prereqs.filter(p => tasks.some(a => a.title === p.title))}
  })

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
      result += addNode(middle, middleAboveID, index === 0 ? null : nextLayerDirec, period)
      result += addEdges(middle)
    } else result += `\\coordinate[${index === 0 ? '' : ', ' + nextLayerDirec + '=3cm of ' + middleAboveID}] (${middleID});\n`

    result += addToSide(middleID, left, 'left', period)
    result += addToSide(middleID, right, 'right', period)
  })
  return result
}

const getMiddleOfLayer = (layer) => layer.length % 2 === 1 ? layer[(layer.length - 1) / 2] : undefined

const addToSide = (middleID, arr, side, period) => {
  let result = ''
  let prev = middleID
  if (TIMELINE_ORIENTATION !== 'portrait' && side === 'left') side = 'above'
  else if (TIMELINE_ORIENTATION !== 'portrait') side = 'below'

  while (arr.length > 0) {
    let cur = side === 'left' || side === 'above' ? arr.pop() : arr.shift()

    result += addNode(cur, prev, side, period)
    result += addEdges(cur)
    prev = cur._id.toString()
  }
  return result
}

const addNode = (task, prev, direction, period) => {
  let color
  if (task.timeline !== period) color = '{rgb:black,1;white,2}'
  else if (!task.required) color = '{rgb:yellow,1;white,2}'

  return `\\node [block${direction ? ', ' + direction + '=1cm of ' + prev : ''}${color ? ', fill=' + color : ''}] (${task._id.toString()}) {${taskToNode(task)}};\n`
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
  let result = task.title
  if (task.paperworkRequired.length > 0) result += '\nPaperwork Required:' + task.paperworkRequired.map(p => ' ' + p.title)
  if (task.paperworkReceived.length > 0) result += '\nPaperwork Received:' + task.paperworkReceived.map(p => ' ' + p.title)

  return formatText(result)
}

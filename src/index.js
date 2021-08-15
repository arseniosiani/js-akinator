const Confirm = require('prompt-confirm')
const prompt = require('prompt')

const Question = function (q) {
  this.q = q
  this.match = function (row) {
    return row[this.q] === true
  }
}

const Leaf = function (rows) {
  this.rows = classCount(rows)
}

const Node = function (question, true_branch, false_branch) {
  this.question = question
  this.true_branch = true_branch
  this.false_branch = false_branch
}

const classCount = rows => {
  const counts = {}
  for (const row of rows) {
    const label = row.label
    if (!counts[label]) counts[label] = 0
    counts[label]++
  }
  return counts
}

const gini = rows => {
  const classes = classCount(rows)
  const num_rows = rows.length
  let impurity = 1
  for (const row of rows) {
    const prob = classes[row.label] / num_rows
    impurity -= prob ** 2
  }
  return impurity
}

const infoGain = (left, right, current_uncertainty) => {
  const p = left.length / (left.length + right.length)
  return current_uncertainty - p * gini(left) - (1 - p) * gini(right)
}

const getFeatures = rows => {
  let all = []
  for (const row of rows) {
    const tmp = { ...row }
    delete tmp.label
    all = all.concat(Object.keys(row))
  }
  return [...new Set(all)]
}

const findBestSplit = rows => {
  let best_gain = 0
  let best_question = null
  const current_uncertainty = gini(rows)
  const features = getFeatures(rows)

  for (const feature of features) {
    const values = [...new Set(rows.map(r => r[feature]))] // unique values in the column
    for (const value of values) {
      const question = new Question(feature)
      const { true_rows, false_rows } = partition(rows, question)
      if (!true_rows.length && !false_rows.length) {
        continue
      }
      const gain = infoGain(true_rows, false_rows, current_uncertainty)
      if (gain >= best_gain) {
        best_gain = gain
        best_question = question
      }
    }
  }

  return { best_gain, best_question }
}

const partition = (rows, question) => {
  const true_rows = []
  const false_rows = []
  for (const row of rows) {
    if (question.match(row)) {
      true_rows.push(row)
    } else {
      false_rows.push(row)
    }
  }
  return { true_rows, false_rows }
}

const buildTree = rows => {
  const { best_gain, best_question } = findBestSplit(rows)
  if (best_gain === 0) {
    return new Leaf(rows)
  }
  const { true_rows, false_rows } = partition(rows, best_question)
  const true_branch = buildTree(true_rows)
  const false_branch = buildTree(false_rows)

  return new Node(best_question, true_branch, false_branch)
}

const data = [
  { 'giallo fuori': true, grande: true, 'rosso fuori': false, label: 'banana' },
  { 'giallo fuori': false, grande: false, 'rosso fuori': false, label: 'kiwi' },

  { 'giallo fuori': false, grande: false, 'rosso fuori': true, label: 'fagola' },
  { 'giallo fuori': false, grande: true, 'rosso fuori': false, label: 'anguria' },
  { 'giallo fuori': true, grande: true, 'rosso fuori': false, label: 'limone' }
]

const start = async node => {
  if (!node.question) {
    console.log(node)
    const response = await new Confirm('mi dici di più?').run()
    if (!response) return
    prompt.start()
    const { new_feature } = await prompt.get(['new_feature'])
    console.log(new_feature)
    return
  }

  const response = await new Confirm(node.question.q + '?').run()
  if (response) {
    await start(node.true_branch)
  } else {
    await start(node.false_branch)
  }
}

const tree = buildTree(data)
start(tree)
// // console.log(findBestSplit(data))

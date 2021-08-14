// const { DecisionTreeClassifier } = require('ml-cart')
const DecisionTreeClassifier = require('./ml/DecisionTreeClassifier')
const irisDataset = require('ml-dataset-iris')

const data = [
  { 'è giallo fuori': 0, 'è grande': 0, 'è rosso fuori': 1, class: 'fagola' },
  { 'è giallo fuori': 0, 'è grande': 1, 'è rosso fuori': 0, class: 'anguria' },
  { 'è giallo fuori': 1, 'è grande': 0, 'è rosso fuori': 0, class: 'limone' }
]

const fruits = [...new Set(data.map(d => d.class))]

const classifier = new DecisionTreeClassifier()
const predictions = data.map(d => fruits.indexOf(d.class))
const answers = data.map(d => {
  const el = { ...d }
  delete el.class
  return Object.values(el)
})

console.log(fruits)
console.log(answers)
console.log(predictions)

classifier.train(answers, predictions)

const result = classifier.predict([[0, 1, 0]])
console.log(result)

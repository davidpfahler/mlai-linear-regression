#!/usr/bin/env node
const fs = require('fs')
const http = require('http')
const readline = require('readline')

// Download dataset if it is not yet present locally.
const filename = 'dataset.csv'
const url = 'http://www.math.muni.cz/~kolacek/docs/frvs/M7222/data/AutoInsurSweden.txt'
if (!fs.existsSync(filename)) {
  let linenumber = 0
  const file = fs.createWriteStream(filename)
  http.get(url, res => readline.createInterface({
    input: res,
    crlfDelay: Infinity
  }).on('line', line => {
    // read downloading file line-by-line, skipping the first 11
    linenumber++
    if (linenumber < 12) return
    // replace European style comma with dot notation
    let [x, y] = line.split('\t').map(i => i.replace(',', '.'))
    file.write(`${x};${y}\n`)
  }).on('end', () => file.end()))
}

const sum = values => values.reduce((value, sum = 0) => sum + value)

const mean = values => sum(values) / values.length

const variance = (values, mean) => sum(values.map(x => Math.pow((x - mean), 2)))

const covariance = (x, mean_x, y, mean_y) => sum(x.map((_, i) => (x[i] - mean_x) * (y[i] - mean_y)))

const coefficients = dataset => {
  const x = dataset.map(row => row[0])
  const y = dataset.map(row => row[1])
  const [mean_x, mean_y] = [mean(x), mean(y)]
  // coefficients m and t are also often referred to as B1 and B0
  const m = covariance(x, mean_x, y, mean_y) / variance(x, mean_x)
  const t = mean_y - m * mean_x
  return [t, m]
}

const simple_linear_regression = (train, test) => {
  const [t, m] = coefficients(train)
  return test.map(row => m * row[0] + t)
}

const rmse = (actual, predicted) => {
  let sum_error = 0
  for (let i=0; i < actual.length; i++) {
    const prediction_error = predicted[i] - actual[i]
    sum_error += Math.pow(prediction_error, 2)
  }
  return Math.sqrt(sum_error / actual.length)
}

const evaluate_algorithm = (dataset, algorithm) => {
  const test_set = dataset.map(row => [row[0]])
  const predicted = algorithm(dataset, test_set)
  const actual = dataset.map(row => row[1])
  console.log(predicted)
  return rmse(actual, predicted)
}

const dataset = [[1, 1], [2, 3], [4, 3], [3, 2], [5, 5]]
const rmserr = evaluate_algorithm(dataset, simple_linear_regression)
console.log(`RMSE: ${rmserr}`)

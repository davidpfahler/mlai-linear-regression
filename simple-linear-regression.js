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

const dataset = [[1, 1], [2, 3], [4, 3], [3, 2], [5, 5]]
const x = dataset.map(row => row[0])
const y = dataset.map(row => row[1])
const [mean_x, mean_y] = [mean(x), mean(y)]
const [var_x, var_y] = [variance(x, mean_x), variance(y, mean_y)]
const covar = covariance(x, mean_x, y, mean_y)
console.log(`x stats: mean=${mean_x} variance=${var_x}`)
console.log(`y stats: mean=${mean_y} variance=${var_y}`)
console.log(`Covariance: ${covar}`)

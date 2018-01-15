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

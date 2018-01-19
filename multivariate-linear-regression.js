// Multivariate linear regression with stochastic gradient descent
const fs = require('fs')
const http = require('http')
const readline = require('readline')

function download_dataset (url, filename) {
  const file = fs.createWriteStream(filename)
  return new Promise((resolve) => {
    http.get(url, res => res.pipe(file))
    file.on('end', resolve)
  })
}

async function load_dataset (filename) {
  // Download dataset if not locally present.
  if (!fs.existsSync(filename)) {
    const url = 'http://archive.ics.uci.edu/ml/machine-learning-databases/wine-quality/winequality-white.csv'
    await download_dataset(url, filename)
  }

  const file = fs.readFileSync(filename, 'utf8')
  return file.split('\n').slice(1).map(row => {
    return row.split(';').map(parseFloat)
  })
}

async function main () {
  const dataset_file = 'winequality-white.csv'
  const dataset = await load_dataset(dataset_file)
}

main()

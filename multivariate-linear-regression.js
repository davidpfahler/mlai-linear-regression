// Multivariate linear regression with stochastic gradient descent
const fs = require('fs')
const http = require('http')
const readline = require('readline')

const sum = values => values.reduce((value, sum = 0) => sum + value)

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
  return file.split('\n').slice(1)
    .filter(row => row !== '')
    .map(row => {
      return row.split(';').map(parseFloat)
    })
}

// Find min and max values for each column
function dataset_minmax (dataset) {
  const minmax = []
  for (i in dataset[0]) {
    const col_values = dataset.map(row => row[i])
    const value_min = Math.min(...col_values)
    const value_max = Math.max(...col_values)
    minmax.push([value_min, value_max])
  }
  return minmax
}

// Rescale dataset columns to the range of 0-1
function normalize_dataset (dataset, minmax) {
  return dataset.map(row => row.map((_, i) => {
    return (row[i] - minmax[i][0]) / (minmax[i][1] - minmax[i][0])
  }))
}

// Split a dataset into n folds
function cross_validation_split (dataset, n_folds) {
  const dataset_split = []
  const dataset_copy = [...dataset]
  const foldsize = Math.floor(dataset.length / n_folds)
  for (let i = 0; i < n_folds; i++) {
    // console.log(`Creating fold number ${i + 1}.`)
    const fold = []

    while (fold.length < foldsize) {
      const index = Math.floor(Math.random() * (dataset_copy.length - 1))
      fold.push(dataset_copy[index])
      dataset_copy.pop(index)
    }
    dataset_split.push(fold)
  }
  return dataset_split
}

// Calculate root mean squared error
function rmse_metric (actual, predicted) {
  let sum_error = 0
  for (let i = 0; i < actual.length; i++) {
    const prediction_error = predicted[i] - actual[i]
    sum_error += Math.pow(prediction_error, 2)
  }
  const mean_error = sum_error / actual.length
  return Math.sqrt(mean_error)
}

// Evaluate an algorithm using a cross validation split
function evaluate_algorithm (dataset, algorithm, n_folds, ...args) {
  // console.log('Evaluating algorithm.')

  const folds = cross_validation_split(dataset, n_folds)
  // console.log('Folding complete.')

  return folds.map((fold, i) => {
    // console.log(`\nUsing fold number ${i + 1} as test set.`)
    const train = folds
      .filter(f => f !== fold)
      .reduce((f, set) => [...set, ...f], [])
    const test = fold.map(row => [...row.slice(0, row.length - 1), undefined])

    const predicted = algorithm(train, test, ...args)
    const actual = fold.map(row => row[row.length - 1])

    const rmse = rmse_metric(actual, predicted)
    console.log(`RMSE for fold ${i+1} as test set is ${rmse}`)
    return rmse
  })
}

// Make a prediction with coefficients
function predict (row, coefficients) {
  let yhat = coefficients[0]
  for (let i = 0; i < row.length - 1; i++) {
    yhat += coefficients[i + 1] * row[i]
  }
  return yhat
}

// Estimate linear regression coefficients using stochastic gradient descent
function coefficients_sgd (train, l_rate, n_epoch) {
  // console.log(`Estimating coefficients using stochastic gradient descent.`)

  const coefficients = train[0].map(() => 0)
  // console.log(`Initialized coefficients with all zeros.`)

  for (let epoch = 0; epoch < n_epoch; epoch++) {
    // console.log(`Training epoch ${epoch + 1}:\n`)

    for (let row of train) {
      const yhat = predict(row, coefficients)
      // console.log(`Coefficients:`, coefficients)

      const error = yhat - row[row.length - 1]
      // console.log(`Error: ${error}`)

      coefficients[0] = coefficients[0] - l_rate * error
      for (let i = 0; i < row.length - 1; i++) {
        coefficients[i + 1] = coefficients[i + 1] - l_rate * error * row[i]
      }
    }
  }
  // console.log(`Estimated coefficients:`, coefficients)
  return coefficients
}

// Linear Regression Algorithm With Stochastic Gradient Descent
function linear_regression_sgd (train, test, l_rate, n_epoch) {
  const coefficients = coefficients_sgd(train, l_rate, n_epoch)
  return test.map(row => predict(row, coefficients))
}

async function main () {
  const dataset_file = 'winequality-white.csv'
  let dataset = await load_dataset(dataset_file)

  // normalize
  const minmax = dataset_minmax(dataset)
  dataset = normalize_dataset(dataset, minmax)

  // evaluate algorithm
  const n_folds = 5
  const l_rate = 0.01
  const n_epoch = 50
  const scores = evaluate_algorithm(dataset, linear_regression_sgd, n_folds, l_rate, n_epoch)

  console.log(`\nScores ${scores}`)
  console.log(`Mean RMSE ${sum(scores) / scores.length}`)
}

main()

# Multivariate linear regression with stochastic gradient descent ported from JavaScript to Python
import math
import urllib
import os.path
from random import seed
from random import randrange

def load_dataset (filename):
  # Download dataset if not locally present.
  if not os.path.isfile(filename):
    url = 'http://archive.ics.uci.edu/ml/machine-learning-databases/wine-quality/winequality-white.csv'
    urllib.urlretrieve(url, filename)

  file = open(filename)
  return to_dataset(file)

def to_values (line):
  values = line.strip('\n').split(';')
  return [float(x) for x in values]

def to_dataset (file):
  values = list()
  for linenumber, line in enumerate(file):
    if linenumber < 1: continue
    values.append(to_values(line))
  return values

# Find min and max values for each column
def minmax (dataset):
  minmax = list()
  for i in range(len(dataset[0])):
    col_values = [row[i] for row in dataset]
    value_min = min(col_values)
    value_max = max(col_values)
    minmax.append([value_min, value_max])
  return minmax

# Rescale dataset columns to the range of 0-1
def normalize (dataset, minmax):
  normalized = list()
  for row in dataset:
    row_copy = list()
    for i in range(len(row)):
      # delta column value to the minimum value for this column
      delta_col_min = row[i] - minmax[i][0]
      # detla maximum to minimum for this column
      delta_max_min = minmax[i][1] - minmax[i][0]
      row_copy.append(delta_col_min / delta_max_min)
    normalized.append(row_copy)
  return normalized

# Split dataset into n folds
def split (dataset, n_folds):
  split = list()
  copy = list(dataset)
  foldsize = math.floor(len(dataset) / n_folds)
  for i in range(n_folds):
    fold = list()
    while len(fold) < foldsize:
      index = randrange(len(copy))
      fold.append(copy.pop(index))
    split.append(fold)
  return split

# Calculate root mean squared error
def rmse (actual, predicted):
  sum_error = 0
  for i in range(len(actual)):
    prediction_error = predicted[i] - actual[i]
    sum_error += prediction_error**2
  mean_error = sum_error / len(actual)
  return math.sqrt(mean_error)

# Evaluate an algorithm using a cross validation split
def evaluate_algorithm (dataset, algorithm, n_folds, *args):
  folds = split(dataset, n_folds)
  scores = list()
  for i, fold in enumerate(folds):
    train = list(folds)
    train.remove(fold)
    train = sum(train, [])
    test = list()
    for row in fold:
      row_copy = list(row)
      row_copy[-1] = None
      test.append(row_copy)
    actual = [row[-1] for row in fold]
    predicted = algorithm(train, test, *args)
    scores.append(rmse(actual, predicted))
  return scores

# Make a prediction with coefficients
def predict (row, coefficients):
  yhat = coefficients[0]
  for i in range(len(row) - 1):
    yhat += coefficients[i + 1] * row[i]
  return yhat

# Estimate linear regression coefficients using stochastic gradient descent
def coefficients_sgd (train, l_rate, n_epoch):
  coefficients = [0.0 for i in range(len(train[0]))]
  for epoch in range(n_epoch):
    for row in train:
      yhat = predict(row, coefficients)
      error = yhat - row[-1]
      coefficients[0] = coefficients[0] - l_rate * error
      for i in range(len(row) - 1):
        coefficients[i + 1] = coefficients[i + 1] - l_rate * error * row[i]
  return coefficients

# Linear Regression Algorithm With Stochastic Gradient Descent
def linear_regression_sgd (train, test, l_rate, n_epoch):
  coefficients = coefficients_sgd(train, l_rate, n_epoch)
  return [predict(row, coefficients) for row in test]

# load dataset
dataset_file = 'winequality-white.csv'
dataset = load_dataset(dataset_file)

# normalize
minmax_values = minmax(dataset)
dataset = normalize(dataset, minmax_values)

# evaluate algorithm
n_folds = 5
l_rate = 0.01
n_epoch = 50
scores = evaluate_algorithm(dataset, linear_regression_sgd, n_folds, l_rate, n_epoch)

print('Scores: %s' % scores)
print('Mean RMSE: %.3f' % (sum(scores)/float(len(scores))))

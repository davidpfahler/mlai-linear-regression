# Port of my previous implementation in JavaScript
import os.path
import urllib
from math import sqrt
from random import seed
from random import randrange

# Download dataset if it is not yet present locally.
filename = 'dataset.csv'
url = 'https://www.math.muni.cz/~kolacek/docs/frvs/M7222/data/AutoInsurSweden.txt'

# replace European style comma with dot notation
def convert_line (line):
  line = line.split('\t')
  return map(lambda var: var.replace(',', '.'), line)

if not os.path.isfile(filename):
  linenumber = 0
  file = open(filename, 'w')

  for line in urllib.urlopen(url):
    linenumber += 1
    if linenumber < 12: continue

    x, y = convert_line(line)
    file.write(x + ';' + y)

  file.close()

def mean (values):
  return sum(values) / float(len(values))

def variance (values, mean):
  return sum([(x - mean)**2 for x in values])

def covariance (x, mean_x, y, mean_y):
  return sum([(x[i] - mean_x) * (y[i] - mean_y) for i in range(len(x))])

def coefficients (dataset):
  x = [row[0] for row in dataset]
  y = [row[1] for row in dataset]
  mean_x, mean_y = mean(x), mean(y)
  m = covariance(x, mean_x, y, mean_y) / variance(x, mean_x)
  t = mean_y - m * mean_x
  return [t, m]

def simple_linear_regression (train, test):
  t, m = coefficients(train)
  return [m * row[0] + t for row in test]

def rmse (actual, predicted):
  sum_error = 0.0
  for i in  range(len(actual)):
    prediction_error = predicted[i] - actual[i]
    sum_error += prediction_error**2
  return sqrt(sum_error / len(actual))

def evaluate_algorithm (train, test, algorithm):
  test_set = [[row[0]] for row in test]
  predicted = algorithm(train, test_set)
  actual = [row[1] for row in test]
  return rmse(actual, predicted)

def split (dataset, factor):
  train_size = len(dataset) * factor
  train = list()
  test = list(dataset)
  while len(train) < train_size:
    index = randrange(len(test))
    train.append(test.pop(index))
  return [train, test]

def load_dataset (filename):
  with open(filename) as file:
    return [map(lambda x: float(x), line.strip('\n').split(';')) for line in file]

seed(1)
dataset = load_dataset(filename)
train, test = split(dataset, 0.6)
rmserr = evaluate_algorithm(train, test, simple_linear_regression)
print('RMSE: %.3f' % (rmserr))

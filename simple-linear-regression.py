# Port of my previous implementation in JavaScript
import os.path
import urllib

# Download dataset if it is not yet present locally.
filename = 'dataset.csv'
url = 'http://www.math.muni.cz/~kolacek/docs/frvs/M7222/data/AutoInsurSweden.txt'

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

dataset = [[1, 1], [2, 3], [4, 3], [3, 2], [5, 5]]
x = [row[0] for row in dataset]
y = [row[1] for row in dataset]
mean_x, mean_y = mean(x), mean(y)
covar = covariance(x, mean_x, y, mean_y)
print('Covariance: %.3f' % (covar))
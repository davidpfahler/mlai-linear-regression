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

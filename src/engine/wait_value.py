import sys

_sum = 0
for i, arg in enumerate(sys.argv[2:], start=2):
    prev = sys.argv[i - 1]
    _sum += float(arg) - float(prev)

print(_sum)

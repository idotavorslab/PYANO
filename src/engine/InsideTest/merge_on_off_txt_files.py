import sys
from classes import Message
from util import prfl, Logger
import itertools as it

logger = Logger('merge_on_off_txt_files')
base_path = sys.argv[1]
on_path = sys.argv[2]
off_path = sys.argv[3]

with open(base_path, mode="w") as base, open(on_path) as on, open(off_path) as off:
    on_lines = on.readlines()
    off_lines = off.readlines()
    on_msgs = Message.construct_many(on_lines)
    off_msgs = Message.construct_many(off_lines)
    zipped = zip(on_msgs, off_msgs)

    chained = it.chain.from_iterable(zipped)
    sorted_msgs = sorted(chained, key=lambda m: m.time)
    base.writelines(map(lambda m: m.to_line(), sorted_msgs))

[prfl(msg.__dict__) for msg in sorted_msgs]

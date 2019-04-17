import json
import sys
from classes import Message
from util import prjs, Logger
import itertools as it

logger = Logger('merge_on_off_txt_files')
base_path = sys.argv[1]
on_path = sys.argv[2]
off_path = sys.argv[3]


def get_on_off_pairs(on_msgs, off_msgs):
    pairs = []
    for on_msg in on_msgs:
        matching_off_msg = next((off_msg for off_msg in off_msgs
                                 if (off_msg.note == on_msg.note
                                     and off_msg.time > on_msg.time)),
                                None)
        off_msgs.remove(matching_off_msg)
        pairs.append((on_msg, matching_off_msg))
    return pairs


with open(base_path, mode="w") as base, open(on_path) as on, open(off_path) as off:
    on_lines = on.readlines()
    off_lines = off.readlines()
    on_msgs = Message.construct_many(on_lines)
    off_msgs = Message.construct_many(off_lines)
    zipped = zip(on_msgs, off_msgs)

    chained = it.chain.from_iterable(zipped)
    sorted_msgs = sorted(chained, key=lambda m: m.time)
    base.writelines(map(lambda m: m.to_line(), sorted_msgs))

on_off_pairs = get_on_off_pairs(on_msgs, off_msgs)
prjs(dict(all_msgs=[msg.__dict__ for msg in sorted_msgs],
          on_msgs=[msg.__dict__ for msg in on_msgs],
          off_msgs=[msg.__dict__ for msg in off_msgs],
          on_off_pairs=[(on_msg.__dict__, off_msg.__dict__) for on_msg, off_msg in on_off_pairs]
          ))

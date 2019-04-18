import json
import sys
from classes import Message
from util import prjs, Logger
import itertools as it

logger = Logger('merge_on_off_txt_files')
base_path = sys.argv[1]
on_path = sys.argv[2]
off_path = sys.argv[3]
try:
    normalize_first = sys.argv[4]
except IndexError:
    normalize_first = False


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


if normalize_first:
    Message.normalize_simultaneous_hits_in_file(file_path)
with open(base_path, mode="w") as base, open(on_path) as on, open(off_path) as off:
    on_lines = on.readlines()
    off_lines = off.readlines()
    on_msgs = Message.construct_many(on_lines)
    off_msgs = Message.construct_many(off_lines)
    on_off_zipped = zip(on_msgs, off_msgs)

    on_off_chained = it.chain.from_iterable(on_off_zipped)
    on_off_sorted = sorted(on_off_chained, key=lambda m: m.time)
    base.writelines(map(lambda m: m.to_line(), on_off_sorted))

on_off_pairs = get_on_off_pairs(on_msgs, off_msgs[:])
prjs(dict(all_msgs=[msg.__dict__ for msg in on_off_sorted],
          on_msgs=[msg.__dict__ for msg in on_msgs],
          off_msgs=[msg.__dict__ for msg in off_msgs],
          on_off_pairs=[(on_msg.__dict__, off_msg.__dict__) for on_msg, off_msg in on_off_pairs]
          ))

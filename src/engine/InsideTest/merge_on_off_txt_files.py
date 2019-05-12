import json
import sys
from classes import Message
from util import prjs, Logger
import itertools as it

logger = Logger('merge_on_off_txt_files')
if len(sys.argv) > 1:
    base_path = sys.argv[1]
    on_path = sys.argv[2]
    off_path = sys.argv[3]
else:
    base_path = r'c:\Sync\Code\Python\Pyano-release\src\experiments\truths\prelude.txt'
    on_path = r'c:\Sync\Code\Python\Pyano-release\src\experiments\truths\prelude_on.txt'
    off_path = r'c:\Sync\Code\Python\Pyano-release\src\experiments\truths\prelude_off.txt'


def get_on_off_pairs(on_msgs, off_msgs):
    pairs = []
    for on_msg in on_msgs:
        matching_off_msg = next((off_msg for off_msg in off_msgs
                                 if (off_msg.note == on_msg.note
                                     and off_msg.time > on_msg.time)),
                                None)
        if matching_off_msg is not None:
            off_msgs.remove(matching_off_msg)
            pairs.append((on_msg, matching_off_msg))
    return pairs


on_msgs = Message.normalize_chords_in_file(on_path)
off_msgs = Message.construct_many_from_file(off_path)
on_off_zipped = zip(on_msgs, off_msgs)

on_off_chained = it.chain.from_iterable(on_off_zipped)
on_off_sorted = sorted(on_off_chained, key=lambda m: m.time)
with open(base_path, mode="w") as base:
    base.writelines(map(lambda m: m.to_line(), on_off_sorted))

on_off_pairs = get_on_off_pairs(on_msgs, off_msgs[:])
prjs(dict(all_msgs=[msg.__dict__ for msg in on_off_sorted],
          on_msgs=[msg.__dict__ for msg in on_msgs],
          off_msgs=[msg.__dict__ for msg in off_msgs],
          on_off_pairs=[(on_msg.__dict__, off_msg.__dict__) for on_msg, off_msg in on_off_pairs]
          ))

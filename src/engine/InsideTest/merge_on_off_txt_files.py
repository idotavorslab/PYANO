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
    base_path = r'c:\Sync\Code\Python\Pyano-release\src\experiments\truths\magnet_prelude_7500ms.txt'
    on_path = r'c:\Sync\Code\Python\Pyano-release\src\experiments\truths\magnet_prelude_7500ms_on.txt'
    off_path = r'c:\Sync\Code\Python\Pyano-release\src\experiments\truths\magnet_prelude_7500ms_off.txt'

on_msgs = Message.normalize_chords_in_file(on_path)
off_msgs = Message.construct_many_from_file(off_path)
on_off_pairs = Message.get_on_off_pairs(on_msgs, off_msgs[:])
for i, (on, off) in enumerate(on_off_pairs):
    for j, (next_on, _) in enumerate(on_off_pairs[i + 1:], i + 1):
        if next_on.note == on.note and next_on.time < off.time:
            raise ValueError(f'''on note (on file index: {i + 1}) 
            ends (off file index: {off_msgs.index(off) + 1}) 
            after next (on file index: {j + 1})''')

on_off_chained = it.chain.from_iterable(on_off_pairs)
on_off_sorted = sorted(on_off_chained, key=lambda m: m.time)
with open(base_path, mode="w") as base:
    base.writelines(map(lambda m: m.to_line(), on_off_sorted))

# TODO: off_msgs may be different than the off messages that were written to file after pairing
prjs(dict(all_msgs=[msg.__dict__ for msg in on_off_sorted],
          on_msgs=[msg.__dict__ for msg in on_msgs],
          off_msgs=[msg.__dict__ for msg in off_msgs],
          on_off_pairs=[(on_msg.__dict__, off_msg.__dict__) for on_msg, off_msg in on_off_pairs]
          ))

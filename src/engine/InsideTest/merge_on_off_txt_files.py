import itertools as it
import sys
from typing import List, Tuple

from classes import Message
from util import prjs, Logger

logger = Logger('merge_on_off_txt_files')
base_path = sys.argv[1]
on_path = sys.argv[2]
off_path = sys.argv[3]


def get_on_off_pairs(_on_msgs: List[Message], _off_msgs: List[Message]) -> List[Tuple[Message, Message]]:
	_pairs = []
	for _on_msg in _on_msgs:
		_matching_off_msg = next((_off_msg for _off_msg in _off_msgs
								  if (_off_msg.note == _on_msg.note
									  and _off_msg.time > _on_msg.time)),
								 None)
		if _matching_off_msg is not None:
			_off_msgs.remove(_matching_off_msg)
			_pairs.append((_on_msg, _matching_off_msg))
	return _pairs


on_msgs: List[Message] = Message.normalize_chords_in_file(on_path)
off_msgs: List[Message] = Message.construct_many_from_file(off_path)
on_off_pairs = get_on_off_pairs(on_msgs, off_msgs[:])
for i, (on, off) in enumerate(on_off_pairs):
	for j, (next_on, _) in enumerate(on_off_pairs[i + 1:], i + 1):
		if next_on.note == on.note and next_on.time < off.time:
			warning = "\n".join([f"ON time and matching OFF time don't make sense:",
								 f"OFF happened only after ON happened TWICE.",
								 f"{on_path = }, {off_path = }",
								 f"1st ON: {on}, 2nd ON: {next_on}, 1st OFF: {off}"])
			logger.log_thin(warning, should_pf=False, title="WARNING")

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

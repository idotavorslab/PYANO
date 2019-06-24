import sys
from util import prjs, Logger
from classes import Message
import re
import os

base_path = sys.argv[1]
logger = Logger('split_base_txt_file')
with open(base_path) as base:
    on_msgs = []
    off_msgs = []
    lines = base.readlines()
    regexp = r'^\d{10}[\.]?\d{0,5}[ \t]note=\d{1,3}[ \t]velocity=\d{1,3}[ \t](on|off)\n?$'
    for i, line in enumerate(lines):
        if re.fullmatch(regexp, line):
            msg = Message(line)
            if msg.kind == 'on':
                msg.set_time_props(on_msgs[-1].time if on_msgs else None)
                on_msgs.append(msg)
            else:
                msg.set_time_props(off_msgs[-1].time if off_msgs else None)
                off_msgs.append(msg)
        else:
            err = f"""line {i} in truth: {os.path.basename(base_path)} 
            didn't full match regexp.
            line: {line}
            regexp: {regexp}"""
            logger.log_thin(dict(base_path=base_path, line=line, i=i, regexp=regexp), title=f"ValueError: {err}")
            raise ValueError(err)

on_path = f"{os.path.splitext(base_path)[0]}_on.txt"
off_path = f"{os.path.splitext(base_path)[0]}_off.txt"

with open(on_path, mode="w") as on:
    for on_msg in on_msgs:
        msg_line = on_msg.to_line()
        on.write(msg_line)

with open(off_path, mode="w") as off:
    for off_msg in off_msgs:
        msg_line = off_msg.to_line()
        off.write(msg_line)

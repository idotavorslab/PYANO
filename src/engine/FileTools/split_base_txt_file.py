import sys
from util import prjs, Logger
from classes import Message

base_path = sys.argv[1]
print(f'base_path: ', base_path)
logger = Logger('split_base_txt_file')
with open(base_path) as base:
    Message.init()
msgs = Message.normalize_chords_in_file(base_path)
print()

import sys
from classes import Message
from util import prfl, Logger

logger = Logger('normalize_txt_file')
file_path = sys.argv[1]

msgs = Message.normalize_chords_in_file(file_path)
[prfl(msg.__dict__) for msg in msgs]

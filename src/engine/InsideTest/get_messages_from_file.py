import sys
from classes import Message
from util import prfl, Logger

logger = Logger('get_messages_from_file')
file_path = sys.argv[1]

msgs = Message.construct_many_from_file(file_path)
[prfl(msg.__dict__) for msg in msgs]

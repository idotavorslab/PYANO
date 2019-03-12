import sys
import json
from classes import Message
from util import prfl

response = json.loads(sys.argv[1])
file_path = response["file_path"]

msgs = Message.normalize_simultaneous_hits_in_file(file_path)
prfl(dict(messages=[msg.__dict__ for msg in msgs]))

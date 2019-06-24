import sys
from util import prjs, Logger

base_path = sys.argv[1]
logger = Logger('split_base_txt_file')

with open(base_path) as base:


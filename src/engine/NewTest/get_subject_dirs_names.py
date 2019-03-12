import sys
import os

from util import Logger

logger = Logger('get_subject_dirs_names')
subjects_dir_path = sys.argv[1]
logger.log(subjects_dir_path, title='subjects_dir_path')
subjects_list = os.listdir(subjects_dir_path)

[print(s) for s in subjects_list]

sys.stdout.flush()

import sys
import os

root_abs_path = sys.argv[1]
experiments_dir = os.path.join(root_abs_path, 'experiments')
if not os.path.isdir(experiments_dir):
    os.mkdir(experiments_dir)

for _dir in ['configs', 'subjects', 'truths']:
    subdir = os.path.join(experiments_dir, _dir)
    if not os.path.isdir(subdir):
        os.mkdir(subdir)

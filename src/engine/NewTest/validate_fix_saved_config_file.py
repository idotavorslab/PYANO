import sys
import json
import os

from util import Logger, prjs
from utils import check_fix_config_data

logger = Logger('validate_fix_config_file')
try:
    configfilepath = sys.argv[1]
except IndexError:
    configfilepath = r"c:\Sync\Code\Python\Pyano-release\src\experiments\configs\test_03.json"

isfile = os.path.isfile(configfilepath)
if not isfile:
    raise FileNotFoundError(f"configfilepath not isfile: {configfilepath}")

with open(configfilepath) as f:
    config = json.load(f)

config['current_test'], current_test_modified = check_fix_config_data.do(config.get('current_test'))
config['current_exam'], current_exam_modified = check_fix_config_data.do(config.get('current_exam'))
experiment_type_modified = False
if 'experiment_type' not in config or config['experiment_type'] not in ['exam', 'test']:
    experiment_type_modified = True
    config['experiment_type'] = 'test'
if current_test_modified or current_exam_modified or experiment_type_modified:
    try:
        with open(configfilepath, mode="w") as f:
            # modify config file
            json.dump(config, f, indent=4)
        prjs(dict(fixed_ok=True))
    except:
        prjs(dict(fixed_ok=False))

"""THIS FILE IS BROKEN"""
import sys
import json
import os

from util import Logger, prjs
from utils import check_fix_config_data

logger = Logger('validate_fix_config_file')
try:
    configfilepath = sys.argv[1]
except IndexError:
    configfilepath = r"c:\Sync\Code\Python\Pyano-release\src\experiments\configs\ode_4.test"

isfile = os.path.isfile(configfilepath)
if not isfile:
    raise FileNotFoundError(f"configfilepath not isfile: {configfilepath}")

with open(configfilepath) as f:
    config = json.load(f)
config, config_modified = check_fix_config_data.do(config)

# Don't check for 'save_path' because 'save_path' exists only in config.json current_${type}.
# When saving configs, the extension does this instead
# Also, a saved .exam or .test has a "truth_file_path" key that doesn't exist in config.json current_${type}.

truth_file_path_modified = False
if 'truth_file_path' not in config:
    truth_file_path_modified = True
    config['truth_file_path'] = "experiments/truths/fur_elise_B.txt"
else:
    import re
    
    split = re.split(r'[\\/]', config['truth_file_path'])
    if (len(split) != 3
            or split[0] != 'experiments'
            or split[1] != 'truths'
            or not split[2].endswith('.txt')):
        truth_file_path_modified = True
        config['truth_file_path'] = "experiments/truths/fur_elise_B.txt"
if config_modified or truth_file_path_modified:
    try:
        with open(configfilepath, mode="w") as f:
            # modify config file
            json.dump(config, f, indent=4)
        prjs(dict(fixed_ok=True))
    except:
        prjs(dict(fixed_ok=False))

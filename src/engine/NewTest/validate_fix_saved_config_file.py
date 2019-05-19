import sys
import json
import os

from util import Logger, prjs
from utils import check_fix_config_data

logger = Logger('validate_fix_config_file')
try:
    configfilepath = sys.argv[1]
except IndexError:
    configfilepath = r"c:\Sync\Code\Python\Pyano-release\src\experiments\configs\something.json"

isfile = os.path.isfile(configfilepath)
if not isfile:
    raise FileNotFoundError(f"configfilepath not isfile: {configfilepath}")

with open(configfilepath) as f:
    config = json.load(f)

config, modified = check_fix_config_data.do(config)
if modified:
    try:
        with open(configfilepath, mode="w") as f:
            # modify config file
            json.dump(config, f, indent=4)
        prjs(dict(fixed_ok=True))
    except:
        prjs(dict(fixed_ok=False))

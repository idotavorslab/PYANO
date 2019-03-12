import sys
import os
from util import Logger, prfl

lgr = Logger('check_create_local_modules_symlink')
# /src
root = sys.argv[1]
# /node_modules
node_modules_path = os.path.join(os.path.split(root)[0], 'node_modules')
# /src/templates/js/local_modules
local_modules_path = os.path.join(root, 'templates', 'js', 'local_modules')
# /node_modules/local_modules
symlink_path = os.path.join(node_modules_path, 'local_modules')
symlink_exists = os.path.exists(symlink_path)
lgr.log_thin(dict(root=root,
                  node_modules_path=node_modules_path,
                  local_modules_path=local_modules_path,
                  symlink_path=symlink_path,
                  symlink_exists=symlink_exists))
if not symlink_exists:
    # mklink /D "node_modules/local_modules" "c:\Sync\Code\Python\Pyano\pyano_01\src\templates\js\local_modules"
    # ln -s /path/to/original/ /path/to/link
    if sys.platform == 'win32':
        ok = os.system(f'mklink /D "{symlink_path}" "{local_modules_path}"')
    else:
        ok = os.system(f'ln -s {local_modules_path} {symlink_path}')

    if ok != 0:
        prfl("FAILED creating symlink")

import os
from optparse import OptionParser

parser = OptionParser()
parser.add_option("-r", "--root_dir", help="path of the project's root directory, where `node_modules` and `.gitignore` lay")
parser.add_option("-k", "--keep", help="what folder to keep. example: `pyano_local_modules`")
(options, args) = parser.parse_args()
node_modules_path = os.path.join(options.root_dir, "node_modules")
gitignore_path = os.path.join(options.root_dir, ".gitignore")
with open(gitignore_path, mode='a') as gitignore:
    [gitignore.write('node_modules/' + module + '\n')
     for module in os.listdir(node_modules_path) if options.keep not in module]

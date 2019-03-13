import os
from optparse import OptionParser

parser = OptionParser()
parser.add_option("-r", "--root_dir", help="path of the project's root directory, where `node_modules` and `.gitignore` lay")
parser.add_option("-k", "--keep", help="what folder(s) to keep. can be space separated. example: `pyano_local_modules` or `foo bar baz`")
(options, args) = parser.parse_args()

keep = options.keep.split()
print(f'keeping outside of gitignore: {keep}')
node_modules_path = os.path.join(options.root_dir, "node_modules")
gitignore_path = os.path.join(options.root_dir, ".gitignore")
with open(gitignore_path, mode='a') as gitignore:
    [gitignore.write('node_modules/' + module + '\n')
     for module in os.listdir(node_modules_path) if module not in keep]

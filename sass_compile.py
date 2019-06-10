import os

relcssdir = 'src/templates/css'
cssdir = os.path.join(os.getcwd(), relcssdir)
os.chdir(cssdir)
print(f'\n\tchanged working directory to: {cssdir}\n')
files = os.listdir(cssdir)
cmd = 'sass --no-source-map --watch '
sassfiles = []
cssfiles = []
for f in files:
    if f.endswith('.sass') and not f.startswith('_'):
        cmd += '{0}:{1} '.format(f, f.replace("sass", "css"))

print(f"\nexecuting: \n{cmd}\n")
os.system(cmd)

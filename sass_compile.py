import os

relcssdir = 'src/templates/css'
cssdir = os.path.join(os.getcwd(), relcssdir)
os.chdir(cssdir)
print(f'\n\tchanged working directory to: {cssdir}\n')
files = os.listdir(cssdir)
cmd = 'sass --watch '
sassfiles = []
cssfiles = []
for f in files:
    if f.endswith('.sass') and not f.startswith('_'):
        cmd += f'{f}:{f.replace("sass", "css")} '

print(f"\nexecuting: \n{cmd}\n")
os.system(cmd)

from setuptools import setup, find_packages
import sys

# python setup.py develop
packages = find_packages()
print('sys.argv:', sys.argv, f'packages: ', packages, sep='\n')
if not any(arg for arg in sys.argv if 'pip' in arg):
    if not input('continue? y/n ').lower().startswith('y'):
        print('aborting')
        sys.exit()
setup(name='pyano',
      version='1.5.0',
      description='A description for Pyano',
      author='Gilad Barnea',
      author_email='giladbrn@gmail.com',
      url='https://www.google.com',
      packages=packages,

      )

#!python3
import subprocess as sp
import shlex
import sys

X = sys.executable


def code(string):
	return '\x1b[38;2;125;125;125;3;48;2;25;25;25m' + string + '\x1b[0m'


def fatal(string):
	print('\x1b[91;1m' + string + '\x1b[0m')


try:
	major, minor = sys.version_info[0], sys.version_info[1]
	if major != 3 or minor < 6:
		fatal(f'This script has to run with python 3.6 or later. It is now run with {X}, which is version {major}.{minor}.')
		sys.exit(1)
except Exception as e:
	fatal('Failed getting version info. Tried to run the following and got ' + e.__class__.__name__ + ' ' + str(e) + ':\n' + code("major, minor = sys.version_info[0], sys.version_info[1]"))
	sys.exit(1)

try:
	import requests
except:
	fatal('Failed importing requests.')
	sys.exit(1)


def run(cmd, *args, **kwargs):
	"""
	A wrapper to ``subprocess.run(cmd, stdout=sp.PIPE)``.

	Keyword Args:
		stdout (int): instead of default `sp.PIPE`
		verbose (bool): If True, prints 'Running: ...'

	Returns:
		str: decoded stdout (or empty string).
	"""
	if 'stdout' not in kwargs:
		kwargs.update(stdout=sp.PIPE)
	if kwargs.pop('verbose', None) is not None:
		print(f'Running:', code(cmd))
	stdout = sp.run(shlex.split(cmd), *args, **kwargs).stdout
	if stdout:
		return stdout.strip().decode()
	return ""


def main():
	pass


if __name__ == '__main__':
	main()

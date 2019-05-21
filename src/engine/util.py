import json
import sys
import os
from pprint import pformat as pf
from datetime import datetime
from typing import Dict
import inspect


class Logger:

    def __init__(self, filename):
        try:
            os.mkdir('./logs')
        except FileExistsError:
            pass

        try:
            os.mkdir('./counters')
        except FileExistsError:
            pass

        self._filename = os.path.splitext(filename)[0]
        self._logpath = f'logs/{self._filename}.log'
        self._logged_once = False
        self._counterpath = f'counters/{self._filename}.json'

    @staticmethod
    def _is_stringified(s):
        try:
            parsed = json.loads(s)
            # '{"hello":"what"}'
            return True, f'parsed: {parsed}'

        except ValueError:
            # s is not a real object, but an illegal JSON
            # '{hello:"what"}'
            # "{'hello':'what'}"
            return False, 'ValueError (illegal string)'

        except TypeError:
            # s is a real object
            # {"hello":"what"}
            # {'hello':'what'}
            return False, 'TypeError (real object)'

    @staticmethod
    def _get_first_arg_name():
        frame = inspect.currentframe()
        outerframes = inspect.getouterframes(frame)
        frame_idx = outerframes.index(next(f for f in outerframes if f.frame.f_code.co_name == "<module>"))
        frame = outerframes[frame_idx]
        string = inspect.getframeinfo(frame[0]).code_context[0].strip()
        args = string[string.rfind('(') + 1:string.find(')')]
        if '=' in args:
            arg = str(list(map(lambda s: s[:s.find('=')].strip(),
                               args
                               .replace(' ', '')
                               .split(','))))
        elif '[' in args:
            arg = str(args[args.find('[') + 1:args.find(']')]
                      .replace(' ', '')
                      .split(','))
        else:
            arg = string[string.find('(') + 1:-1].split(',')[0]
        return arg

    def log(self, exp, should_pf=True, include_type=True, include_is_stringified=False, title=None):
        with open(self._logpath, mode="a") as f:
            line = ''
            if not self._logged_once:
                line = '\n-----------------------------------------------------'
                self._logged_once = True

            strftime = datetime.today().strftime("%d.%m.%y %H:%M:%S:%f")
            beginning = f'{line}\n{strftime}'
            if title:
                beginning += f'\n## {title} ##'
            else:
                beginning += f'\n## var name: {self._get_first_arg_name()} ##'

            middle = '\n'
            if should_pf:
                middle += f'{pf(exp)}\n(pfmt)'
            else:
                middle += f'{exp}'

            end = '\n'
            if include_type:
                end += f'({type(exp)})'

            final = '\n'
            if include_is_stringified:
                final += f'(stringified: {self._is_stringified(exp)})\n'

            f.write(f'{beginning}{middle}{end}{final}')
        return strftime

    def log_thin(self, exp, should_pf=True, include_type=False, include_is_stringified=False, title=None):
        return self.log(exp, should_pf, include_is_stringified=include_is_stringified,
                        include_type=include_type, title=title)

    def count(self, obj: list):
        raise NotImplementedError
        # by_dots = location.split('.')
        # obj = {by_dots[0]: by_dots[1]}
        # for i, level in enumerate(by_dots):
        if os.path.isfile(self._counterpath):
            with open(self._counterpath) as f:
                loaded = json.load(f)
        else:
            loaded = obj
        with open(self._counterpath, mode='w') as f:
            json.dump(obj, f)


def msg_gen(port):
    for msg in port:
        try:
            if msg.type != 'clock' and msg.velocity:
                yield msg
        except AttributeError:
            yield msg


def prfl(s, js=True):
    print(s if not js else json.dumps(s))
    sys.stdout.flush()


def prjs(s):
    print(json.dumps(s))


def round5(num: float):
    return round(num, 5)

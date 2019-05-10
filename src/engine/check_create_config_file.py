import sys
import json
import os

from util import Logger, prjs

logger = Logger('check_create_config_file')
try:
    configpath = sys.argv[1]
    root_abs_path = sys.argv[2]
except IndexError:
    configpath = r"C:\Users\gbete\AppData\Roaming\Electron"
    root_abs_path = r"c:\Sync\Code\Python\Pyano-release\src"

username = os.getlogin()
configfile = os.path.join(configpath, 'config.json')
isfile = os.path.isfile(configfile)

is_in_dev = 'gbete' in username
if not isfile:  # not found
    config = dict(root_abs_path=root_abs_path,
                  dev=is_in_dev,
                  vid_silence_len=0,
                  last_page='new_test',
                  subjects=[username],
                  current_test=dict(
                      truth_file_path="experiments\\truths\\fur_elise_B.txt",
                      demo_type='video',
                      errors_playingspeed=1,
                      allowed_rhythm_deviation="40%",
                      allowed_tempo_deviation="10%",
                      levels=[dict(notes=4, trials=1, rhythm=False, tempo=None),
                              dict(notes=4, trials=1, rhythm=True, tempo=50)],
                      finished_trials_count=0,
                      current_subject=username
                      ),
                  )

    try:
        with open(configfile, mode="w") as f:
            # create config file
            json.dump(config, f)
        prjs(dict(created_ok=True))
    except:
        prjs(dict(created_ok=False))

else:
    # config FOUND, now check contents
    with open(configfile) as f:
        config = json.load(f)


    def check_fix_first_level():
        modified = False
        if 'root_abs_path' not in config or config['root_abs_path'] != root_abs_path:
            config['root_abs_path'] = root_abs_path
            modified = True

        if 'dev' not in config or config['dev'] != is_in_dev:
            config['dev'] = is_in_dev
            modified = True

        if 'last_page' not in config or config['last_page'] not in ['new_test', 'record', 'file_tools', 'inside_test']:
            config['last_page'] = 'new_test'
            modified = True

        if ('vid_silence_len' not in config
                or config['vid_silence_len'] < 0):
            config['vid_silence_len'] = 0
            modified = True

        if ('subjects' not in config
                or not isinstance(config['subjects'], list)
                or not all((isinstance(s, str) for s in config['subjects']))):
            config['subjects'] = [username]
            modified = True
        elif username not in config['subjects']:  # subject key exists and is a list of strings
            config['subjects'].append(username)
            modified = True

        return modified


    def check_fix_current_test():
        modified = False

        current_test = config['current_test']
        import re

        if 'truth_file_path' not in current_test:
            current_test['truth_file_path'] = "experiments\\truths\\fur_elise.txt"
            modified = True
        else:
            split = re.split(r'[\\/]', current_test['truth_file_path'])
            if (len(split) != 3
                    or split[0] != 'experiments'
                    or split[1] != 'truths'
                    or not split[2].endswith('.txt')):
                current_test['truth_file_path'] = "experiments\\truths\\fur_elise_B.txt"
                modified = True

        if 'demo_type' not in current_test or current_test['demo_type'] not in ['animation', 'video']:
            current_test['demo_type'] = 'video'
            modified = True

        if 'errors_playingspeed' not in current_test or not isinstance(current_test['errors_playingspeed'], int):
            current_test['errors_playingspeed'] = 1
            modified = True
        elif current_test['errors_playingspeed'] <= 0:  # exists and is an int, check for value
            current_test['errors_playingspeed'] = 1
            modified = True

        if ('allowed_rhythm_deviation' not in current_test
                or not isinstance(current_test['allowed_rhythm_deviation'], str)):
            current_test['allowed_rhythm_deviation'] = '40%'
            modified = True
        elif len(current_test['allowed_rhythm_deviation']) != 3 or current_test['allowed_rhythm_deviation'][-1] != '%':
            current_test['allowed_rhythm_deviation'] = '40%'
            modified = True

        if ('allowed_tempo_deviation' not in current_test
                or not isinstance(current_test['allowed_tempo_deviation'], str)):
            current_test['allowed_tempo_deviation'] = '10%'
            modified = True
        elif len(current_test['allowed_tempo_deviation']) != 3 or current_test['allowed_tempo_deviation'][-1] != '%':
            current_test['allowed_tempo_deviation'] = '10%'
            modified = True

        if 'finished_trials_count' not in current_test or not isinstance(current_test['finished_trials_count'], int):
            current_test['finished_trials_count'] = 0
            modified = True
        elif current_test['finished_trials_count'] != 0:  # exists and is an int, check for value
            current_test['finished_trials_count'] = 0
            modified = True

        if 'current_subject' not in current_test or current_test['current_subject'] != username:
            current_test['current_subject'] = username
            modified = True

        if 'levels' not in current_test or not current_test['levels'] or not isinstance(current_test['levels'], list):
            current_test['levels'] = [dict(notes=4, trials=1, rhythm=False, tempo=None),
                                      dict(notes=4, trials=1, rhythm=True, tempo=50)]
            modified = True
        # levels key exists and is list, check if all levels adhere to ['notes', 'trials', 'rhythm', 'tempo'] structure
        elif not all((['notes', 'trials', 'rhythm', 'tempo'] == list(level.keys())
                      for level in current_test['levels'])):
            current_test['levels'] = [dict(notes=4, trials=1, rhythm=False, tempo=None),
                                      dict(notes=4, trials=1, rhythm=True, tempo=50)]
            modified = True

        if modified:
            config['current_test'] = current_test
        return modified


    def check_fix_current_test_levels():
        modified = False
        levels = config['current_test']['levels']
        for i, level in enumerate(levels):
            if not isinstance(level['notes'], int) or level['notes'] <= 0:
                levels[i]['notes'] = 4
                modified = True

            if not isinstance(level['trials'], int) or level['trials'] <= 0:
                levels[i]['trials'] = 2
                modified = True

            if not isinstance(level['rhythm'], bool):
                levels[i]['rhythm'] = False
                modified = True

            if level['rhythm']:  # rhythm: True
                if not isinstance(level['tempo'], int) or not 0 < level['tempo'] <= 200:
                    level['tempo'] = 50
                    modified = True
            else:  # rhythm: False
                if level['tempo'] is not None:
                    level['tempo'] = None
                    modified = True
        if modified:
            config['current_test']['levels'] = levels
        return modified


    def raise_if_any_bad_path():
        if not os.path.isdir(config['root_abs_path']):
            raise NotADirectoryError(f"root_abs_path is not a dir. Received: {config['root_abs_path']}")

        truth_file_path = os.path.join(config['root_abs_path'], config['current_test']['truth_file_path'])
        if not os.path.isfile(truth_file_path):
            raise FileNotFoundError(
                f"config current_test truth_file_path is not a file. value tested: {truth_file_path}")


    first_level_modified = check_fix_first_level()
    current_test_modified = check_fix_current_test()  # assume first level ok
    current_test_levels_modified = check_fix_current_test_levels()  # assume current_test ok
    if any((first_level_modified, current_test_modified, current_test_levels_modified)):
        try:
            with open(configfile, mode="w") as f:
                # modify config file
                json.dump(config, f, indent=4)
            prjs(dict(fixed_ok=True))
        except:
            prjs(dict(fixed_ok=False))

    raise_if_any_bad_path()
    prjs(dict(first_level_modified=first_level_modified,
              current_test_modified=current_test_modified,
              current_test_levels_modified=current_test_levels_modified))

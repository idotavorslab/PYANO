import os
import difflib
import re

_KEYS = ['allowed_rhythm_deviation',
         'allowed_tempo_deviation',
         'current_subject',
         'demo_type',
         'errors_playingspeed',
         'finished_trials_count',
         'levels',
         'save_path']


def how_much_diff(a, b):
    return len([d[0] for d in difflib.ndiff(a, b) if d[0] != ' '])


def do(test_dict: dict, *, save_path_filetype: str = None):
    modified = False
    if test_dict is None:
        test_dict = {}
    for key in list(test_dict.keys()):
        if key not in _KEYS:
            modified = True
            keys_diff = {_K: how_much_diff(key, _K) for _K in _KEYS}
            closest_key = sorted(keys_diff, key=keys_diff.get)[0]
            value = test_dict.pop(key)
            if keys_diff[closest_key] <= 10:
                test_dict[closest_key] = value

    if save_path_filetype:
        if 'save_path' not in test_dict:
            modified = True
            test_dict['save_path'] = f"experiments/configs/fur_elise_B.{save_path_filetype}"
        else:
            split = re.split(r'[\\/]', test_dict['save_path'])
            if (len(split) != 3
                    or split[0] != 'experiments'
                    or split[1] != 'configs'
                    or not split[2].endswith(f'.{save_path_filetype}')):
                modified = True
                test_dict['save_path'] = f"experiments/configs/fur_elise_B.{save_path_filetype}"

    if ('demo_type'
            not in test_dict
            or test_dict['demo_type'] not in ['animation', 'video']):
        test_dict['demo_type'] = 'video'
        modified = True

    if ('errors_playingspeed'
            not in test_dict
            or (not isinstance(test_dict['errors_playingspeed'], float)
                and not isinstance(test_dict['errors_playingspeed'], int))):
        test_dict['errors_playingspeed'] = 1
        modified = True
    elif test_dict['errors_playingspeed'] <= 0:  # exists and is an int or float, check for value
        test_dict['errors_playingspeed'] = 1
        modified = True

    if ('allowed_rhythm_deviation'
            not in test_dict
            or not isinstance(test_dict['allowed_rhythm_deviation'], str)):
        test_dict['allowed_rhythm_deviation'] = '40%'
        modified = True
    elif (2 > len(test_dict['allowed_rhythm_deviation']) > 4
          or test_dict['allowed_rhythm_deviation'][-1] != '%'):
        test_dict['allowed_rhythm_deviation'] = '40%'
        modified = True

    if ('allowed_tempo_deviation'
            not in test_dict
            or not isinstance(test_dict['allowed_tempo_deviation'], str)):
        test_dict['allowed_tempo_deviation'] = '10%'
        modified = True
    elif (2 > len(test_dict['allowed_tempo_deviation']) > 4
          or test_dict['allowed_tempo_deviation'][-1] != '%'):
        test_dict['allowed_tempo_deviation'] = '10%'
        modified = True

    if ('finished_trials_count'
            not in test_dict
            or not isinstance(test_dict['finished_trials_count'], int)):
        test_dict['finished_trials_count'] = 0
        modified = True
    elif test_dict['finished_trials_count'] != 0:  # exists and is an int, check for value
        test_dict['finished_trials_count'] = 0
        modified = True

    if 'current_subject' not in test_dict:
        test_dict['current_subject'] = os.getlogin()
        modified = True

    if ('levels'
            not in test_dict
            or not test_dict['levels']
            or not isinstance(test_dict['levels'], list)):
        test_dict['levels'] = [dict(notes=4, trials=1, rhythm=False, tempo=None),
                               dict(notes=4, trials=1, rhythm=True, tempo=50)]
        modified = True
    # levels key exists and is list, check if all levels adhere to ['notes', 'trials', 'rhythm', 'tempo'] structure
    elif not all((['notes', 'trials', 'rhythm', 'tempo'] == list(level.keys())
                  for level in test_dict['levels'])):
        test_dict['levels'] = [dict(notes=4, trials=1, rhythm=False, tempo=None),
                               dict(notes=4, trials=1, rhythm=True, tempo=50)]
        modified = True

    return test_dict, modified

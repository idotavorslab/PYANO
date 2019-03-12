import sys
import json
import os

from util import Logger

logger = Logger('check_create_config_file')
configpath = sys.argv[1]
root_abs_path = sys.argv[2]
username = os.getlogin()
configfile = os.path.join(configpath, 'config.json')
isfile = os.path.isfile(configfile)

if not isfile:  # not found
    config = dict(root_abs_path=root_abs_path,
                  dev=False,
                  vid_silence_len=2,
                  last_page='new_test',
                  current_test=dict(
                      truth_file_path="experiments\\truths\\fur_elise.txt",
                      learning_type='accuracy',
                      demo_type='animation',
                      errors_playingspeed=1,
                      allowed_tempo_deviation_factor="40%",
                      levels=[dict(notes=5, trials=2)],
                      finished_trials_count=0,
                      current_subject=username
                      ))

    with open(configfile, mode="w") as f:
        # create config file
        json.dump(config, f)
else:
    # config FOUND, now check contents
    with open(configfile) as f:
        config = json.load(f)
        # logger.log(config)
        first_level_keys = ['root_abs_path', 'current_test', 'dev', 'last_page', 'vid_silence_len']
        first_level_ok = all([key in config for key in first_level_keys])
        current_test_keys = ['truth_file_path',
                             'learning_type',
                             'demo_type',
                             'errors_playingspeed',
                             'allowed_tempo_deviation_factor',
                             'levels',
                             'finished_trials_count',
                             'current_subject']
        current_test_ok = all([ctestkey in config['current_test'] for ctestkey in current_test_keys])
        # logger.log_thin([first_level_ok, current_test_ok])

import sys
import json
import os

from util import Logger, prjs

logger = Logger('check_create_config_file')
configpath = sys.argv[1]
root_abs_path = sys.argv[2]
username = os.getlogin()
configfile = os.path.join(configpath, 'config.json')
isfile = os.path.isfile(configfile)

if not isfile:  # not found
    config = dict(root_abs_path=root_abs_path,
                  dev=False,
                  vid_silence_len=0,
                  last_page='new_test',
                  current_test=dict(
                      truth_file_path="experiments\\truths\\fur_elise.txt",
                      demo_type='video',
                      errors_playingspeed=1,
                      allowed_rhythm_deviation="40%",
                      allowed_tempo_deviation="10%",
                      levels=[dict(notes=4, trials=1, rhythm=False, tempo=None),
                              dict(notes=4, trials=1, rhythm=True, tempo=50)],
                      finished_trials_count=0,
                      current_subject=username
                      ))

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
        # logger.log(config)
        first_level_keys = ['root_abs_path', 'current_test', 'dev', 'last_page', 'vid_silence_len']
        first_level_ok = all([key in config for key in first_level_keys])
        current_test_keys = ['truth_file_path',
                             'demo_type',
                             'errors_playingspeed',
                             'allowed_rhythm_deviation',
                             'allowed_tempo_deviation',
                             'levels',
                             'finished_trials_count',
                             'current_subject']
        current_test_ok = all([ctestkey in config['current_test'] for ctestkey in current_test_keys])
        prjs(dict(first_level_ok=first_level_ok, current_test_ok=current_test_ok))
        # logger.log_thin([first_level_ok, current_test_ok])

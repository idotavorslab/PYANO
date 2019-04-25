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


def check_and_fix_dev(val):
    if 'gbete' in username:
        return True
    return False


def check_and_fix_root_abs_path(val):
    if not os.path.isabs(val) or not os.path.isdir(val):
        fixedval = r'c:\Pyano\src'
        isdir = os.path.isdir(fixedval)

        if not isdir:
            logger.log(dict(val=val, fixedval=r'c:\Pyano\src', isdir=isdir), title="NotADirectoryError")
            raise NotADirectoryError(
                f"check_and_fix_root_abs_path val not abs, C Pyano src not dir. see 'check_create_config_file.log'")
        else:
            return fixedval
    else:
        return val


def check_and_fix_last_page(val):
    if val not in ['inside_test', 'new_test', 'record', 'file_tools']:
        return 'new_test'
    else:
        return val


def check_and_fix_vid_silence_len(val):
    try:
        return int(val)
    except ValueError:
        return 0


def check_and_fix_current_test(val):
    current_test = val.get('current_test')
    truth_file_path = current_test.get('truth_file_path')
    truth_file_abs_path = os.path.join(val['root_abs_path'], truth_file_path)

    if not os.path.isfile(truth_file_abs_path):
        truthfiles = os.listdir(os.path.join(val['root_abs_path'], 'experiments', 'truths'))
        files_no_ext = [os.path.splitext(f)[0] for f in truthfiles]
        truth_file_abs_path = next((f for f in files_no_ext if files_no_ext.count(f) >= 4), None)

    learning_type = current_test.get('learning_type')
    if learning_type not in ['accuracy', 'tempo']:
        learning_type = 'accuracy'

    demo_type = current_test.get('demo_type')
    if demo_type not in ['video', 'animation']:
        demo_type = 'video'

    atdf = current_test.get('allowed_rhythm_deviation')
    if not isinstance(atdf, str) or not 4 >= len(atdf) >= 2 or not atdf[:-1] == '%':
        atdf = "40%"

    err_speed = current_test.get('errors_playingspeed')
    if not err_speed or (not isinstance(err_speed, int) and not err_speed.isdigit()):
        err_speed = 1
    return dict(current_test,
                truth_file_path=os.path.join('experiments', 'truths', os.path.basename(truth_file_abs_path)),
                learning_type=learning_type,
                demo_type=demo_type,
                finished_trials_count=0,
                errors_playingspeed=err_speed,
                allowed_rhythm_deviation=atdf
                )


if not isfile:  # not found
    config = dict(root_abs_path=root_abs_path,
                  dev=False,
                  vid_silence_len=0,
                  last_page='new_test',
                  current_test=dict(
                      truth_file_path="experiments\\truths\\fur_elise.txt",
                      learning_type='accuracy',
                      demo_type='video',
                      errors_playingspeed=1,
                      allowed_rhythm_deviation="40%",
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
    with open(configfile, mode='w+') as f:
        fixedconfig = dict(dev=check_and_fix_dev(config.get('dev')),
                           vid_silence_len=check_and_fix_vid_silence_len(config.get('vid_silence_len')),
                           root_abs_path=check_and_fix_root_abs_path(config.get('root_abs_path')),
                           last_page=check_and_fix_last_page(config.get('last_page')),
                           current_test=check_and_fix_current_test(config),
                           subjects=config.get('subjects')
                           )
        json.dump(fixedconfig, f)
        # logger.log_thin([first_level_ok, current_test_ok])

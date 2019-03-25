import sys
import os
from util import Logger
import json

logger = Logger('update_onsets_json')
vid = sys.argv[1]
first_onset = float(sys.argv[2])
no_ext, _ = os.path.splitext(vid)
logged_exp = dict(vid=vid, first_onset=first_onset, no_ext=no_ext)


def update_onsets_json():
    # Assume no_ext == 'vid' without '_trimmed.mp4'
    try:
        with open(f'{no_ext}_onsets.json', mode='r') as f:
            data = json.load(f)
            onsets_2d = [onset[:3] for onset in data["onsets"]]
            first_onset_index = onsets_2d.index(str(first_onset))
            logged_exp.update(data=data, onsets_2d=onsets_2d, f=f,
                              first_onset_index=first_onset_index)

        with open(f'{no_ext}_onsets.json', mode='w+') as f:
            json.dump({**data, 'first_onset_index': first_onset_index}, f)


    except FileNotFoundError as e:
        logged_exp.update(e=e)
        logger.log(logged_exp, title=f"FileNotFoundError - no file named {no_ext}_onsets.json")
        raise e
    except ValueError as e:
        logged_exp.update(e=e)
        logger.log(logged_exp, title=f"ValueError - didn't find index of first_onset among onsets_2d")
        raise e
    except Exception as e:
        logged_exp.update(e=e)
        logger.log(logged_exp, title=f"Exception - failed writing to '{no_ext}_onsets.json'")
        raise e


update_onsets_json()

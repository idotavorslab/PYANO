"""
args:
[
    [1]: path/to/vid.mp4,
    [2]: 2.985,
    [3]: 2,
    [ [4]: 12.72, [5]: 11 ]
]

"""
import sys
import os
import json
from util import Logger


def force_2_digits(num) -> str:
    if len(str(num)) == 1:
        return f'0{num}'
    elif isinstance(num, float):
        predec, dec, postdec = str(num).partition('.')
        return f'{force_2_digits(predec)}.{postdec}'
    else:
        return str(num)


def get_hhmmss(s):
    h = 0
    m = 0
    if s >= 3600:
        h = int(s / 3600)
        s = s % 3600
    if s >= 60:
        m = int(s / 60)
        s = s % 60
    string = f'{force_2_digits(h)}:{force_2_digits(m)}:{force_2_digits(s)}'
    return string


logger = Logger('trim_and_force_silence')

vid = sys.argv[1]
first_onset = float(sys.argv[2])
silence_len = int(sys.argv[3])
no_ext, _ = os.path.splitext(vid)
logged_exp = dict(vid=vid, first_onset=first_onset,
                  silence_len=silence_len,
                  no_ext=no_ext)


def update_onsets_json():
    # Assume no_ext == 'vid.mp4' without '_trimmed.mp4'
    try:
        with open(f'{no_ext}_onsets.json', mode='r') as f:
            data = json.load(f)
            onsets_2d = [onset[:3] for onset in data["onsets"]]
            first_onset_index = onsets_2d.index(str(first_onset))
            logged_exp.update(data=data, onsets_2d=onsets_2d, f=f,
                              first_onset_index=first_onset_index)

        # from classes import Message
        # messages = Message.normalize_simultaneous_hits_in_file(f'{no_ext}.txt')

        with open(f'{no_ext}_onsets.json', mode='w+') as f:
            json.dump({**data, 'first_onset_index': first_onset_index}, f)

        return True

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


try:
    # **{no_ext}_{notes_num}N.mp4
    # got [4] and [5] args, then trim to sub version and create f'{no_ext}_{notes_num}N.mp4'
    to_secs = float(sys.argv[4])
    to_str = get_hhmmss(to_secs)
    notes_num = int(sys.argv[5])
    output = f'{no_ext}_{notes_num}N.mp4'

    logged_exp.update(to_secs=to_secs, to_str=to_str,
                      notes_num=notes_num, output=output)
except IndexError:
    # **{no_ext}_trimmed.mp4
    # no [4] and [5] args. Infer duration, no sub version, create f'{no_ext}_trimmed.mp4'
    dur = float(os.popen(f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 {vid}')
                .read()
                .strip())
    # OR:
    # dur = librosa.get_duration(filename=vid)
    to_str = get_hhmmss(dur)
    output = f'{no_ext}_trimmed.mp4'

    logged_exp.update(dur=dur, to_str=to_str, output=output)

    update_onsets_json()

if os.path.exists(output):
    logger.log(logged_exp, title=f"FileExistsError - {output}. see trim_and_force_silence.log")
    raise FileExistsError(output)
# start_secs = float(first_onset - silence_len)
start_secs = float(first_onset)
logged_exp.update(start_secs=start_secs)
if start_secs < 0:
    err = """First onset minus silence length is negative. 
    This means first onset was early, and silence length was too large. 
    You are always better off starting to record vid way before first note. see trim_and_force_silence.log"""
    logger.log(logged_exp, title=err)
    raise ValueError(err)

start_str = get_hhmmss(start_secs)
logged_exp.update(start_str=start_str)
ok = os.system(f'ffmpeg -ss {start_str} -i "{vid}" -c copy -t {to_str} "{output}"')
if ok != 0:
    logger.log(logged_exp, title="ValueError - ok is not 0")
    raise ValueError("ok system ffmpeg -ss blah blah copy output failed. see trim_and_force_silence.log")
print(output)

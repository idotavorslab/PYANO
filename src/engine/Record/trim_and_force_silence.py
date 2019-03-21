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
no_ext = os.path.splitext(vid)[0]

logged_exp = dict(vid=vid, first_onset=first_onset,
                  # silence_len=silence_len,
                  no_ext=no_ext)
try:
    to_secs = float(sys.argv[4])
    to_str = get_hhmmss(to_secs)
    notes_num = int(sys.argv[5])
    output = f'{no_ext}_{notes_num}N.mp4'

    logged_exp.update(to_secs=to_secs, to_str=to_str,
                      notes_num=notes_num, output=output)
except IndexError:
    dur = float(os.popen(f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 {vid}')
                .read()
                .strip())
    # OR:
    # dur = librosa.get_duration(filename=vid)
    to_str = get_hhmmss(dur)
    output = f'{no_ext}_trimmed.mp4'

    logged_exp.update(dur=dur, to_str=to_str, output=output)

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

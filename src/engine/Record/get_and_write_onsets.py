import librosa
import os
import sys
import json

vid = sys.argv[1]
y, sr = librosa.load(vid, sr=22050)
hop_length = 512
onsets = librosa.onset.onset_detect(y=y,
                                    sr=sr,
                                    hop_length=hop_length)
onset_times = librosa.frames_to_time(onsets,
                                     sr=sr,
                                     hop_length=hop_length)
no_ext, _ = os.path.splitext(vid)
with open(f'{no_ext}_onsets.json', mode='w+') as f:
    json.dump(dict(onsets=[str(t) for t in onset_times]), f)
[print(t) for t in onset_times]

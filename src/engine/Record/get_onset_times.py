import sys
import librosa

vid = sys.argv[1]
y, sr = librosa.load(vid, sr=22050)
hop_length = 512
onsets = librosa.onset.onset_detect(y=y,
                                    sr=sr,
                                    hop_length=hop_length)
onset_times = librosa.frames_to_time(onsets,
                                     sr=sr,
                                     hop_length=hop_length)
[print(t) for t in onset_times]

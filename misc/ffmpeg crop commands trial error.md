Variations to try:

| var                                                                                                                                                | works | fast  | smooth | size~ | mpc   | vlc   |
|----------------------------------------------------------------------------------------------------------------------------------------------------|-------|-------|--------|-------|-------|-------|
| `ffmpeg -i in.mp4 -filter:v "crop=w:h:x:y" out.mp4`                                                                                                | False | False | --     | 5     | False | False |
| `ffmpeg -i in.mp4 -filter:v "crop=w:h:x:y" -crf 23 -c:a copy -qp 0 out.mp4`                                                                        | False | False | --     | 5     | False | False |
| `ffmpeg -i in.mp4 -filter:v "crop=w:h:x:y" -crf 23 out.mp4`                                                                                        | False | False | --     | 5     | False | False |
| `ffmpeg -i in.mp4 -filter:v "crop=w:h:x:y" -c:a copy -qp 0 out.mp4`                                                                                | True  | False | False  | 200   | False | False |
| `ffmpeg -i in.mp4 -vf "crop=w:h:x:y" -c:v ffv1 -c:a copy out.mp4`                                                                                  | ERR   | ERR   | ERR    | ERR   | ERR   | ERR   |
| `ffmpeg -i in.mp4 -vf "crop=w:h:x:y" -c:v libx264 -crf 0 -c:a copy out.mp4`                                                                        | True  | False | False  | 200   | False | False |
| `ffmpeg -i in.mp4 -vf "crop=w:h:x:y" -c:v libx264 -crf 17 -c:a copy out.mp4`                                                                       | False | False | --     | 5     | False | False |
| `ffmpeg -i in.mp4 -filter:v "crop=w:h:x:y" -c:a copy -qp 1 out.mp4`                                                                                | True  | False | False  | 200   | False | False |
| `ffmpeg -i in.mp4 -filter:v "crop=w:h:x:y" -qp 1 out.mp4`                                                                                          | True  | False | False  | 200   | False | False |
| `ffmpeg -i in.mp4 -filter:v "crop=w:h:x:y" -qp 5 out.mp4`                                                                                          | True  | False | False  | 200   | False | False |
| `ffmpeg -i in.mp4 -filter:v "crop=w:h:x:y" -qp 5 -preset ultrafast -tune zerolatency out.mp4`                                                      | True  | False | False  | 200   | False | False |
| `ffmpeg -i in.mp4 -filter:v "crop=w:h:x:y" -qp 5 -preset ultrafast -tune zerolatency -profile:v baseline out.mp4`                                  | True  | False | False  | 200   | False | False |
| `ffmpeg -i in.mp4 -filter:v "crop=w:h:x:y" -qp 5 -preset ultrafast -tune zerolatency -profile:v baseline -level 3.0 out.mp4`                       | True  | False | False  | 200   | False | True  |
| `ffmpeg -i in.mp4 -filter:v "crop=w:h:x:y" -qp 5 -preset ultrafast -tune zerolatency -profile:v baseline -level 3.0 -movflags +faststart out.mp4`  | True  | False | True   | 200   | False | True  |
| `ffmpeg -i in.mp4 -filter:v "crop=w:h:x:y" -qp 10 -preset ultrafast -tune zerolatency -profile:v baseline -level 3.0 -movflags +faststart out.mp4` | True  | False | True   | 90    | False | True  |
| `ffmpeg -i in.mp4 -filter:v "crop=w:h:x:y" -qp 11 -preset ultrafast -tune zerolatency -profile:v baseline -level 3.0 -movflags +faststart out.mp4` | True  | False | True   | 70    | False | True  |
| `ffmpeg -i in.mp4 -filter:v "crop=w:h:x:y" -qp 12 -preset ultrafast -tune zerolatency -profile:v baseline -level 3.0 -movflags +faststart out.mp4` | True  | False | True   | 60    | False | True  |
| `ffmpeg -i in.mp4 -filter:v "crop=w:h:x:y" -qp 13 -preset ultrafast -tune zerolatency -profile:v baseline -level 3.0 -movflags +faststart out.mp4` | False | False | --     | 50    | False | True  |
| `ffmpeg -i in.mp4 -filter:v "crop=w:h:x:y" -qp 17 -preset ultrafast -tune zerolatency -profile:v baseline -level 3.0 -movflags +faststart out.mp4` | False | Semi  | --     | 20    | False | True  |
| `ffmpeg -i in.mp4 -filter:v "crop=w:h:x:y" -preset ultrafast -tune zerolatency -profile:v baseline -level 3.0 -movflags +faststart out.mp4`        | False | True  | --     | 9     | False | True  |

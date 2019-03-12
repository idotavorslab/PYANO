import sys
import json
import os

subject_id = sys.argv[1]
subjects_path = sys.argv[2]
if not os.path.exists(subjects_path):
    os.mkdir(subjects_path)
subject_id_path = os.path.join(subjects_path, subject_id)
exists = os.path.exists(subject_id_path)
if not exists:
    response = "created"
    os.mkdir(subject_id_path)
else:
    response = "exists"
print(json.dumps(response))
sys.stdout.flush()

import json
import sys
from classes import Message, Hit
from util import prfl, Logger

logger = Logger("check_done_trial")

# def unpack_response(allowed_tempo_deviation_factor, trial_file_path,
#                     full_truth_file_path, num_of_notes_to_test):
#     return (
#         int(allowed_tempo_deviation_factor[:-1]),
#         trial_file_path,
#         full_truth_file_path,
#         num_of_notes_to_test,
#         )
#
#
# response = json.loads(sys.argv[1])
# (Allowed_Tempo_Deviation_Factor,
#  Trial_File_Path,
#  Full_Truth_File_Path,
#  Num_Of_Notes_To_Test) = unpack_response(**response)
Allowed_Tempo_Deviation_Factor = int(sys.argv[1][:-1])
Trial_File_Path = sys.argv[2]
Full_Truth_File_Path = sys.argv[3]
Current_Level = json.loads(sys.argv[4])
# logger.log((Allowed_Tempo_Deviation_Factor,
#             Trial_File_Path,
#             Full_Truth_File_Path,
#             Current_Level), include_is_stringified=True)
# TODO: SHOULD BE NORMALIZED RIGHT AFTER RECORD
Truths: [Message] = Message.construct_many_from_file(Full_Truth_File_Path)


def main():
    # TODO: SHOULD BE NORMALIZED RIGHT AFTER SUBJECT FINISHES
    msgs: [Message] = Message.construct_many_from_file(Trial_File_Path)
    played_enough_notes = len(msgs) >= Current_Level['notes']

    hits = []
    for i in range(min(Current_Level['notes'], len(msgs))):
        try:
            hit = Hit(msgs[i], Truths[i], Current_Level["tempo"])
        except IndexError as e:
            logger.log(dict(msgs=msgs, Truths=Truths, hits=hits,
                            Allowed_Tempo_Deviation_Factor=Allowed_Tempo_Deviation_Factor,
                            Trial_File_Path=Trial_File_Path,
                            Full_Truth_File_Path=Full_Truth_File_Path,
                            e=e, i=i, played_enough_notes=played_enough_notes,
                            Current_Level=Current_Level
                            ), title="IndexError")
            raise e
        if i and hit.is_correct_note and Current_Level['rhythm']:
            hit.set_is_correct_timing(Allowed_Tempo_Deviation_Factor)
        hits.append(hit)

    if not played_enough_notes:
        # played 3 notes but needed 4, [ null, null, null, "note" ]
        # or if made a mistake: [ null, "timing", null, "note" ]
        mistakes = [hit.get_mistake_kind() for hit in hits] + ["note"] * (Current_Level['notes'] - len(msgs))
        prfl(dict(passed=False, mistakes=mistakes))

    else:  # played all notes
        all_hits_correct = all([hit.note_and_timing_correct() for hit in hits])
        if all_hits_correct:
            prfl(dict(passed=True))
        else:
            # ['note', 'timing', None, ...]
            mistakes = [hit.get_mistake_kind() for hit in hits]
            logger.log(dict(msgs=msgs, Truths=Truths, hits=hits,
                            mistakes=mistakes,
                            Allowed_Tempo_Deviation_Factor=Allowed_Tempo_Deviation_Factor,
                            Trial_File_Path=Trial_File_Path,
                            Full_Truth_File_Path=Full_Truth_File_Path,
                            Current_Level=Current_Level,
                            ), title="Didnt pass")
            prfl(dict(passed=False, mistakes=mistakes))


if __name__ == '__main__':
    main()

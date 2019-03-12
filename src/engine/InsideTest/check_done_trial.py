import json
import sys
from classes import Message, Hit
from util import prfl, Logger

logger = Logger("check_done_trial")


def unpack_response(learning_type, allowed_tempo_deviation_factor, trial_file_path, full_truth_file_path,
                    num_of_notes_to_test):
    return (
        learning_type,
        int(allowed_tempo_deviation_factor[:-1]),
        trial_file_path,
        full_truth_file_path,
        num_of_notes_to_test,
        )


response = json.loads(sys.argv[1])
(Learning_Type,
 Allowed_Tempo_Deviation_Factor,
 Trial_File_Path,
 Full_Truth_File_Path,
 Num_Of_Notes_To_Test) = unpack_response(**response)

# TODO: SHOULD BE NORMALIZED RIGHT AFTER RECORD
Truths: [Message] = Message.construct_many_from_file(Full_Truth_File_Path)


def main():
    # TODO: SHOULD BE NORMALIZED RIGHT AFTER SUBJECT FINISH
    msgs: [Message] = Message.construct_many_from_file(Trial_File_Path)
    played_enough_notes = len(msgs) >= Num_Of_Notes_To_Test

    hits = []
    for i in range(min(Num_Of_Notes_To_Test, len(msgs))):
        try:
            hit = Hit(msgs[i], Truths[i])
        except IndexError as e:
            logger.log(dict(msgs=msgs, Truths=Truths, hits=hits,
                            Learning_Type=Learning_Type,
                            Allowed_Tempo_Deviation_Factor=Allowed_Tempo_Deviation_Factor,
                            Trial_File_Path=Trial_File_Path,
                            Full_Truth_File_Path=Full_Truth_File_Path,
                            Num_Of_Notes_To_Test=Num_Of_Notes_To_Test,
                            e=e, i=i, played_enough_notes=played_enough_notes
                            ), title="IndexError")
            raise e
        if i and hit.is_correct_note and Learning_Type == "tempo":
            hit.set_is_correct_timing(Allowed_Tempo_Deviation_Factor)
        hits.append(hit)

    if not played_enough_notes:
        # played 3 notes but needed 4, [ null, null, null, "note" ]
        # or if made a mistake: [ null, "timing", null, "note" ]
        mistakes = [hit.get_mistake_kind() for hit in hits] + ["note"] * (Num_Of_Notes_To_Test - len(msgs))
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
                            Learning_Type=Learning_Type,
                            Allowed_Tempo_Deviation_Factor=Allowed_Tempo_Deviation_Factor,
                            Trial_File_Path=Trial_File_Path,
                            Full_Truth_File_Path=Full_Truth_File_Path,
                            Num_Of_Notes_To_Test=Num_Of_Notes_To_Test,
                            ), title="Didnt pass")
            prfl(dict(passed=False, mistakes=mistakes))


if __name__ == '__main__':
    main()

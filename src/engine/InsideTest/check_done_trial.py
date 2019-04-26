from typing import List
import json
import sys
from classes import Message, Hit
from util import prfl, Logger

logger = Logger("check_done_trial")


def estimate_tempo_percentage(msgs: List[Message], truths: List[Message], notes: int) -> float:
    time_delta_ratios = []
    for i in range(min(notes, len(msgs))):
        msg_time_delta = msgs[i].time_delta
        truth_time_delta = truths[i].time_delta
        no_preceding_msg = msg_time_delta is None or truth_time_delta is None
        if no_preceding_msg:
            continue
        partof_chord = truth_time_delta <= 0.05 or msg_time_delta <= 0.05  # OR because what if subject played 2 notes in chord and truth is 3?
        if partof_chord:
            continue
        time_delta_ratios.append((truth_time_delta / msg_time_delta) * 100)

    return sum(time_delta_ratios) / len(time_delta_ratios)


def main():
    if len(sys.argv) > 1:
        allowed_rhythm_deviation = int(sys.argv[1][:-1])
        trial_on_path = sys.argv[2]
        truth_on_path = sys.argv[3]
        current_level = json.loads(sys.argv[4])
    else:
        allowed_rhythm_deviation = 40
        trial_on_path = r'c:\Sync\Code\Python\Pyano-release\src\experiments\subjects\shachar\fur_elise_B\level_1_trial_0_on.txt'
        truth_on_path = r'c:\Sync\Code\Python\Pyano-release\src\experiments\truths\fur_elise_B_on.txt'
        current_level = dict(notes=4, trials=1, rhythm=True, tempo=50)
    truths: List[Message] = Message.normalize_chords_in_file(truth_on_path)
    msgs: List[Message] = Message.normalize_chords_in_file(trial_on_path)
    check_rhythm = current_level['rhythm']
    tempo_estimation = estimate_tempo_percentage(msgs, truths, current_level['notes'])
    tempoed_msgs: List[Message] = Message.transform_to_tempo(msgs, tempo_estimation)

    hits = []
    for i in range(min(current_level['notes'], len(msgs))):
        hit = Hit(tempoed_msgs[i], truths[i], allowed_rhythm_deviation)
        hits.append(hit)

    mistakes = [hit.get_mistake_kind() for hit in hits]
    if check_rhythm:
        tempo_floor = current_level['tempo']
        if tempo_floor <= 90:
            is_tempo_correct = tempo_floor <= tempo_estimation <= 100
        else:
            is_tempo_correct = 90 <= tempo_estimation <= 110
        if not is_tempo_correct:
            prfl(dict(passed=False, is_tempo_correct=False,
                      mistakes=mistakes))
            return

    played_enough_notes = len(msgs) >= current_level['notes']
    if not played_enough_notes:
        # played 3 notes but needed 4: [ null, null, null, "accuracy" ]
        # if also made a mistake: [ null, "rhythm", null, "accuracy" ]
        mistakes += ["accuracy"] * (current_level['notes'] - len(msgs))
        prfl(dict(passed=False, mistakes=mistakes,
                  played_enough_notes=False))
        return

    # Played all notes or too many notes
    if check_rhythm:
        all_hits_correct = all([hit.are_accuracy_and_rhythm_correct() for hit in hits])
    else:
        all_hits_correct = all([hit.is_accuracy_correct for hit in hits])
    if all_hits_correct:
        prfl(dict(passed=True, played_too_many_notes=len(msgs) > current_level['notes']))
    else:
        # Had mistakes
        # ['accuracy', 'rhythm', None, ...]
        prfl(dict(passed=False, mistakes=mistakes))


if __name__ == '__main__':
    main()

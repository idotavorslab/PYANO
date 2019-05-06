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

    try:
        return sum(time_delta_ratios) / len(time_delta_ratios)
    except ZeroDivisionError:  # happens when played 1 note
        return 100


def main():
    if len(sys.argv) > 1:
        allowed_rhythm_deviation = int(sys.argv[1][:-1])
        allowed_tempo_deviation = int(sys.argv[2][:-1])
        trial_on_path = sys.argv[3]
        truth_on_path = sys.argv[4]
        current_level = json.loads(sys.argv[5])
    else:
        allowed_rhythm_deviation = 20
        allowed_tempo_deviation = 10
        trial_on_path = r'c:\Sync\Code\Python\Pyano-release\src\experiments\subjects\shachar\fur_elise_B\level_0_trial_0_on.txt'
        truth_on_path = r'c:\Sync\Code\Python\Pyano-release\src\experiments\truths\fur_elise_B_on.txt'
        current_level = dict(notes=4, trials=1, rhythm=True, tempo=100)
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
    played_enough_notes = len(msgs) >= current_level['notes']
    if not played_enough_notes:
        # needed to play 4 notes but playeed 3: [ null, null, null, "accuracy" ]
        # if also made a mistake: [ null, "rhythm", null, "accuracy" ]
        # Failed feedback msg could be "[ null, 'rhythm', null, 'accuracy' ], not enough notes and too fast"
        mistakes += ["accuracy"] * (current_level['notes'] - len(msgs))
    tempo_str = "ok"
    if check_rhythm:
        # Failed feedback msg could be "[ null, 'rhythm', null, 'accuracy' ] and too fast"

        if not (0 <= allowed_tempo_deviation <= 100):
            entry = logger.log(
                dict(trial_on_path=trial_on_path, truth_on_path=truth_on_path,
                     current_level=current_level,
                     allowed_tempo_deviation=allowed_tempo_deviation),
                title="check_done_trial ValueError bad allowed_tempo_deviation")
            raise ValueError(
                f"check_done_trial inside rhythm checking got bad allowed_tempo_deviation, got: {allowed_tempo_deviation}. see classes.log, entry: {entry}")

        tempo_floor = current_level['tempo'] - allowed_tempo_deviation
        tempo_ceil = 100 + allowed_tempo_deviation
        if tempo_estimation < tempo_floor:
            tempo_str = "slow"
        elif tempo_estimation > tempo_ceil:
            tempo_str = "fast"
        else:
            tempo_str = "ok"

        if tempo_str != 'ok':
            prfl(dict(passed=False, tempo_str=tempo_str,
                      played_enough_notes=played_enough_notes,
                      advance_trial='accuracy' not in mistakes,  # acc mistake when checking rhythm
                      mistakes=mistakes))
            return
    else:  # delete rhythm mistakes if not checking rhythm. ["rhythm", null, "accuracy"] => [null, null, "accuracy"]
        mistakes = [None if m == "rhythm" else m for m in mistakes]

    if not played_enough_notes:
        prfl(dict(passed=False, mistakes=mistakes,
                  advance_trial=not check_rhythm,  # acc mistake when checking rhythm
                  played_enough_notes=False, tempo_str=tempo_str))
        return

    # Played all notes or too many notes
    all_hits_correct = all([mistake is None for mistake in mistakes])
    if all_hits_correct:
        prfl(dict(passed=True, played_too_many_notes=len(msgs) > current_level['notes']))
        return
    else:
        # Had mistakes
        # Tempo ok, played all required notes
        # if not check rhythm: has accuracy mistakes
        # if check rhythm: has accuracy and/or rhythm mistakes
        # ['accuracy', 'rhythm', None, ...]
        prfl(dict(passed=False,
                  advance_trial=not (check_rhythm and 'accuracy' in mistakes),
                  mistakes=mistakes))


if __name__ == '__main__':
    main()

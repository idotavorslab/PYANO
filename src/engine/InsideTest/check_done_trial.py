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


def check_chord_accuracy(msgs: List[Message], truths: List[Message], *chord_indices: int):
    truth_chord_notes = []
    msgs_chord_notes = []
    for i in chord_indices:
        truth_chord_notes.append(truths[i].note)
        msgs_chord_notes.append(msgs[i].note)
    return set(truth_chord_notes) == set(msgs_chord_notes)


def main():
    def _dump_data():
        try:
            obj = dict(params=dict(allowed_rhythm_deviation=allowed_rhythm_deviation,
                                   allowed_tempo_deviation=allowed_tempo_deviation,
                                   current_level=current_level,
                                   experiment_type=experiment_type,
                                   trial_on_path=trial_on_path,
                                   truth_on_path=truth_on_path, ),
                       processing=dict(hits=[h.to_dict() for h in hits],
                                       messages=[m.to_dict() for m in msgs],
                                       messages_tempo_transformed=[tmsg.to_dict() for tmsg in tempoed_msgs],
                                       tempo_estimation=tempo_estimation,
                                       tempo_str=tempo_str,
                                       ),
                       results=dict(passed=passed,
                                    mistakes=mistakes,
                                    played_enough_notes=played_enough_notes, ), )
            if check_rhythm:
                obj['processing'].update(tempo_ceil=tempo_ceil,
                                         tempo_floor=tempo_floor, )
            if not passed:  # only time when passed is True (all_hits_correct), advance_trial isn't referenced
                obj['results'].update(advance_trial=advance_trial)

            with open(data_dump_path, mode='w') as f:
                json.dump(obj, f, indent=4, sort_keys=True)
        except:
            pass

    if len(sys.argv) > 1:
        allowed_rhythm_deviation = int(sys.argv[1][:-1])
        allowed_tempo_deviation = int(sys.argv[2][:-1])
        trial_on_path = sys.argv[3]
        truth_on_path = sys.argv[4]
        current_level = json.loads(sys.argv[5])
        experiment_type = sys.argv[6]
    else:
        allowed_rhythm_deviation = 30
        allowed_tempo_deviation = 10
        trial_on_path = r'C:\PYANO\src\experiments\subjects\gilad\tight_chord_24_06_2019_14-02-00\level_0_trial_0_on.txt'
        truth_on_path = r'C:\PYANO\src\experiments\truths\tight_chord_on.txt'
        current_level = dict(notes=8, trials=4, rhythm=True, tempo=100)
        experiment_type = 'test'

    data_dump_path = trial_on_path.rpartition('_on.txt')[0] + '_data.json'
    truths: List[Message] = Message.normalize_chords_in_file(truth_on_path)
    msgs: List[Message] = Message.normalize_chords_in_file(trial_on_path)

    check_rhythm = current_level['rhythm']
    current_level_notes = current_level['notes']
    tempo_estimation = estimate_tempo_percentage(msgs, truths, current_level_notes)
    tempoed_msgs: List[Message] = Message.transform_to_tempo(msgs, tempo_estimation)

    mistakes = []
    hits = []  # for data dumping
    truth_chords = Message.get_chords(truths[:current_level_notes])
    try:
        Message.normalize_chords(tempoed_msgs, truth_chords)  # of tempoed_msgs, according to truth_chords
    except Exception as e:
        entry = logger.log(dict(tempoed_msgs=tempoed_msgs,
                                truth_chords=truth_chords,
                                msg=msgs, current_level_notes=current_level_notes,
                                check_rhythm=check_rhythm, tempo_estimation=tempo_estimation,
                                truths=truths, e=e
                                ),
                           title=f"Exception at Message.normalize_chords(tempoed_msgs, truth_chords)")
        raise Exception(f"check done trial normalize chords exception. see log check_done_trial, entry: {entry}")
    for i in range(min(current_level_notes, len(msgs))):
        hit = Hit(tempoed_msgs[i], truths[i], allowed_rhythm_deviation)
        hits.append(hit)
        if not truth_chords:
            mistakes.append(hit.get_mistake_kind())

    if truth_chords:
        current_chord_root = list(truth_chords.keys())[0]
        current_chord_end = truth_chords[current_chord_root][-1]
        for i, hit in enumerate(hits):
            if i <= current_chord_root:
                mistakes.append(hit.get_mistake_kind())
                continue
            if i == current_chord_end:
                if any(hits[j]._rhythm_deviation == 999 for j in truth_chords[current_chord_root]):
                    for k in truth_chords[current_chord_root]:
                        hits[k]._rhythm_deviation = 999
                        if hits[k].is_accuracy_correct:
                            hits[k]._is_rhythm_correct = False
                        mistakes.append(hits[k].get_mistake_kind())
                else:
                    [mistakes.append(hits[k].get_mistake_kind()) for k in truth_chords[current_chord_root]]

    played_enough_notes = len(msgs) >= current_level_notes
    if not played_enough_notes:
        # needed to play 4 notes but playeed 3: [ null, null, null, "accuracy" ]
        # if also made a mistake: [ null, "rhythm", null, "accuracy" ]
        # Failed feedback msg could be "[ null, 'rhythm', null, 'accuracy' ], not enough notes and too fast"
        mistakes += ["accuracy"] * (current_level_notes - len(msgs))
    tempo_str = "ok"
    if check_rhythm:
        # Failed feedback msg could be "[ null, 'rhythm', null, 'accuracy' ] and too fast"
        # TODO: this can never happen: Hit.__init__ checks/raises that
        if not (0 <= allowed_tempo_deviation <= 100):
            entry = logger.log(
                dict(trial_on_path=trial_on_path, truth_on_path=truth_on_path,
                     current_level=current_level,
                     allowed_tempo_deviation=allowed_tempo_deviation),
                title="check_done_trial ValueError bad allowed_tempo_deviation")
            raise ValueError(
                f"check_done_trial inside rhythm checking got bad allowed_tempo_deviation, got: {allowed_tempo_deviation}. see classes.log, entry: {entry}")

        level_tempo = current_level['tempo']  # 75
        extra = level_tempo * allowed_tempo_deviation / 100  # 75*0.1 = 7.5
        tempo_floor = level_tempo - extra  # 67.5
        tempo_ceil = max(100, level_tempo + extra)  # max(100, 82.5) = 100
        if tempo_estimation < tempo_floor:
            tempo_str = "slow"
        elif tempo_estimation > tempo_ceil:
            tempo_str = "fast"
        else:
            tempo_str = "ok"

        if tempo_str != 'ok':
            # acc mistake when checking rhythm. if experiemnt is exam, advance anyway
            if experiment_type == 'exam':
                advance_trial = True
            else:
                advance_trial = 'accuracy' not in mistakes
            passed = False
            _dump_data()
            prfl(dict(
                advance_trial=advance_trial,
                mistakes=mistakes,
                passed=passed,
                played_enough_notes=played_enough_notes,
                tempo_str=tempo_str,
                ))
            return
    else:  # delete rhythm mistakes if not checking rhythm. ["rhythm", null, "accuracy"] => [null, null, "accuracy"]
        mistakes = [None if m == "rhythm" else m for m in mistakes]

    if not played_enough_notes:
        # not enough notes == accuracy mistakes. dont adv if check rhythm. if experiemnt is exam, advance anyway
        if experiment_type == 'exam':
            advance_trial = True
        else:
            advance_trial = not check_rhythm

        passed = False
        played_enough_notes = False
        _dump_data()
        prfl(dict(passed=passed, mistakes=mistakes,
                  advance_trial=advance_trial,
                  played_enough_notes=played_enough_notes,
                  tempo_str=tempo_str))
        return

    # Played all notes or too many notes
    all_hits_correct = all([mistake is None for mistake in mistakes])
    if all_hits_correct:
        passed = True
        played_too_many_notes = len(msgs) > current_level_notes
        _dump_data()
        prfl(dict(passed=passed, played_too_many_notes=played_too_many_notes))
        return
    else:
        # Had mistakes
        # Tempo ok, played all required notes
        # if not check rhythm: has accuracy mistakes
        # if check rhythm: has accuracy and/or rhythm mistakes
        # ['accuracy', 'rhythm', None, ...]
        if experiment_type == 'exam':
            advance_trial = True
        else:
            advance_trial = not (check_rhythm and 'accuracy' in mistakes)
        passed = False
        _dump_data()
        prfl(dict(passed=passed,
                  advance_trial=advance_trial,
                  mistakes=mistakes))


if __name__ == '__main__':
    main()

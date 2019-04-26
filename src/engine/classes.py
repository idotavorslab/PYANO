from util import round5, Logger
import re
from typing import Dict, List
from collections import OrderedDict

logger = Logger('classes')


class Message:
    def __init__(self, line: str, preceding_message_time: float = None):
        # "1549189615.55545  note=72 velocity=65 off"
        regexp = r'^\d{10}[\.]?\d{0,5}[ \t]note=\d{2,3}[ \t]velocity=\d{2,3}[ \t](on|off)\n?$'
        match = re.fullmatch(regexp, line)
        if not match:
            logger.log_thin(dict(line=line, match=match, regexp=regexp))
            raise ValueError(f"`line` did not re.fullmatch. See classes.log")
        kind: str
        time, note, velocity, kind = line.split('\t')
        self.time = float(time)
        self.note = int(note[note.index("=") + 1:])
        self.velocity = int(velocity[velocity.index("=") + 1:])
        self.kind = kind.strip()

        self.preceding_message_time = preceding_message_time

        if preceding_message_time:
            self.time_delta = self.time - preceding_message_time
        else:
            self.time_delta = None

    def __str__(self) -> str:
        return f'time: {self.time} | note: {self.note} | velocity: {self.velocity} | time_delta: {self.time_delta} | kind: {self.kind}'

    def __repr__(self) -> str:
        return self.__str__()

    def __eq__(self, o) -> bool:
        try:
            most_attrs_equal = (o.time == self.time
                                and o.note == self.note
                                and o.velocity == self.velocity
                                and o.kind == self.kind
                                and o.preceding_message_time == self.preceding_message_time)
            if o.time_delta is None or self.time_delta is None:
                return most_attrs_equal and o.time_delta == self.time_delta
            else:
                return most_attrs_equal and round(o.time_delta, 5) == round(self.time_delta, 5)
        except AttributeError:
            return False

    @staticmethod
    def _raise_if_bad_file(file_path: str):
        import os
        if not os.path.isabs(file_path):
            raise FileNotFoundError(f"Not ABS path: {file_path}")
        if not os.path.isfile(file_path):
            raise FileNotFoundError(f"Not isfile(): {file_path}")
        if os.path.splitext(file_path)[1] != ".txt":
            raise ValueError(f"BAD extension, needs .txt: {file_path}")
        # if os.path.getsize(file_path) == 0:
        #     raise ValueError(f"File empty! file_path: {file_path}")

    @staticmethod
    def init(*, time, note, velocity, kind, preceding_message_time=None) -> 'Message':
        line = f'{float(time)}\tnote={note}\tvelocity={velocity}\t{kind}'
        return Message(line, preceding_message_time)

    @staticmethod
    def init_many(*msgs: dict) -> List['Message']:
        constructed = []
        for i, m in enumerate(msgs):
            if 'preceding_message_time' not in m:
                if i != 0:
                    m.update(preceding_message_time=msgs[i - 1]['time'])
            constructed.append(Message.init(**m))
        return constructed

    def to_line(self):
        s = f'{self.time}\tnote={self.note}\tvelocity={self.velocity}\t{self.kind}\n'
        return s

    @staticmethod
    def construct_many(lines: List[str]) -> List['Message']:
        container = [Message(lines[0])]
        for i, line in enumerate(lines[1:]):
            preceding_message_time = container[i].time
            container.append(Message(line, preceding_message_time))
        return container

    @staticmethod
    def construct_many_from_file(file_path: str) -> List['Message']:
        Message._raise_if_bad_file(file_path)
        with open(file_path, mode="r") as f:
            messages = Message.construct_many(f.readlines())
        return messages

    @staticmethod
    def get_chords(messages: List) -> Dict[int, List[int]]:
        chords = OrderedDict()

        for i, message in enumerate(messages):
            if message.time_delta is None:
                continue
            is_chord_with_prev = message.time_delta <= 0.05
            if is_chord_with_prev:
                if not chords:
                    chords[i - 1] = [i]
                    continue

                last_key: int = next(reversed(chords))
                last_value: List[int] = chords[last_key]

                if last_key == i - 1 or i - 1 in last_value:
                    # last note was a chord root, or a part of an existing chord. append
                    chords[last_key].append(i)
                else:
                    # last note not in chords at all. create a new chord.
                    chords[i - 1] = [i]
        return chords

    @staticmethod
    def normalize_chords_in_file(file_path: str) -> List['Message']:
        normalized_messages, is_normalized = Message.is_file_chord_normalized(file_path)

        if not is_normalized:
            with open(file_path, mode="w") as f:
                for msg in normalized_messages:
                    msg_line = msg.to_line()
                    f.write(msg_line)

        return normalized_messages

    @staticmethod
    def is_file_chord_normalized(file_path: str) -> (List['Message'], bool):
        from copy import deepcopy
        # not neccessarily normalied now; will be normalized by end of function
        normalized_messages = Message.construct_many_from_file(file_path)
        chords = Message.get_chords(normalized_messages)
        is_normalized = True
        for root, rest in chords.items():
            """Overwrite chord messages so they are sorted by note, all timed according to lowest pitch note, and share the time delta and preceding message time data of the first-played note"""
            chord_indices: List[int] = [root, *rest]
            chord_messages = [deepcopy(normalized_messages)[i] for i in chord_indices]
            sorted_chord_messages = sorted(deepcopy(chord_messages), key=lambda m: m.note)
            already_sorted = chord_messages == sorted_chord_messages
            if already_sorted:
                continue

            # not sorted
            is_normalized = False
            for i, msg_i in enumerate(chord_indices):
                normalized_messages[msg_i].note = sorted_chord_messages[i].note
                normalized_messages[msg_i].velocity = sorted_chord_messages[i].velocity
        return normalized_messages, is_normalized

    @staticmethod
    def transform_to_tempo(msgs, actual_tempo: float) -> List['Message']:
        from copy import deepcopy
        dectempo = actual_tempo / 100
        msgs_copy = deepcopy(msgs)
        for i, msg in enumerate(msgs_copy):
            if msg.time_delta is None:
                continue
            if msg.time_delta > 0.05:  # don't change chorded notes time delta
                msg.time_delta = msg.time_delta / dectempo
            # TODO: maybe don't round? round only when writing to file
            msg.time = round(msgs_copy[i - 1].time + msg.time_delta, 5)
            msg.preceding_message_time = msgs_copy[i - 1].time
        return msgs_copy


class Hit:
    def __init__(self, msg: Message, truth: Message, allowed_rhythm_deviation: int):
        if allowed_rhythm_deviation < 0 or allowed_rhythm_deviation > 100:
            entry = logger.log(
                dict(self=self, msg=msg, truth=truth,
                     allowed_rhythm_deviation=allowed_rhythm_deviation),
                title="Hit constructor ValueError bad allowed_rhythm_deviation")
            raise ValueError(
                f"Hit constructor got bad allowed_rhythm_deviation, got: {allowed_rhythm_deviation}. see classes.log, entry: {entry}")

        self.is_accuracy_correct = msg.note == truth.note

        self._rhythm_deviation = Hit._get_rhythm_deviation(msg.time_delta, truth.time_delta)
        """if msg.time_delta and truth.time_delta:
            if truth.time_delta <= 0.05 and msg.time_delta <= 0.05:
                # if chord - as long as tight enough, counts as no deviation
                self._rhythm_deviation = 0
            else:
                # (0.3 / 0.25) x 100 = 1.2 x 100 = 120
                ratio = (msg.time_delta / truth.time_delta) * 100
                # abs(100 - 120) = 20
                self._rhythm_deviation = abs(100 - ratio)
        else:  # some time_delta is None
            self._rhythm_deviation = 0"""

        if self.is_accuracy_correct:  # interesting only if got accuracy right
            self._is_rhythm_correct = self._rhythm_deviation < allowed_rhythm_deviation
        else:  # rhythm isn't checked anyway if accuracy isn't right
            self._is_rhythm_correct = True

    @staticmethod
    def _get_rhythm_deviation(msg_time_delta, truth_time_delta) -> float:
        if msg_time_delta is None or truth_time_delta is None:
            return 0  # some time_delta is None

        if truth_time_delta <= 0.05 and msg_time_delta <= 0.05:
            # if chord - as long as tight enough, counts as no deviation
            return 0

        # (0.3 / 0.25) x 100 = 1.2 x 100 = 120
        #  OR
        # (0.2 / 0.25) x 100 = 0.8 x 100 = 80
        deltas_ratio = (msg_time_delta / truth_time_delta) * 100
        # abs(100 - 120) = 20.0 || OR || abs(100 - 80) = 20.0
        return abs(100 - deltas_ratio)

    def are_accuracy_and_rhythm_correct(self) -> bool:
        return self.is_accuracy_correct and self._is_rhythm_correct

    def get_mistake_kind(self) -> str or None:
        if not self.is_accuracy_correct:
            return "accuracy"
        if not self._is_rhythm_correct:
            return "rhythm"
        return None

    def __str__(self) -> str:
        return f'is_accuracy_correct: {self.is_accuracy_correct} | _rhythm_deviation: {self._rhythm_deviation} | _is_rhythm_correct: {self._is_rhythm_correct}'

    def __repr__(self) -> str:
        return self.__str__()


class HitOLD:
    def __init__(self, msg: Message, truth: Message, allowed_rhythm_deviation: int, tempo_floor: int,
                 tempo_estimation: int):
        if allowed_rhythm_deviation < 0 or allowed_rhythm_deviation > 100:
            entry = logger.log(
                dict(self=self, msg=msg, truth=truth,
                     allowed_rhythm_deviation=allowed_rhythm_deviation,
                     tempo_floor=tempo_floor, tempo_estimation=tempo_estimation),
                title="Hit constructor ValueError bad allowed_rhythm_deviation")
            raise ValueError(
                f"Hit constructor got bad allowed_rhythm_deviation, got: {allowed_rhythm_deviation}. see classes.log, entry: {entry}")

        if tempo_floor < 0 or tempo_floor > 150:
            entry = logger.log(
                dict(self=self, msg=msg, truth=truth,
                     allowed_rhythm_deviation=allowed_rhythm_deviation,
                     tempo_floor=tempo_floor, tempo_estimation=tempo_estimation),
                title="Hit constructor ValueError bad tempo_floor")
            raise ValueError(
                f"Hit constructor got tempo_floor not between 0 and 100, got: {tempo_floor}. see classes.log, entry: {entry}")

        self.is_accuracy_correct = msg.note == truth.note
        self._check_rhythm_and_tempo(msg.time_delta, truth.time_delta, allowed_rhythm_deviation,
                                     tempo_floor, tempo_estimation)

        self._is_tempo_correct = "IS IT??"
        self._rhythm_deviation = Hit._get_rhythm_deviation(msg.time_delta, truth.time_delta)
        """if msg.time_delta and truth.time_delta:
            if truth.time_delta <= 0.02 and msg.time_delta <= 0.02:
                # if chord - as long as tight enough, counts as no deviation
                self._rhythm_deviation = 0
            else:
                # (0.3 / 0.25) x 100 = 1.2 x 100 = 120
                ratio = round5((msg.time_delta / truth.time_delta) * 100)
                # abs(100 - 120) = 20
                self._rhythm_deviation = round5(abs(100 - ratio))
        else:  # some time_delta is None
            self._rhythm_deviation = 0"""

        if self.is_accuracy_correct:  # interesting only if got accuracy right
            self._is_rhythm_correct = self._rhythm_deviation < allowed_rhythm_deviation
        else:  # rhythm isn't checked anyway if accuracy isn't right
            self._is_rhythm_correct = True

    def _check_rhythm_and_tempo(self, msg_time_delta, truth_time_delta, allowed_rhythm_deviation,
                                tempo_floor, tempo_estimation):
        no_preceding_msg = msg_time_delta is None or truth_time_delta is None
        partof_chord = truth_time_delta <= 0.02 and msg_time_delta <= 0.02
        # TODO: Message.get_chords() uses <= 0.05!!
        if no_preceding_msg or partof_chord:
            self._rhythm_deviation = 0
            self._is_rhythm_correct = True
            self._is_tempo_correct = True
            return

        ####
        # Reaching here means subject played slower or equal to truth
        # Assume tempo_floor = 75, tempo_estimation = 80, allowed_rhythm_deviation = 25, truth_time_delta = 2
        # Therefore dectempo_floor = 0.75
        ####
        dectempo_floor = tempo_floor / 100

        # 2 / 0.75 = 2.666
        slowest_time_delta_allowed = truth_time_delta / dectempo_floor
        # 25 / 0.75 = 33.333
        if msg_time_delta > slowest_time_delta_allowed:
            # Assume msg_time_delta = 3.5
            # Therefore rhythm_deviation = 31.25
            largest_rhythm_deviation_allowed = allowed_rhythm_deviation / dectempo_floor
            self._rhythm_deviation = Hit._get_rhythm_deviation(msg_time_delta, slowest_time_delta_allowed)
            self._is_rhythm_correct = self._rhythm_deviation < largest_rhythm_deviation_allowed
            self._is_tempo_correct = self._is_rhythm_correct
            return

        # msg_time_delta is lower/equal to slowest_time_delta_allowed
        if msg_time_delta < truth_time_delta:
            # Assume msg_time_delta = 1.6
            # Therefore rhythm_deviation = 20.0
            self._rhythm_deviation = Hit._get_rhythm_deviation(msg_time_delta, truth_time_delta)
            self._is_rhythm_correct = self._rhythm_deviation < allowed_rhythm_deviation
            self._is_tempo_correct = self._is_rhythm_correct
            return

        # msg_time_delta is between truth_time_delta and slowest_time_delta_allowed (can be equal)
        self._is_tempo_correct = True
        if msg_time_delta > truth_time_delta:
            # Assume msg_time_delta = 2.5

            self._rhythm_deviation = Hit._get_rhythm_deviation(msg_time_delta, truth_time_delta)

        # 2.5 x 0.75 = 1.875
        # [OR]
        # 3 x 0.75 = 2.25
        # [OR]
        # 2 x 0.75 = 1.5
        # If subject played at the slowest valid tempo, this is the "calibrated"
        # delta that he would have had he played at 100% tempo
        tempo_calibrated_msg_time_delta = msg_time_delta * dectempo_floor

        # (0.3 / 0.25) x 100 = 1.2 x 100 = 120
        # [OR]
        # (0.2 / 0.25) x 100 = 0.8 x 100 = 80
        deltas_ratio = round5((msg_time_delta / truth_time_delta) * 100)
        # abs(100 - 120) = 20 [OR] abs(100 - 80) = 20
        rhythm_deviation = round5(abs(100 - deltas_ratio))

    @staticmethod
    def _get_rhythm_deviation(msg_time_delta, truth_time_delta) -> float:
        if msg_time_delta is None or truth_time_delta is None:
            return 0  # some time_delta is None

        if truth_time_delta <= 0.02 and msg_time_delta <= 0.02:
            # if chord - as long as tight enough, counts as no deviation
            return 0

        # (0.3 / 0.25) x 100 = 1.2 x 100 = 120
        #  OR
        # (0.2 / 0.25) x 100 = 0.8 x 100 = 80
        deltas_ratio = round5((msg_time_delta / truth_time_delta) * 100)
        # abs(100 - 120) = 20.0 || OR || abs(100 - 80) = 20.0
        return round5(abs(100 - deltas_ratio))

    # TODO: unused
    """def set_is_correct_rhythm(self, allowed_rhythm_deviation: int):
        try:
            # 20 < 40 = True
            self._is_rhythm_correct = self._rhythm_deviation < allowed_rhythm_deviation
        except TypeError as e:
            logger.log(dict(allowed_rhythm_deviation=allowed_rhythm_deviation,
                            self=self,
                            e=e), title="TypeError (Hit.set_is_correct_rhythm())")
            raise e
        return self._is_rhythm_correct"""

    def are_accuracy_and_rhythm_correct(self) -> bool:
        return self.is_accuracy_correct and self._is_rhythm_correct

    def get_mistake_kind(self) -> str or None:
        if not self.is_accuracy_correct:
            return "accuracy"
        if not self._is_rhythm_correct:
            return "rhythm"
        return None

    def __str__(self) -> str:
        return f'is_accuracy_correct: {self.is_accuracy_correct} | _rhythm_deviation: {self._rhythm_deviation} | _is_rhythm_correct: {self._is_rhythm_correct}'

    def __repr__(self) -> str:
        return self.__str__()

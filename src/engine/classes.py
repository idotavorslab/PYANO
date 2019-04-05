from util import round5, Logger
import re
from typing import Dict, List, Tuple, Any
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
            self.time_delta = round5(self.time - preceding_message_time)
        else:
            self.time_delta = None

    def __str__(self) -> str:
        return f'time: {self.time} | note: {self.note} | velocity: {self.velocity} | time_delta: {self.time_delta} | kind: {self.kind}'

    def __repr__(self) -> str:
        return self.__str__()

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

    # @staticmethod
    # def from_mido_to_line(mido_msg, t=None) -> str:
    #     s = f'note={mido_msg.note}\tvelocity={mido_msg.velocity}'
    #     if not t:
    #         return s
    #     else:
    #         return f'{t}\t{s}'

    def to_line(self):
        s = f'{self.time}\tnote={self.note}\tvelocity={self.velocity}\t{self.kind}\n'
        return s

    @staticmethod
    def construct_many(lines: List[str]) -> []:
        container = [Message(lines[0])]
        for i, line in enumerate(lines[1:]):
            preceding_message_time = container[i].time
            container.append(Message(line, preceding_message_time))
        return container

    @staticmethod
    def construct_many_from_file(file_path: str) -> List:
        Message._raise_if_bad_file(file_path)
        with open(file_path, mode="r") as f:
            messages = Message.construct_many(f.readlines())
        return messages

    @staticmethod
    def get_chords(messages) -> Dict[int, List[int]]:
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
    def normalize_simultaneous_hits_in_file(file_path: str):
        from copy import deepcopy
        messages = Message.construct_many_from_file(file_path)
        chords = Message.get_chords(messages)

        should_write_changes = False
        for root, rest in chords.items():
            """Overwrite chord messages so they are sorted by note, all timed according to lowest pitch note, and share the time delta and preceding message time data of the first-played note"""
            chord_indices: List[int] = [root, *rest]
            chord_messages = [deepcopy(messages)[i] for i in chord_indices]
            sorted_chord_messages = sorted(deepcopy(chord_messages), key=lambda msg: msg.note)
            already_sorted = chord_messages == sorted_chord_messages
            if already_sorted:
                continue

            # not sorted
            should_write_changes = True
            for i, msg_i in enumerate(chord_indices):
                messages[msg_i].note = sorted_chord_messages[i].note
                messages[msg_i].velocity = sorted_chord_messages[i].velocity

        if should_write_changes:
            with open(file_path, mode="w") as f:
                for msg in messages:
                    msg_line = msg.to_line()
                    f.write(msg_line)
                # lines = [msg.to_line() for msg in messages]
                # for line in lines:
                #     f.write(f'{line}\n')
        return messages


class Hit:
    def __init__(self, msg: Message, truth: Message):
        self.is_correct_note = msg.note == truth.note
        if msg.time_delta and truth.time_delta:
            if truth.time_delta <= 0.02 and msg.time_delta <= 0.02:
                # if chord - as long as tight enough, counts as no deviation
                self._actual_timing_deviation = 0
            else:
                # (0.3 / 0.25) x 100 = 1.2 x 100 = 120
                ratio = round5((msg.time_delta / truth.time_delta) * 100)
                # abs(100 - 120) = 20
                self._actual_timing_deviation = round5(abs(100 - ratio))
        else:  # some time_delta is None
            self._actual_timing_deviation = 0
        self._is_correct_timing = True

    def set_is_correct_timing(self, allowed_tempo_deviation_factor: int):
        try:
            # 20 < 40 = True
            self._is_correct_timing = self._actual_timing_deviation < allowed_tempo_deviation_factor
        except TypeError as e:
            logger.log(dict(allowed_tempo_deviation_factor=allowed_tempo_deviation_factor,
                            self=self,
                            e=e), title="TypeError (Hit.set_is_correct_timing())")
            raise e
        return self._is_correct_timing

    def note_and_timing_correct(self) -> bool:
        return self.is_correct_note and self._is_correct_timing

    def get_mistake_kind(self) -> str or None:
        if not self.is_correct_note:
            return "note"
        if not self._is_correct_timing:
            return "timing"
        return None

    def __str__(self) -> str:
        return f'is_correct_note: {self.is_correct_note} | _actual_timing_deviation: {self._actual_timing_deviation} | _is_correct_timing: {self._is_correct_timing}'

    def __repr__(self) -> str:
        return self.__str__()

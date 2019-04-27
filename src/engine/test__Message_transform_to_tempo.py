from InsideTest.check_done_trial import estimate_tempo_percentage
from classes import Message

msgs_no_chords = Message.init_many(dict(time=1000000000, note=10, velocity=100, kind='on'),
                                   dict(time=1000000001, note=20, velocity=100, kind='on'),
                                   dict(time=1000000002, note=30, velocity=100, kind='on'),
                                   dict(time=1000000003, note=40, velocity=100, kind='on'),
                                   )

msgs_with_chords = Message.init_many(dict(time=1000000000, note=10, velocity=100, kind='on'),
                                     dict(time=1000000001, note=20, velocity=100, kind='on'),
                                     dict(time=1000000001.05, note=25, velocity=100, kind='on'),
                                     dict(time=1000000001.08, note=30, velocity=100, kind='on'),
                                     dict(time=1000000002, note=30, velocity=100, kind='on'),
                                     dict(time=1000000003, note=40, velocity=100, kind='on'),
                                     )
tempoed_msgs_no_chords = Message.transform_to_tempo(msgs_no_chords, 120)
tempoed_msgs_with_chords = Message.transform_to_tempo(msgs_with_chords, 120)

no_chords_tempo_estimation = estimate_tempo_percentage(tempoed_msgs_no_chords, msgs_no_chords, len(msgs_no_chords))
with_chords_tempo_estimation = estimate_tempo_percentage(tempoed_msgs_with_chords, msgs_with_chords,
                                                         len(msgs_with_chords))
no_chords_expected_original = Message.transform_to_tempo(tempoed_msgs_no_chords, 10000 / no_chords_tempo_estimation)
with_chords_expected_original = Message.transform_to_tempo(tempoed_msgs_with_chords,
                                                           10000 / with_chords_tempo_estimation)
assert no_chords_expected_original == msgs_no_chords
assert with_chords_expected_original == msgs_with_chords

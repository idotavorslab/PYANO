from classes import Message

on_file = r'c:\Sync\Code\Python\Pyano-release\src\experiments\truths\magnet_prelude_8s_on.txt'
output_path = r'c:\Sync\Code\Python\Pyano-release\src\experiments\truths\magnet_prelude_7500ms_on.txt'
accelerate_factor = 0.9375
msgs = Message.construct_many_from_file(on_file)

tempoed = Message.transform_to_tempo(msgs, accelerate_factor * 100)
with open(output_path, mode="w") as f:
    for msg in tempoed:
        msg_line = msg.to_line()
        f.write(msg_line)

from classes import Message

file_path = r'c:\Sync\Code\Python\Pyano-release\src\experiments\subjects\tests\fur_elise_B_on.txt'
normalized_msgs, is_normalized = Message.is_file_chord_normalized(file_path)
print()

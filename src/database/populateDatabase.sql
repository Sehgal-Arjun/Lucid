INSERT INTO Moods (mood_id, name, emoji) VALUES
  (1, 'Happy', '😊'),
  (2, 'Sad',   '😢'),
  (3, 'Angry', '😠');

INSERT INTO JournalEntries (entry_id, uid, entry_date, content, mood_id) VALUES
  (1, 1, '2024-06-01', 'Had a great day at the park.', 1),
  (2, 2, '2024-06-01', 'Felt a bit down today.', 2);

INSERT INTO EntryTags (tag_id, entry_id, name) VALUES
  (1, 1, 'outdoors'),
  (2, 2, 'mood');

INSERT INTO Images (image_id, entry_id, file_path, caption) VALUES
  (1, 1, 'alice/2024-06-01/pic1.jpg', 'At the park'),
  (2, 2, 'bob/2024-06-01/pic2.jpg', 'Feeling blue');
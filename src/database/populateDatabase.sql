INSERT INTO JournalEntries (entry_id, uid, entry_date, content, mood) VALUES
  (1, 1, '2024-06-01', 'Had a great day at the park.', 'Happy'),
  (2, 2, '2024-06-01', 'Felt a bit down today.', 'Sad'),
  (3, 1, '2024-06-02', 'Worked on my project and felt productive.', 'Productive'),
  (4, 3, '2024-06-01', 'Went hiking in the mountains.', 'Adventurous'),
  (5, 2, '2024-06-02', 'Read a good book and relaxed.', 'Relaxed');

INSERT INTO EntryTags (tag_id, entry_id, name) VALUES
  (1, 1, 'outdoors'),
  (2, 2, 'mood'),
  (3, 3, 'work'),
  (4, 3, 'productive'),
  (5, 4, 'hiking'),
  (6, 4, 'nature'),
  (7, 5, 'reading'),
  (8, 5, 'relaxation');

INSERT INTO Images (image_id, entry_id, file_path, caption) VALUES
  (1, 1, 'https://media.istockphoto.com/id/157675185/photo/central-park-in-new-york-city.jpg?s=612x612&w=0&k=20&c=W0L68R6Hs4eqbrt3XTmJ_QKnd5buWR2ce0W3M7juez8=', 'At the park'),
  (2, 2, 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhUWXDQCAyUHhc0Q3G3E6vQPV1LET-Lb4qMfAwWx6Lpgt_xIHuy84On884vHXty1l_7RJ6sbZ-KgWH876GMNSQ0B_WmjD0KOUTJpmKwlt3J5q3bG9tS7eOuFPNWdjFEHpNu8sLpuNgcL9w/s1600/DSC00999.jpg', 'Feeling blue'),
  (3, 3, 'https://live.staticflickr.com/2377/2080297634_6640da9893_b.jpg', 'Project workspace'),
  (4, 4, 'https://www.outdoorguide.com/img/gallery/20-us-destinations-for-the-best-mountain-views-according-to-travelers/l-intro-1704830001.jpg', 'Mountain view'),
  (5, 5, 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxMTc3M3wwfDF8c2VhcmNofDF8fGxpYnJhcnl8ZW58MHx8fHwxNjU4NDAwNTQ4&ixlib=rb-1.2.1&q=80&w=2000', 'Reading time');
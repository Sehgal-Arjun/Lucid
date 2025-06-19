UPDATE JournalEntries
SET content = 'Visited the ROM--great day!', mood = 'happy'
WHERE uid = 1
AND entry_date = '2025-06-18';

SELECT * FROM JournalEntries;

SELECT je.entry_date, je.mood
FROM   JournalEntries je, EntryTags et
WHERE  je.entry_id   = et.entry_id
AND    je.uid        = 1
AND    et.name       = 'museum'
AND    je.entry_date >= '2025-06-01'
AND    je.entry_date <  '2025-07-01';

SELECT je.entry_id,
       je.content,
       je.mood,
       et.name,
       img.file_path
FROM   JournalEntries je
LEFT   JOIN EntryTags et  ON je.entry_id = et.entry_id
LEFT   JOIN Images    img ON je.entry_id = img.entry_id
WHERE  je.uid        = 1
AND    je.entry_date = '2025-06-18';

SELECT entry_date, mood
FROM   JournalEntries
WHERE  uid         = 1
AND  entry_date    >= '2025-06-01'
AND  entry_date    <  '2025-07-01';
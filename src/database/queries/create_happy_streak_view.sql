CREATE OR REPLACE VIEW public.v_happy_streaks AS
WITH RECURSIVE streak(uid, entry_date, len) AS (
  SELECT je.uid, je.entry_date, 1
  FROM JournalEntries je
  WHERE LOWER(je.mood) = 'happy'
    AND NOT EXISTS (
      SELECT 1
      FROM JournalEntries prev
      WHERE prev.uid        = je.uid
        AND prev.entry_date = je.entry_date - 1
        AND LOWER(prev.mood) = 'happy'
    )
  UNION ALL
  SELECT j.uid, j.entry_date, s.len + 1
  FROM JournalEntries j
  JOIN streak s
    ON j.uid        = s.uid
   AND j.entry_date = s.entry_date + 1
  WHERE LOWER(j.mood) = 'happy'
)
SELECT uid, MAX(len) AS longest_happy_streak
FROM streak
GROUP BY uid;

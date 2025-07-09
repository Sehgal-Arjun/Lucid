CREATE OR REPLACE FUNCTION get_longest_streak(user_id int)
RETURNS TABLE (longest_streak int) AS $$
WITH RECURSIVE streak(uid, entry_date, len) AS (
  SELECT je.uid, je.entry_date, 1
  FROM JournalEntries je
  WHERE je.uid = user_id
    AND NOT EXISTS (
      SELECT 1
      FROM JournalEntries prev
      WHERE prev.uid = je.uid
        AND prev.entry_date = je.entry_date - INTERVAL '1 day'
    )
  UNION ALL
  SELECT j.uid, j.entry_date, s.len + 1
  FROM JournalEntries j
  JOIN streak s
    ON j.uid = s.uid
   AND j.entry_date = s.entry_date + INTERVAL '1 day'
  WHERE j.uid = user_id
)
SELECT MAX(len) AS longest_streak
FROM streak
WHERE uid = user_id;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION get_current_streak(user_id int)
RETURNS TABLE (current_streak int) AS $$
WITH RECURSIVE streaks AS (
  SELECT
    je.uid,
    je.entry_date,
    1 AS streak_len
  FROM JournalEntries je
  WHERE je.uid = user_id
    AND je.entry_date = (
      SELECT MAX(entry_date) FROM JournalEntries WHERE uid = user_id
    )
  UNION ALL
  SELECT
    j.uid,
    j.entry_date,
    s.streak_len + 1
  FROM JournalEntries j
  JOIN streaks s
    ON j.uid = s.uid
   AND j.entry_date = s.entry_date - INTERVAL '1 day'
  WHERE j.uid = user_id
)
SELECT MAX(streak_len) AS current_streak FROM streaks;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION get_most_common_mood(user_id int)
RETURNS TABLE (mood text, mood_count int) AS $$
  SELECT mood, COUNT(*) AS mood_count
  FROM JournalEntries
  WHERE uid = user_id
  GROUP BY mood
  ORDER BY mood_count DESC
  LIMIT 1;
$$ LANGUAGE SQL;

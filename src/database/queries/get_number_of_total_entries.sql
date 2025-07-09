CREATE OR REPLACE FUNCTION get_total_entries(user_id int)
RETURNS TABLE (total_entries int) AS $$
  SELECT COUNT(*) AS total_entries
  FROM JournalEntries
  WHERE uid = user_id;
$$ LANGUAGE SQL;

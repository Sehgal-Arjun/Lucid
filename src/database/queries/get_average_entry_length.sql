CREATE OR REPLACE FUNCTION get_avg_entry_length(user_id int)
RETURNS TABLE (avg_entry_length float) AS $$
  SELECT AVG(LENGTH(content)) AS avg_entry_length
  FROM JournalEntries
  WHERE uid = user_id;
$$ LANGUAGE SQL;

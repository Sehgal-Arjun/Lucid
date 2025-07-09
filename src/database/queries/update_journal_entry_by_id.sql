CREATE OR REPLACE FUNCTION update_journal_entry_by_id(
  p_entry_id integer,
  p_content text,
  p_mood character varying
)
RETURNS TABLE (
  entry_id integer,
  uid integer,
  entry_date date,
  content text,
  mood character varying
) AS $$
BEGIN
  RETURN QUERY
  UPDATE journalentries
  SET content = p_content,
      mood = p_mood
  WHERE journalentries.entry_id = p_entry_id
  RETURNING journalentries.entry_id, journalentries.uid, journalentries.entry_date, journalentries.content, journalentries.mood;
END;
$$ LANGUAGE plpgsql; 
CREATE OR REPLACE FUNCTION public.filter_journal_entries(
  p_uid integer,
  p_mood character varying DEFAULT NULL,
  p_content text DEFAULT NULL,
  p_start_date date DEFAULT NULL,
  p_end_date date DEFAULT NULL,
  p_tag character varying DEFAULT NULL
)
RETURNS TABLE (
  entry_id integer,
  entry_date date,
  content text,
  mood character varying
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT je.entry_id, je.entry_date, je.content, je.mood
  FROM public.journalentries je
  LEFT JOIN public.entrytags et ON je.entry_id = et.entry_id
  WHERE je.uid = p_uid
    AND (p_mood IS NULL OR je.mood = p_mood)
    AND (
      p_content IS NULL
      OR to_tsvector('english', je.content) @@ plainto_tsquery('english', p_content)
      OR je.content ILIKE '%' || p_content || '%'
    )
    AND (p_start_date IS NULL OR je.entry_date >= p_start_date)
    AND (p_end_date IS NULL OR je.entry_date <= p_end_date)
    AND (p_tag IS NULL OR et.name = p_tag)
  ORDER BY je.entry_date DESC;
END;
$$ LANGUAGE plpgsql; 
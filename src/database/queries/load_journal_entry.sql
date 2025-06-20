create or replace function load_journal_entry(
  user_id int,
  entry_date_input date
)
returns table (
  entry_id int,
  uid int,
  entry_date date,
  content text,
  mood text
)
language sql
as $$
  select journalentries.entry_id, journalentries.uid, journalentries.entry_date, journalentries.content, journalentries.mood
  from journalentries
  where journalentries.uid = user_id 
    and journalentries.entry_date = entry_date_input;
$$;

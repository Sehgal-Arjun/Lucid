create or replace function save_journal_entry(
  user_id int,
  entry_date_input date,
  content_input text,
  mood_input text
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
  insert into journalentries (uid, entry_date, content, mood)
  values (user_id, entry_date_input, content_input, mood_input)
  on conflict (uid, entry_date)
  do update set 
    content = excluded.content,
    mood = excluded.mood
  returning journalentries.entry_id, journalentries.uid, journalentries.entry_date, journalentries.content, journalentries.mood;
$$;

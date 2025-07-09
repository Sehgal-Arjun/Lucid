create or replace function get_entries_in_range(
  user_id int,
  start_date date,
  end_date date
)
returns table (
  entry_id int,
  uid int,
  entry_date date,
  content text,
  mood text
) as $$
  select entry_id, uid, entry_date, content, mood
  from journalentries
  where uid = user_id
    and entry_date between start_date and end_date
  order by entry_date;
$$ language sql;

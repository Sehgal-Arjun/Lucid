create or replace function get_moods_by_month(
  user_id int,
  start_date date,
  end_date date
)
returns table (
  entry_date date,
  mood text
) as $$
  select entry_date, mood
  from journalentries
  where uid = user_id
    and entry_date between start_date and end_date;
$$ language sql;

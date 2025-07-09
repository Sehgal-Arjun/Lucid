-- Function to read from the monthly mood materialized view
create or replace function get_monthly_mood_summary(
  user_id int,
  start_date date,
  end_date date
)
returns table (
  month date,
  mood text,
  mood_count int
)
language sql
as $$
  select month, mood, mood_count
  from mv_monthly_mood
  where uid = user_id
    and month between date_trunc('month', start_date) and date_trunc('month', end_date)
  order by month, mood;
$$;

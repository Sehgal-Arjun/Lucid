-- Materialized view summarizing mood counts per user per month
create materialized view mv_monthly_mood as
select
  uid,
  date_trunc('month', entry_date) as month,
  mood,
  count(*) as mood_count
from journalentries
group by uid, month, mood;

create index idx_mv_monthly_mood_uid_month
  on mv_monthly_mood (uid, month);

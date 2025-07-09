-- Utility function to refresh the monthly mood materialized view
create or replace function refresh_mv_monthly_mood()
returns void language plpgsql as $$
begin
  refresh materialized view mv_monthly_mood;
end;
$$;

-- Standardizes "today" on the Mexico City calendar day (fixed America/Mexico_City,
-- matching src/lib/reminders.ts's getMexicoCityDate) instead of current_date, which
-- follows the database session's timezone (UTC by default on Supabase) — the same
-- class of bug already fixed on the application side (CheckinButton, achievements.ts,
-- MonthCalendar, page.tsx, AddWeightForm, ProgressPhotos).

alter table public.profiles
  alter column protocol_start_date set default ((now() at time zone 'America/Mexico_City')::date);

create or replace function public.reset_protocol()
returns void
language plpgsql
security invoker
as $$
begin
  delete from public.checkins where user_id = auth.uid();
  update public.profiles
    set protocol_start_date = (now() at time zone 'America/Mexico_City')::date
    where id = auth.uid();
end;
$$;

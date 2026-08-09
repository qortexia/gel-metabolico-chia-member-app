alter table public.profiles
  add column if not exists reminders_enabled boolean not null default true;

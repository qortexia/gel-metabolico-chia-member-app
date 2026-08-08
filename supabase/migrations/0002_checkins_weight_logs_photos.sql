create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.checkins enable row level security;

create policy "checkins_select_own"
  on public.checkins for select
  using (auth.uid() = user_id);

create policy "checkins_insert_own"
  on public.checkins for insert
  with check (auth.uid() = user_id);

create policy "checkins_delete_own"
  on public.checkins for delete
  using (auth.uid() = user_id);

create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  peso numeric not null,
  date date not null,
  created_at timestamptz not null default now()
);

alter table public.weight_logs enable row level security;

create policy "weight_logs_select_own"
  on public.weight_logs for select
  using (auth.uid() = user_id);

create policy "weight_logs_insert_own"
  on public.weight_logs for insert
  with check (auth.uid() = user_id);

create table if not exists public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  taken_at date not null,
  created_at timestamptz not null default now()
);

alter table public.progress_photos enable row level security;

create policy "progress_photos_select_own"
  on public.progress_photos for select
  using (auth.uid() = user_id);

create policy "progress_photos_insert_own"
  on public.progress_photos for insert
  with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

create policy "progress_photos_storage_select_own"
  on storage.objects for select
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "progress_photos_storage_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

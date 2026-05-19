-- Optional: run in Supabase SQL Editor to save cycle settings per user (syncs across devices).
-- If you skip this, the app still works — settings are stored in the browser only.

create table if not exists public.user_cycle_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_period_start date,
  cycle_length int not null default 28 check (cycle_length >= 21 and cycle_length <= 45),
  period_length int not null default 5 check (period_length >= 2 and period_length <= 10),
  updated_at timestamptz default now()
);

alter table public.user_cycle_profile enable row level security;

create policy "Users can read own cycle profile"
  on public.user_cycle_profile for select
  using (auth.uid() = user_id);

create policy "Users can insert own cycle profile"
  on public.user_cycle_profile for insert
  with check (auth.uid() = user_id);

create policy "Users can update own cycle profile"
  on public.user_cycle_profile for update
  using (auth.uid() = user_id);

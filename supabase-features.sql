-- Optional: run in Supabase SQL Editor for budget, recurring expenses, and cycle logs sync.
-- App works without this — features fall back to localStorage.

-- Monthly budget per user
create table if not exists public.user_budget (
  user_id uuid primary key references auth.users(id) on delete cascade,
  monthly_budget decimal(10,2),
  updated_at timestamptz default now()
);

alter table public.user_budget enable row level security;

create policy "Users can read own budget"
  on public.user_budget for select using (auth.uid() = user_id);
create policy "Users can insert own budget"
  on public.user_budget for insert with check (auth.uid() = user_id);
create policy "Users can update own budget"
  on public.user_budget for update using (auth.uid() = user_id);

-- Recurring expense templates
create table if not exists public.recurring_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount decimal(10,2) not null,
  category text not null,
  description text default '',
  day_of_month int not null check (day_of_month >= 1 and day_of_month <= 31),
  active boolean not null default true,
  created_at timestamptz default now()
);

create index if not exists idx_recurring_expenses_user on public.recurring_expenses(user_id);
alter table public.recurring_expenses enable row level security;

create policy "Users can read own recurring"
  on public.recurring_expenses for select using (auth.uid() = user_id);
create policy "Users can insert own recurring"
  on public.recurring_expenses for insert with check (auth.uid() = user_id);
create policy "Users can update own recurring"
  on public.recurring_expenses for update using (auth.uid() = user_id);
create policy "Users can delete own recurring"
  on public.recurring_expenses for delete using (auth.uid() = user_id);

-- Daily cycle mood & symptom logs
create table if not exists public.cycle_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  mood int check (mood >= 1 and mood <= 5),
  symptoms text[] default '{}',
  note text default '',
  unique(user_id, log_date)
);

create index if not exists idx_cycle_logs_user_date on public.cycle_logs(user_id, log_date);
alter table public.cycle_logs enable row level security;

create policy "Users can read own cycle logs"
  on public.cycle_logs for select using (auth.uid() = user_id);
create policy "Users can insert own cycle logs"
  on public.cycle_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own cycle logs"
  on public.cycle_logs for update using (auth.uid() = user_id);
create policy "Users can delete own cycle logs"
  on public.cycle_logs for delete using (auth.uid() = user_id);

-- Reminder preferences
create table if not exists public.cycle_reminders (
  user_id uuid primary key references auth.users(id) on delete cascade,
  period_reminder boolean default true,
  period_days_before int default 2,
  ovulation_reminder boolean default false,
  updated_at timestamptz default now()
);

alter table public.cycle_reminders enable row level security;

create policy "Users can read own reminders"
  on public.cycle_reminders for select using (auth.uid() = user_id);
create policy "Users can insert own reminders"
  on public.cycle_reminders for insert with check (auth.uid() = user_id);
create policy "Users can update own reminders"
  on public.cycle_reminders for update using (auth.uid() = user_id);

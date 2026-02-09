-- Run this in Supabase SQL Editor (Dashboard → SQL Editor) to create tables and RLS.
-- Then your expenses and categories will sync across all devices for each user.

-- Expenses table: one row per expense
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  amount decimal(10,2) not null,
  category text not null,
  description text default '',
  created_at timestamptz default now()
);

-- User custom categories (in addition to defaults)
create table if not exists public.user_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  unique(user_id, category)
);

-- Indexes for faster queries
create index if not exists idx_expenses_user_date on public.expenses(user_id, date);
create index if not exists idx_user_categories_user on public.user_categories(user_id);

-- Row Level Security: users can only see/edit their own data
alter table public.expenses enable row level security;
alter table public.user_categories enable row level security;

-- Expenses policies
create policy "Users can read own expenses"
  on public.expenses for select
  using (auth.uid() = user_id);

create policy "Users can insert own expenses"
  on public.expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own expenses"
  on public.expenses for update
  using (auth.uid() = user_id);

create policy "Users can delete own expenses"
  on public.expenses for delete
  using (auth.uid() = user_id);

-- User categories policies
create policy "Users can read own categories"
  on public.user_categories for select
  using (auth.uid() = user_id);

create policy "Users can insert own categories"
  on public.user_categories for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own categories"
  on public.user_categories for delete
  using (auth.uid() = user_id);

-- MindForge Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'premium', 'pro')),
  assessment_completed boolean default false,
  onboarding_completed boolean default false
);

-- Cognitive profiles
create table public.cognitive_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade unique not null,
  memory_score integer default 50,
  memory_difficulty integer default 1,
  attention_score integer default 50,
  attention_difficulty integer default 1,
  speed_score integer default 50,
  speed_difficulty integer default 1,
  problem_solving_score integer default 50,
  problem_solving_difficulty integer default 1,
  flexibility_score integer default 50,
  flexibility_difficulty integer default 1,
  overall_score integer default 50,
  strongest_domain text default 'memory',
  weakest_domain text default 'memory',
  last_assessment_date timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Game sessions
create table public.game_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  game_id text not null,
  domain text not null,
  score integer not null,
  accuracy numeric(5,2) not null,
  average_reaction_time numeric(10,2),
  difficulty integer not null,
  duration integer not null, -- in seconds
  rounds_completed integer not null,
  perfect_rounds integer default 0,
  streak integer default 0,
  completed_at timestamp with time zone default timezone('utc'::text, now()),
  session_data jsonb
);

-- Daily training plans
create table public.daily_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  date date not null,
  games jsonb not null,
  completed boolean default false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, date)
);

-- Streaks
create table public.streaks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade unique not null,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_training_date date
);

-- Progress snapshots (for historical tracking)
create table public.progress_snapshots (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  date date not null,
  memory_score integer not null,
  attention_score integer not null,
  speed_score integer not null,
  problem_solving_score integer not null,
  flexibility_score integer not null,
  overall_score integer not null,
  games_played integer default 0,
  training_minutes integer default 0,
  unique(user_id, date)
);

-- Achievements
create table public.achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  achievement_id text not null,
  unlocked_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, achievement_id)
);

-- Create indexes for better query performance
create index idx_game_sessions_user_id on public.game_sessions(user_id);
create index idx_game_sessions_completed_at on public.game_sessions(completed_at);
create index idx_game_sessions_game_id on public.game_sessions(game_id);
create index idx_daily_plans_user_date on public.daily_plans(user_id, date);
create index idx_progress_snapshots_user_date on public.progress_snapshots(user_id, date);

-- Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.cognitive_profiles enable row level security;
alter table public.game_sessions enable row level security;
alter table public.daily_plans enable row level security;
alter table public.streaks enable row level security;
alter table public.progress_snapshots enable row level security;
alter table public.achievements enable row level security;

-- Policies: Users can only access their own data
create policy "Users can view own data" on public.users for select using (auth.uid() = id);
create policy "Users can update own data" on public.users for update using (auth.uid() = id);

create policy "Users can view own profile" on public.cognitive_profiles for select using (auth.uid() = user_id);
create policy "Users can insert own profile" on public.cognitive_profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own profile" on public.cognitive_profiles for update using (auth.uid() = user_id);

create policy "Users can view own sessions" on public.game_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own sessions" on public.game_sessions for insert with check (auth.uid() = user_id);

create policy "Users can view own plans" on public.daily_plans for select using (auth.uid() = user_id);
create policy "Users can insert own plans" on public.daily_plans for insert with check (auth.uid() = user_id);
create policy "Users can update own plans" on public.daily_plans for update using (auth.uid() = user_id);

create policy "Users can view own streaks" on public.streaks for select using (auth.uid() = user_id);
create policy "Users can insert own streaks" on public.streaks for insert with check (auth.uid() = user_id);
create policy "Users can update own streaks" on public.streaks for update using (auth.uid() = user_id);

create policy "Users can view own progress" on public.progress_snapshots for select using (auth.uid() = user_id);
create policy "Users can insert own progress" on public.progress_snapshots for insert with check (auth.uid() = user_id);

create policy "Users can view own achievements" on public.achievements for select using (auth.uid() = user_id);
create policy "Users can insert own achievements" on public.achievements for insert with check (auth.uid() = user_id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);

  insert into public.cognitive_profiles (user_id)
  values (new.id);

  insert into public.streaks (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update cognitive profile timestamp
create or replace function public.update_cognitive_profile_timestamp()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_cognitive_profile_timestamp
  before update on public.cognitive_profiles
  for each row execute procedure public.update_cognitive_profile_timestamp();

-- Movbe Option B Core Schema (PostgreSQL + Supabase Auth)
-- Covers C1-C7, P5, P6 (recursive attribution), P11, P12 (voice library), and Waitlist

create extension if not exists "pgcrypto";

-- 1. Public user profiles synced with Supabase Auth (auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text,
  avatar_url text,
  role text not null default 'normal',
  plan_tier text not null default 'free' check (plan_tier in ('free', 'personal', 'pro', 'business', 'enterprise')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- 2. Sharer Voice Library (C7 / Proposal P12)
create table if not exists public.audio_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  audio_url text not null,
  duration_sec numeric(5,2) not null default 0,
  transcript text,
  created_at timestamptz not null default now()
);

create index if not exists idx_audio_templates_user on public.audio_templates(user_id);

alter table public.audio_templates enable row level security;

create policy "Users manage their own audio templates"
  on public.audio_templates for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3. Canonical Shares & Previews (C3 / C4 / C6 / P3 / P5 / P8 / P9 / P11)
create table if not exists public.shares (
  id uuid primary key default gen_random_uuid(),
  short_id text not null unique,
  sharer_id uuid references public.profiles(id) on delete set null,
  parent_share_id uuid references public.shares(id) on delete set null, -- P6 multi-hop chain
  original_url text not null,
  title text not null default '',
  description text not null default '',
  source_thumbnail_url text,
  segment_start numeric(8,2) not null default 0,
  segment_end numeric(8,2) not null default 8,
  audio_url text,
  audio_duration_sec numeric(5,2),
  transcript text,
  -- Canonical multi-format assets (<300KB for WhatsApp/Telegram/iMessage):
  -- { "webp": "...", "mp4": "...", "gif": "...", "jpgWaveform": "..." }
  assets jsonb not null default '{}'::jsonb,
  -- Vertical CTA config (P8) & recipient personalization (P3)
  options jsonb not null default '{}'::jsonb,
  expires_at timestamptz, -- P9 expiring previews
  status text not null default 'processing' check (status in ('processing', 'ready', 'failed')),
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists idx_shares_short_id on public.shares(short_id);
create index if not exists idx_shares_sharer_id on public.shares(sharer_id);
create index if not exists idx_shares_parent_id on public.shares(parent_share_id);

alter table public.shares enable row level security;

create policy "Shares are publicly readable for OG unfurling and tap-to-reveal"
  on public.shares for select using (true);

create policy "Authenticated users can create their own shares"
  on public.shares for insert
  with check (auth.uid() = sharer_id);

create policy "Sharers can update their own shares"
  on public.shares for update
  using (auth.uid() = sharer_id);

-- 4. Share Events & Attribution Tracking (C6 / P6)
create table if not exists public.share_events (
  id bigserial primary key,
  share_id uuid not null references public.shares(id) on delete cascade,
  event_type text not null check (event_type in ('preview_view', 'tap', 'reshare', 'cta_click')),
  recipient_token text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_share_events_share_id on public.share_events(share_id);
create index if not exists idx_share_events_type on public.share_events(event_type);

alter table public.share_events enable row level security;

create policy "Anyone can record share events"
  on public.share_events for insert with check (true);

create policy "Sharers can read events for their own shares"
  on public.share_events for select
  using (
    exists (
      select 1 from public.shares s
      where s.id = share_events.share_id and s.sharer_id = auth.uid()
    )
  );

-- 5. Recursive Multi-Hop Attribution Query (P6)
create or replace function public.get_share_chain(target_share_id uuid)
returns table (
  id uuid,
  short_id text,
  sharer_id uuid,
  parent_share_id uuid,
  audio_url text,
  hop integer,
  created_at timestamptz
)
language sql
stable
as $$
  with recursive chain as (
    select s.id, s.short_id, s.sharer_id, s.parent_share_id, s.audio_url, 0 as hop, s.created_at
    from public.shares s
    where s.id = target_share_id
    union all
    select child.id, child.short_id, child.sharer_id, child.parent_share_id, child.audio_url, c.hop + 1, child.created_at
    from public.shares child
    join chain c on child.parent_share_id = c.id
  )
  select * from chain order by hop asc, created_at asc;
$$;

-- 6. Rompehielo Waitlist (migrated from Firestore waitlist)
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  role text not null default 'user',
  answers text default '',
  privacy_accepted boolean not null default false,
  promotional_consent boolean not null default false,
  source text not null default 'rompehielo_waitlist_form',
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

create policy "Anyone can join waitlist"
  on public.waitlist for insert with check (true);

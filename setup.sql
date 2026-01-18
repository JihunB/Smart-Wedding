-- 1. Create Tables

-- Profiles (Linked to Supabase Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  created_at timestamptz default now()
);

-- Weddings (The core tenant entity)
create table public.weddings (
  id uuid default gen_random_uuid() primary key,
  host_id uuid references public.profiles(id) not null,
  slug text not null unique,
  groom_name text not null,
  bride_name text not null,
  wedding_date date not null,
  location text,
  welcome_message text,
  created_at timestamptz default now()
);

-- Photos (Dual-track storage)
create table public.photos (
  id uuid default gen_random_uuid() primary key,
  wedding_id uuid references public.weddings(id) not null,
  uploader_name text not null, -- Guest nickname
  original_url text not null, -- High-res R2 URL
  display_url text not null, -- Compressed WebP R2 URL
  is_hidden boolean default false,
  created_at timestamptz default now()
);

-- Guestbooks
create table public.guestbooks (
  id uuid default gen_random_uuid() primary key,
  wedding_id uuid references public.weddings(id) not null,
  writer_name text not null,
  message text not null,
  created_at timestamptz default now()
);

-- 2. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.weddings enable row level security;
alter table public.photos enable row level security;
alter table public.guestbooks enable row level security;

-- 3. RLS Policies

-- Profiles: Users can view and edit their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Weddings: Public read (for slug access), Host insert/update
create policy "Weddings are public to read" on public.weddings
  for select using (true);

create policy "Hosts can create weddings" on public.weddings
  for insert with check (auth.uid() = host_id);

create policy "Hosts can update their weddings" on public.weddings
  for update using (auth.uid() = host_id);

-- Photos: Public read, Public insert (Guests), Host update/delete
create policy "Photos are viewable by everyone" on public.photos
  for select using (true);

create policy "Anyone can upload photos" on public.photos
  for insert with check (true);

create policy "Hosts can manage photos" on public.photos
  for all using (
    exists (
      select 1 from public.weddings
      where weddings.id = photos.wedding_id
      and weddings.host_id = auth.uid()
    )
  );

-- Guestbooks: Public read, Public insert
create policy "Guestbook entries are viewable by everyone" on public.guestbooks
  for select using (true);

create policy "Anyone can sign guestbook" on public.guestbooks
  for insert with check (true);

-- 4. Realtime Setup
-- Enable listening to the photos table for the Live Feed
alter publication supabase_realtime add table public.photos;
-- ============================================================
-- Run this in: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- TABLES

create table public.boarders (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

create table public.stays (
  id           uuid primary key default gen_random_uuid(),
  boarder_id   uuid not null references public.boarders(id) on delete cascade,
  pet_name     text not null,
  pet_photo    text,
  note         text,
  start_date   date not null,
  end_date     date,
  status       text not null default 'active' check (status in ('active','completed')),
  share_token  text not null unique,
  created_at   timestamptz not null default now()
);

create index stays_boarder_id_idx on public.stays(boarder_id);
create index stays_share_token_idx on public.stays(share_token);

create table public.uploads (
  id          uuid primary key default gen_random_uuid(),
  stay_id     uuid not null references public.stays(id) on delete cascade,
  type        text not null default 'photo' check (type in ('photo','video')),
  file_url    text not null,
  thumbnail   text,
  caption     text,
  created_at  timestamptz not null default now()
);

create index uploads_stay_id_idx on public.uploads(stay_id);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.boarders enable row level security;
alter table public.stays    enable row level security;
alter table public.uploads  enable row level security;

-- boarders: each user can only write their own row
create policy "boarders: own row only"
  on public.boarders for all
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- boarders: public read (name + avatar shown on owner feed)
create policy "boarders: public read"
  on public.boarders for select
  using (true);

-- stays: boarder manages their own stays
create policy "stays: boarder manages"
  on public.stays for all
  using  (auth.uid() = boarder_id)
  with check (auth.uid() = boarder_id);

-- stays: public read (owner feed — security via unguessable share_token)
create policy "stays: public read"
  on public.stays for select
  using (true);

-- uploads: boarder manages uploads for their own stays
create policy "uploads: boarder manages via stay"
  on public.uploads for all
  using  (exists (
    select 1 from public.stays
    where stays.id = uploads.stay_id
      and stays.boarder_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.stays
    where stays.id = uploads.stay_id
      and stays.boarder_id = auth.uid()
  ));

-- uploads: public read (owner feed)
create policy "uploads: public read"
  on public.uploads for select
  using (true);


-- ============================================================
-- TRIGGER: auto-create boarders row on sign-up
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.boarders (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
-- STORAGE POLICIES
-- Run these separately after creating the 'stay-media' bucket
-- (Dashboard > Storage > New bucket: name=stay-media, Public=Yes)
-- Then: Storage > stay-media > Policies > New policy > Custom
-- ============================================================

-- Allow authenticated boarder to upload into their own stay folder
-- Path: stays/{stay_id}/{filename}
create policy "boarder can upload to own stay"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'stay-media'
    and (storage.foldername(name))[1] = 'stays'
    and exists (
      select 1 from public.stays
      where stays.id::text = (storage.foldername(name))[2]
        and stays.boarder_id = auth.uid()
    )
  );

-- Allow boarder to manage their own profile avatar
-- Path: profiles/{user_id}/avatar.jpg
create policy "boarder can manage own avatar"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'stay-media'
    and name like 'profiles/' || auth.uid()::text || '/%'
  )
  with check (
    bucket_id = 'stay-media'
    and name like 'profiles/' || auth.uid()::text || '/%'
  );

-- Public read for all files in the bucket
create policy "public read stay-media"
  on storage.objects for select
  using (bucket_id = 'stay-media');

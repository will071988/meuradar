-- MeuRadar — Sprint 2 schema
-- Execute no SQL Editor do Supabase (https://supabase.com/dashboard).

-- Perfis (1:1 com auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Preferências do usuário
create table if not exists public.preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  interests text[] default array['clima','noticias','mercado','esportes'],
  city text default 'Rio de Janeiro, RJ',
  team text default 'Flamengo',
  notify_email boolean default true,
  notify_push boolean default true,
  updated_at timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.preferences enable row level security;

drop policy if exists "profiles_owner" on public.profiles;
create policy "profiles_owner" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "preferences_owner" on public.preferences;
create policy "preferences_owner" on public.preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Trigger: cria profile + preferences ao cadastrar
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)))
  on conflict (id) do update set email = excluded.email, updated_at = now();

  insert into public.preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

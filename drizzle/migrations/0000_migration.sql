create type public.app_role as enum ('admin');
create type public.application_status as enum ('pending','accepted','waitlisted','rejected');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "Users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create table public.registration_settings (
  id int primary key default 1 check (id = 1),
  is_open boolean not null default false,
  capacity int not null default 100 check (capacity > 0 and capacity <= 10000),
  waitlist_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);
insert into public.registration_settings (id) values (1);
grant select on public.registration_settings to anon, authenticated;
grant update on public.registration_settings to authenticated;
grant all on public.registration_settings to service_role;
alter table public.registration_settings enable row level security;
create policy "Anyone reads settings" on public.registration_settings for select to anon, authenticated using (true);
create policy "Admins update settings" on public.registration_settings for update to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  university text not null,
  major text not null,
  consent boolean not null,
  status public.application_status not null default 'pending',
  created_at timestamptz not null default now()
);
create unique index applications_email_unique on public.applications (lower(email));
grant select, update, delete on public.applications to authenticated;
grant all on public.applications to service_role;
alter table public.applications enable row level security;
create policy "Admins read applications" on public.applications for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins update applications" on public.applications for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admins delete applications" on public.applications for delete to authenticated using (public.has_role(auth.uid(),'admin'));

-- Public submission goes only through this validated function
create or replace function public.submit_application(
  _full_name text, _email text, _phone text, _university text, _major text, _consent boolean)
returns text language plpgsql security definer set search_path = public
as $$
declare s public.registration_settings; taken int; new_status public.application_status;
begin
  select * into s from public.registration_settings where id = 1 for update;
  if not s.is_open then raise exception 'REGISTRATION_CLOSED'; end if;
  _full_name := btrim(_full_name); _email := lower(btrim(_email)); _phone := btrim(_phone);
  _university := btrim(_university); _major := btrim(_major);
  if _consent is not true then raise exception 'CONSENT_REQUIRED'; end if;
  if char_length(_full_name) < 3 or char_length(_full_name) > 120 then raise exception 'INVALID_NAME'; end if;
  if char_length(_email) > 255 or _email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'INVALID_EMAIL'; end if;
  if _phone !~ '^\+?[0-9]{9,15}$' then raise exception 'INVALID_PHONE'; end if;
  if char_length(_university) < 2 or char_length(_university) > 150 then raise exception 'INVALID_UNIVERSITY'; end if;
  if char_length(_major) < 2 or char_length(_major) > 150 then raise exception 'INVALID_MAJOR'; end if;
  if exists (select 1 from public.applications where lower(email) = _email) then raise exception 'DUPLICATE_EMAIL'; end if;
  select count(*) into taken from public.applications where status in ('pending','accepted');
  if taken >= s.capacity then
    if not s.waitlist_enabled then raise exception 'CAPACITY_FULL'; end if;
    new_status := 'waitlisted';
  else new_status := 'pending'; end if;
  insert into public.applications (full_name,email,phone,university,major,consent,status)
  values (_full_name,_email,_phone,_university,_major,true,new_status);
  return new_status::text;
end $$;
revoke all on function public.submit_application(text,text,text,text,text,boolean) from public;
grant execute on function public.submit_application(text,text,text,text,text,boolean) to anon, authenticated;

create or replace function public.registration_public_status()
returns json language sql stable security definer set search_path = public
as $$ select json_build_object('is_open', s.is_open,
  'full', (select count(*) from public.applications where status in ('pending','accepted')) >= s.capacity,
  'waitlist_enabled', s.waitlist_enabled) from public.registration_settings s where id = 1 $$;
grant execute on function public.registration_public_status() to anon, authenticated;
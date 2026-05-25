-- Project Neo Availability Checker support.
-- Data Knox scope: database schema, indexes, RLS, and schema handoff notes only.

do $$
begin
  create type public.project_neo_availability_block_type as enum (
    'hold',
    'booked',
    'unavailable',
    'personal_block',
    'travel_block',
    'maintenance_day',
    'setup_day'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.project_neo_availability_status as enum (
    'available',
    'pending',
    'unavailable',
    'contact_required'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.availability_blocks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  block_type public.project_neo_availability_block_type not null,
  status public.project_neo_availability_status not null default 'unavailable',
  start_at timestamptz not null,
  end_at timestamptz not null,
  all_day boolean not null default false,
  reason text,
  internal_notes text,
  public_message text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint availability_blocks_time_order check (end_at > start_at)
);

alter table public.events
  add column if not exists start_at timestamptz,
  add column if not exists end_at timestamptz;

alter table public.booking_inquiries
  add column if not exists requested_start_at timestamptz,
  add column if not exists requested_end_at timestamptz,
  add column if not exists availability_status_at_submission public.project_neo_availability_status,
  add column if not exists availability_checked_at timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'events_time_window_order') then
    alter table public.events
      add constraint events_time_window_order check (
        start_at is null
        or end_at is null
        or end_at > start_at
      );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'booking_inquiries_requested_time_order') then
    alter table public.booking_inquiries
      add constraint booking_inquiries_requested_time_order check (
        requested_start_at is null
        or requested_end_at is null
        or requested_end_at > requested_start_at
      );
  end if;
end $$;

create index if not exists availability_blocks_start_at_idx
on public.availability_blocks (start_at);

create index if not exists availability_blocks_end_at_idx
on public.availability_blocks (end_at);

create index if not exists availability_blocks_status_window_idx
on public.availability_blocks (status, start_at, end_at);

create index if not exists availability_blocks_type_window_idx
on public.availability_blocks (block_type, start_at, end_at);

create index if not exists availability_blocks_time_range_gist_idx
on public.availability_blocks using gist (tstzrange(start_at, end_at, '[)'));

create index if not exists events_start_at_idx
on public.events (start_at);

create index if not exists events_end_at_idx
on public.events (end_at);

create index if not exists events_conflict_time_range_gist_idx
on public.events using gist (tstzrange(start_at, end_at, '[)'))
where start_at is not null
  and end_at is not null
  and status in ('pending', 'confirmed', 'hold');

create index if not exists booking_inquiries_requested_start_at_idx
on public.booking_inquiries (requested_start_at);

create index if not exists booking_inquiries_requested_end_at_idx
on public.booking_inquiries (requested_end_at);

create index if not exists booking_inquiries_availability_snapshot_idx
on public.booking_inquiries (availability_status_at_submission, availability_checked_at desc);

drop trigger if exists project_neo_availability_blocks_updated_at on public.availability_blocks;
create trigger project_neo_availability_blocks_updated_at
before update on public.availability_blocks
for each row execute function public.project_neo_set_updated_at();

alter table public.availability_blocks enable row level security;

grant select, insert, update, delete on public.availability_blocks to authenticated;
revoke all on public.availability_blocks from anon;

drop policy if exists "Project Neo staff manage availability blocks" on public.availability_blocks;
create policy "Project Neo staff manage availability blocks"
on public.availability_blocks
for all
to authenticated
using (private.is_project_neo_staff())
with check (private.is_project_neo_staff());

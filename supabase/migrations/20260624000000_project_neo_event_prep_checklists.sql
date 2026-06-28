-- Project Neo Event Prep Checklist database support.
-- Data Knox scope: schema, relationships, indexes, RLS, and seed defaults only.
-- Event prep data is private/admin-only unless a future migration explicitly
-- defines a client-safe subset.

do $$
begin
  create type public.project_neo_event_prep_status as enum (
    'not_started',
    'in_progress',
    'ready',
    'completed',
    'needs_review'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.project_neo_event_prep_item_status as enum (
    'not_started',
    'in_progress',
    'completed',
    'blocked',
    'not_applicable'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.project_neo_event_prep_section as enum (
    'Client',
    'Venue',
    'Timeline',
    'Music',
    'Gear',
    'Payments',
    'Contract',
    'Final Confirmation',
    'Internal Notes'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.project_neo_event_prep_confirmation_status as enum (
    'not_started',
    'pending',
    'confirmed',
    'needs_review',
    'not_applicable'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.project_neo_event_prep_payment_snapshot_status as enum (
    'not_required',
    'not_requested',
    'requested',
    'partially_paid',
    'paid',
    'overdue',
    'needs_review'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.project_neo_clean_or_explicit_preference as enum (
    'clean_only',
    'clean_preferred',
    'explicit_allowed',
    'client_discretion',
    'not_specified'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.project_neo_event_gear_status as enum (
    'needed',
    'packed',
    'loaded',
    'set_up',
    'returned',
    'not_applicable'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.event_prep_checklists (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  status public.project_neo_event_prep_status not null default 'not_started',
  final_confirmation_status public.project_neo_event_prep_confirmation_status not null default 'not_started',
  contract_status_snapshot public.project_neo_contract_status,
  deposit_status_snapshot public.project_neo_event_prep_payment_snapshot_status not null default 'not_requested',
  balance_status_snapshot public.project_neo_event_prep_payment_snapshot_status not null default 'not_requested',
  clean_or_explicit_preference public.project_neo_clean_or_explicit_preference not null default 'not_specified',
  crowd_type text,
  event_vibe text,
  internal_notes text,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_prep_checklists_event_unique unique (event_id),
  constraint event_prep_checklists_id_event_unique unique (id, event_id)
);

create table if not exists public.event_prep_default_items (
  id uuid primary key default gen_random_uuid(),
  section public.project_neo_event_prep_section not null,
  title text not null,
  description text,
  is_required boolean not null default false,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_prep_default_items_title_nonempty check (length(trim(title)) > 0),
  constraint event_prep_default_items_unique unique (section, title)
);

create table if not exists public.event_prep_items (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references public.event_prep_checklists(id) on delete cascade,
  section public.project_neo_event_prep_section not null,
  title text not null,
  description text,
  status public.project_neo_event_prep_item_status not null default 'not_started',
  is_required boolean not null default false,
  due_at timestamptz,
  completed_at timestamptz,
  completed_by uuid references public.users(id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_prep_items_title_nonempty check (length(trim(title)) > 0),
  constraint event_prep_items_completed_state check (
    (status = 'completed' and completed_at is not null)
    or (status <> 'completed')
  )
);

create table if not exists public.event_gear_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  checklist_id uuid,
  gear_name text not null,
  category text,
  quantity integer not null default 1,
  status public.project_neo_event_gear_status not null default 'needed',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_gear_items_checklist_event_fk
    foreign key (checklist_id, event_id)
    references public.event_prep_checklists(id, event_id)
    on delete cascade,
  constraint event_gear_items_name_nonempty check (length(trim(gear_name)) > 0),
  constraint event_gear_items_quantity_positive check (quantity > 0)
);

create table if not exists public.event_timeline_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  checklist_id uuid,
  time_label text,
  title text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_timeline_items_checklist_event_fk
    foreign key (checklist_id, event_id)
    references public.event_prep_checklists(id, event_id)
    on delete cascade,
  constraint event_timeline_items_title_nonempty check (length(trim(title)) > 0)
);

create table if not exists public.event_music_notes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  checklist_id uuid,
  music_preference_summary text,
  must_play_notes text,
  do_not_play_notes text,
  special_songs_notes text,
  announcements_notes text,
  clean_or_explicit_preference public.project_neo_clean_or_explicit_preference not null default 'not_specified',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_music_notes_checklist_event_fk
    foreign key (checklist_id, event_id)
    references public.event_prep_checklists(id, event_id)
    on delete cascade,
  constraint event_music_notes_event_unique unique (event_id),
  constraint event_music_notes_checklist_unique unique (checklist_id)
);

create index if not exists event_prep_checklists_event_id_idx
on public.event_prep_checklists (event_id);

create index if not exists event_prep_checklists_status_idx
on public.event_prep_checklists (status, updated_at desc);

create index if not exists event_prep_checklists_confirmation_idx
on public.event_prep_checklists (final_confirmation_status, updated_at desc);

create index if not exists event_prep_default_items_active_sort_idx
on public.event_prep_default_items (is_active, section, sort_order, title);

create index if not exists event_prep_items_checklist_section_sort_idx
on public.event_prep_items (checklist_id, section, sort_order, created_at);

create index if not exists event_prep_items_status_due_idx
on public.event_prep_items (status, due_at)
where status in ('not_started', 'in_progress', 'blocked');

create index if not exists event_prep_items_completed_by_idx
on public.event_prep_items (completed_by)
where completed_by is not null;

create index if not exists event_gear_items_event_status_idx
on public.event_gear_items (event_id, status, category);

create index if not exists event_gear_items_checklist_sort_idx
on public.event_gear_items (checklist_id, category, gear_name);

create index if not exists event_timeline_items_event_sort_idx
on public.event_timeline_items (event_id, sort_order, created_at);

create index if not exists event_timeline_items_checklist_sort_idx
on public.event_timeline_items (checklist_id, sort_order, created_at);

create index if not exists event_music_notes_event_id_idx
on public.event_music_notes (event_id);

drop trigger if exists project_neo_event_prep_checklists_updated_at on public.event_prep_checklists;
create trigger project_neo_event_prep_checklists_updated_at
before update on public.event_prep_checklists
for each row execute function public.project_neo_set_updated_at();

drop trigger if exists project_neo_event_prep_default_items_updated_at on public.event_prep_default_items;
create trigger project_neo_event_prep_default_items_updated_at
before update on public.event_prep_default_items
for each row execute function public.project_neo_set_updated_at();

drop trigger if exists project_neo_event_prep_items_updated_at on public.event_prep_items;
create trigger project_neo_event_prep_items_updated_at
before update on public.event_prep_items
for each row execute function public.project_neo_set_updated_at();

drop trigger if exists project_neo_event_gear_items_updated_at on public.event_gear_items;
create trigger project_neo_event_gear_items_updated_at
before update on public.event_gear_items
for each row execute function public.project_neo_set_updated_at();

drop trigger if exists project_neo_event_timeline_items_updated_at on public.event_timeline_items;
create trigger project_neo_event_timeline_items_updated_at
before update on public.event_timeline_items
for each row execute function public.project_neo_set_updated_at();

drop trigger if exists project_neo_event_music_notes_updated_at on public.event_music_notes;
create trigger project_neo_event_music_notes_updated_at
before update on public.event_music_notes
for each row execute function public.project_neo_set_updated_at();

alter table public.event_prep_checklists enable row level security;
alter table public.event_prep_default_items enable row level security;
alter table public.event_prep_items enable row level security;
alter table public.event_gear_items enable row level security;
alter table public.event_timeline_items enable row level security;
alter table public.event_music_notes enable row level security;

revoke all on
  public.event_prep_checklists,
  public.event_prep_default_items,
  public.event_prep_items,
  public.event_gear_items,
  public.event_timeline_items,
  public.event_music_notes
from anon, authenticated;

grant select, insert, update, delete on
  public.event_prep_checklists,
  public.event_prep_default_items,
  public.event_prep_items,
  public.event_gear_items,
  public.event_timeline_items,
  public.event_music_notes
to authenticated;

drop policy if exists "Project Neo admins manage event prep checklists" on public.event_prep_checklists;
create policy "Project Neo admins manage event prep checklists"
on public.event_prep_checklists
for all
to authenticated
using (private.is_project_neo_admin())
with check (private.is_project_neo_admin());

drop policy if exists "Project Neo admins manage event prep defaults" on public.event_prep_default_items;
create policy "Project Neo admins manage event prep defaults"
on public.event_prep_default_items
for all
to authenticated
using (private.is_project_neo_admin())
with check (private.is_project_neo_admin());

drop policy if exists "Project Neo admins manage event prep items" on public.event_prep_items;
create policy "Project Neo admins manage event prep items"
on public.event_prep_items
for all
to authenticated
using (private.is_project_neo_admin())
with check (private.is_project_neo_admin());

drop policy if exists "Project Neo admins manage event gear items" on public.event_gear_items;
create policy "Project Neo admins manage event gear items"
on public.event_gear_items
for all
to authenticated
using (private.is_project_neo_admin())
with check (private.is_project_neo_admin());

drop policy if exists "Project Neo admins manage event timeline items" on public.event_timeline_items;
create policy "Project Neo admins manage event timeline items"
on public.event_timeline_items
for all
to authenticated
using (private.is_project_neo_admin())
with check (private.is_project_neo_admin());

drop policy if exists "Project Neo admins manage event music notes" on public.event_music_notes;
create policy "Project Neo admins manage event music notes"
on public.event_music_notes
for all
to authenticated
using (private.is_project_neo_admin())
with check (private.is_project_neo_admin());

insert into public.event_prep_default_items (section, title, description, is_required, sort_order)
values
  ('Client', 'Confirm primary contact', 'Verify client name, phone, email, and day-of contact details.', true, 10),
  ('Client', 'Confirm guest count and crowd type', 'Review estimated guest count, age range, and crowd expectations.', false, 20),
  ('Venue', 'Verify venue address and load-in', 'Confirm address, parking, loading access, stairs/elevator, and setup area.', true, 10),
  ('Venue', 'Confirm power and table needs', 'Confirm outlet access, table placement, extension cord needs, and booth location.', true, 20),
  ('Timeline', 'Build event timeline', 'Collect key times for arrival, setup, ceremony, announcements, special moments, and wrap.', true, 10),
  ('Timeline', 'Confirm overnight timing if applicable', 'Verify next-day end times and any venue cutoff or curfew.', false, 20),
  ('Music', 'Review music preferences', 'Summarize preferred genres, event vibe, must-play songs, and do-not-play notes.', true, 10),
  ('Music', 'Confirm clean or explicit preference', 'Document whether clean edits are required or explicit music is allowed.', true, 20),
  ('Gear', 'Prepare gear list', 'Confirm speakers, controller, mics, lighting, stands, cables, and backup gear.', true, 10),
  ('Payments', 'Check deposit and balance status', 'Review invoice/payment status snapshots before event day.', true, 10),
  ('Contract', 'Check contract status', 'Confirm contract has been sent, signed, or marked for follow-up.', true, 10),
  ('Final Confirmation', 'Send final confirmation', 'Confirm final event details with client before event day.', true, 10),
  ('Internal Notes', 'Review private admin notes', 'Review private prep notes, special considerations, and owner-only reminders.', false, 10)
on conflict (section, title) do update
set
  description = excluded.description,
  is_required = excluded.is_required,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();

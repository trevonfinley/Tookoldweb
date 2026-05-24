-- Project Neo MVP database schema for DJ Too Kold.
-- MVP tables: users, clients, booking_inquiries, events, venues, invoices,
-- invoice_items, payments, services, packages, gallery_items, mixes, event_notes.
-- Support tables in this migration, such as package_services and contact_messages,
-- exist to keep the MVP normalized and website/backend-compatible.

create extension if not exists pgcrypto;
create extension if not exists citext;

do $$
begin
  create type public.project_neo_user_role as enum (
    'owner',
    'admin',
    'dj',
    'client',
    'staff'
  );
exception
  when duplicate_object then null;
end $$;

alter type public.project_neo_user_role add value if not exists 'dj';
alter type public.project_neo_user_role add value if not exists 'client';

do $$
begin
  create type public.project_neo_booking_status as enum (
    'new',
    'reviewing',
    'quoted',
    'deposit_requested',
    'confirmed',
    'completed',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.project_neo_event_status as enum (
    'inquiry',
    'pending',
    'confirmed',
    'completed',
    'cancelled',
    'hold'
  );
exception
  when duplicate_object then null;
end $$;

alter type public.project_neo_event_status add value if not exists 'inquiry';
alter type public.project_neo_event_status add value if not exists 'pending';
alter type public.project_neo_event_status add value if not exists 'hold';

do $$
begin
  create type public.project_neo_invoice_status as enum (
    'draft',
    'sent',
    'partially_paid',
    'paid',
    'overdue',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.project_neo_payment_status as enum (
    'pending',
    'paid',
    'failed',
    'refunded'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.project_neo_contract_status as enum (
    'draft',
    'sent',
    'signed',
    'expired',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.project_neo_task_status as enum (
    'todo',
    'in_progress',
    'waiting',
    'done',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.project_neo_priority as enum (
    'low',
    'normal',
    'high',
    'urgent'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.project_neo_song_request_status as enum (
    'requested',
    'approved',
    'declined',
    'played'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.project_neo_media_type as enum (
    'image',
    'video',
    'audio'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.project_neo_message_status as enum (
    'new',
    'reviewing',
    'closed',
    'spam'
  );
exception
  when duplicate_object then null;
end $$;

create or replace function public.project_neo_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.project_neo_user_role not null default 'staff',
  full_name text,
  email citext not null unique,
  phone text,
  avatar_url text,
  is_active boolean not null default true,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_email_format check (email ~* '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$')
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  portal_user_id uuid unique references auth.users(id) on delete set null,
  full_name text not null,
  email citext not null unique,
  phone text,
  company_name text,
  preferred_contact_method text not null default 'email',
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text not null default 'US',
  notes text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clients_email_format check (email ~* '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$'),
  constraint clients_contact_method_allowed check (preferred_contact_method in ('email', 'phone', 'text'))
);

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text not null default 'US',
  website_url text,
  contact_name text,
  contact_email citext,
  contact_phone text,
  load_in_notes text,
  parking_notes text,
  power_notes text,
  is_preferred boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint venues_contact_email_format check (
    contact_email is null
    or contact_email ~* '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$'
  )
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  base_price_cents integer,
  duration_minutes integer,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint services_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint services_base_price_nonnegative check (base_price_cents is null or base_price_cents >= 0),
  constraint services_duration_positive check (duration_minutes is null or duration_minutes > 0)
);

create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price_cents integer,
  deposit_cents integer,
  duration_minutes integer,
  features text[] not null default '{}',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint packages_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint packages_price_nonnegative check (price_cents is null or price_cents >= 0),
  constraint packages_deposit_nonnegative check (deposit_cents is null or deposit_cents >= 0),
  constraint packages_deposit_lte_price check (price_cents is null or deposit_cents is null or deposit_cents <= price_cents),
  constraint packages_duration_positive check (duration_minutes is null or duration_minutes > 0)
);

create table if not exists public.package_services (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.packages(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict,
  quantity numeric(8,2) not null default 1,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint package_services_quantity_positive check (quantity > 0),
  constraint package_services_unique unique (package_id, service_id)
);

create table if not exists public.booking_inquiries (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  status public.project_neo_booking_status not null default 'new',
  source text not null default 'website',
  full_name text not null,
  first_name text,
  last_name text,
  email citext not null,
  phone text,
  subject text,
  message text not null,
  event_date date,
  start_time time,
  end_time time,
  event_type text,
  venue_name text,
  venue_address text,
  city_state text,
  location text,
  guest_count integer,
  indoor_outdoor text,
  music_preferences text,
  budget_range text,
  heard_about text,
  additional_notes text,
  quoted_amount_cents integer,
  deposit_requested_cents integer,
  internal_notes text,
  reviewed_at timestamptz,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_inquiries_email_format check (email ~* '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$'),
  constraint booking_inquiries_guest_count_positive check (guest_count is null or guest_count > 0),
  constraint booking_inquiries_indoor_outdoor_allowed check (
    indoor_outdoor is null
    or indoor_outdoor in ('indoor', 'outdoor', 'both', 'not_sure')
  ),
  constraint booking_inquiries_quote_nonnegative check (quoted_amount_cents is null or quoted_amount_cents >= 0),
  constraint booking_inquiries_deposit_nonnegative check (deposit_requested_cents is null or deposit_requested_cents >= 0),
  constraint booking_inquiries_deposit_lte_quote check (
    quoted_amount_cents is null
    or deposit_requested_cents is null
    or deposit_requested_cents <= quoted_amount_cents
  )
);

alter table public.booking_inquiries
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists start_time time,
  add column if not exists end_time time,
  add column if not exists venue_name text,
  add column if not exists venue_address text,
  add column if not exists city_state text,
  add column if not exists indoor_outdoor text,
  add column if not exists music_preferences text,
  add column if not exists heard_about text,
  add column if not exists additional_notes text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'booking_inquiries_indoor_outdoor_allowed'
  ) then
    alter table public.booking_inquiries
      add constraint booking_inquiries_indoor_outdoor_allowed check (
        indoor_outdoor is null
        or indoor_outdoor in ('indoor', 'outdoor', 'both', 'not_sure')
      );
  end if;
end $$;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email citext not null,
  subject text,
  message text not null,
  status public.project_neo_message_status not null default 'new',
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contact_messages_email_format check (email ~* '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$')
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  booking_inquiry_id uuid references public.booking_inquiries(id) on delete set null,
  venue_id uuid references public.venues(id) on delete set null,
  package_id uuid references public.packages(id) on delete set null,
  title text not null,
  event_type text,
  event_date date not null,
  start_time time,
  end_time time,
  timezone text not null default 'America/Chicago',
  venue_name text,
  location text,
  guest_count integer,
  status public.project_neo_event_status not null default 'pending',
  visibility text not null default 'private',
  notes text,
  internal_notes text,
  setup_notes text,
  timeline_notes text,
  calendar_sync_id text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_guest_count_positive check (guest_count is null or guest_count > 0),
  constraint events_visibility_allowed check (visibility in ('public', 'private'))
);

alter table public.events
  add column if not exists visibility text not null default 'private',
  add column if not exists internal_notes text,
  add column if not exists calendar_sync_id text;

update public.events
set status = 'pending'
where status::text = 'tentative';

alter table public.events
  alter column status set default 'pending';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'events_visibility_allowed') then
    alter table public.events
      add constraint events_visibility_allowed check (visibility in ('public', 'private'));
  end if;
end $$;

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  event_id uuid references public.events(id) on delete set null,
  invoice_number text not null unique,
  status public.project_neo_invoice_status not null default 'draft',
  currency text not null default 'USD',
  issue_date date not null default current_date,
  due_date date,
  sent_at timestamptz,
  paid_at timestamptz,
  payment_provider text,
  payment_link_url text,
  payment_link_expires_at timestamptz,
  external_invoice_id text,
  external_invoice_url text,
  subtotal_cents integer not null default 0,
  discount_cents integer not null default 0,
  tax_cents integer not null default 0,
  deposit_cents integer not null default 0,
  amount_paid_cents integer not null default 0,
  deposit_paid_cents integer not null default 0,
  balance_due_cents integer not null default 0,
  total_cents integer not null default 0,
  notes text,
  terms text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoices_currency_format check (currency ~ '^[A-Z]{3}$'),
  constraint invoices_payment_link_https check (payment_link_url is null or payment_link_url ~* '^https://'),
  constraint invoices_external_invoice_url_https check (external_invoice_url is null or external_invoice_url ~* '^https://'),
  constraint invoices_external_refs_have_provider check (
    (
      payment_link_url is null
      and external_invoice_id is null
      and external_invoice_url is null
    )
    or payment_provider is not null
  ),
  constraint invoices_nonnegative_amounts check (
    subtotal_cents >= 0
    and discount_cents >= 0
    and tax_cents >= 0
    and deposit_cents >= 0
    and amount_paid_cents >= 0
    and deposit_paid_cents >= 0
    and balance_due_cents >= 0
    and total_cents >= 0
  ),
  constraint invoices_total_matches_parts check (total_cents = subtotal_cents - discount_cents + tax_cents),
  constraint invoices_balance_matches_paid check (balance_due_cents = greatest(total_cents - amount_paid_cents, 0)),
  constraint invoices_deposit_paid_lte_deposit check (deposit_paid_cents <= deposit_cents),
  constraint invoices_deposit_lte_total check (deposit_cents <= total_cents)
);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  package_id uuid references public.packages(id) on delete set null,
  description text not null,
  quantity numeric(10,2) not null default 1,
  unit_price_cents integer not null default 0,
  line_total_cents integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoice_items_quantity_positive check (quantity > 0),
  constraint invoice_items_unit_price_nonnegative check (unit_price_cents >= 0),
  constraint invoice_items_line_total_nonnegative check (line_total_cents >= 0),
  constraint invoice_items_one_catalog_ref check (
    service_id is null
    or package_id is null
  )
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  status public.project_neo_payment_status not null default 'pending',
  amount_cents integer not null,
  currency text not null default 'USD',
  payment_type text not null default 'deposit',
  payment_provider text,
  provider_payment_id text,
  payment_date date,
  paid_at timestamptz,
  refunded_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_amount_positive check (amount_cents > 0),
  constraint payments_currency_format check (currency ~ '^[A-Z]{3}$'),
  constraint payments_type_allowed check (payment_type in ('deposit', 'balance', 'refund', 'other')),
  constraint payments_provider_reference_has_provider check (provider_payment_id is null or payment_provider is not null),
  constraint payments_paid_has_payment_date check (status <> 'paid' or payment_date is not null or paid_at is not null),
  constraint payments_refunded_has_timestamp check (status <> 'refunded' or refunded_at is not null)
);

alter table public.invoices
  add column if not exists payment_provider text,
  add column if not exists payment_link_url text,
  add column if not exists payment_link_expires_at timestamptz,
  add column if not exists external_invoice_id text,
  add column if not exists external_invoice_url text,
  add column if not exists amount_paid_cents integer not null default 0,
  add column if not exists deposit_paid_cents integer not null default 0,
  add column if not exists balance_due_cents integer not null default 0;

alter table public.payments
  add column if not exists payment_date date;

update public.invoices
set
  amount_paid_cents = greatest(coalesce(amount_paid_cents, 0), 0),
  deposit_paid_cents = least(greatest(coalesce(deposit_paid_cents, 0), 0), coalesce(deposit_cents, 0)),
  balance_due_cents = greatest(coalesce(total_cents, 0) - greatest(coalesce(amount_paid_cents, 0), 0), 0);

update public.invoices
set payment_provider = 'other'
where payment_provider is null
  and (
    payment_link_url is not null
    or external_invoice_id is not null
    or external_invoice_url is not null
  );

update public.payments
set
  paid_at = coalesce(paid_at, created_at),
  payment_date = coalesce(payment_date, paid_at::date, created_at::date)
where status = 'paid'
  and (paid_at is null or payment_date is null);

update public.payments
set payment_provider = 'other'
where payment_provider is null
  and provider_payment_id is not null;

update public.payments
set
  refunded_at = coalesce(refunded_at, updated_at, created_at),
  payment_date = coalesce(payment_date, refunded_at::date, updated_at::date, created_at::date)
where status = 'refunded'
  and (refunded_at is null or payment_date is null);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'invoices_payment_link_https') then
    alter table public.invoices
      add constraint invoices_payment_link_https check (payment_link_url is null or payment_link_url ~* '^https://');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'invoices_external_invoice_url_https') then
    alter table public.invoices
      add constraint invoices_external_invoice_url_https check (external_invoice_url is null or external_invoice_url ~* '^https://');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'invoices_external_refs_have_provider') then
    alter table public.invoices
      add constraint invoices_external_refs_have_provider check (
        (
          payment_link_url is null
          and external_invoice_id is null
          and external_invoice_url is null
        )
        or payment_provider is not null
      );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'invoices_ledger_amounts_nonnegative') then
    alter table public.invoices
      add constraint invoices_ledger_amounts_nonnegative check (
        amount_paid_cents >= 0
        and deposit_paid_cents >= 0
        and balance_due_cents >= 0
      );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'invoices_balance_matches_paid') then
    alter table public.invoices
      add constraint invoices_balance_matches_paid check (balance_due_cents = greatest(total_cents - amount_paid_cents, 0));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'invoices_deposit_paid_lte_deposit') then
    alter table public.invoices
      add constraint invoices_deposit_paid_lte_deposit check (deposit_paid_cents <= deposit_cents);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'payments_provider_reference_has_provider') then
    alter table public.payments
      add constraint payments_provider_reference_has_provider check (provider_payment_id is null or payment_provider is not null);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'payments_paid_has_payment_date') then
    alter table public.payments
      add constraint payments_paid_has_payment_date check (status <> 'paid' or payment_date is not null or paid_at is not null);
  end if;
end $$;

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  event_id uuid references public.events(id) on delete set null,
  contract_number text unique,
  status public.project_neo_contract_status not null default 'draft',
  title text not null,
  terms_markdown text,
  document_url text,
  signature_name text,
  signature_email citext,
  signature_ip text,
  sent_at timestamptz,
  signed_at timestamptz,
  expires_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contracts_signature_email_format check (
    signature_email is null
    or signature_email ~* '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$'
  )
);

create table if not exists public.song_requests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  requested_by_name text,
  requested_by_email citext,
  song_title text not null,
  artist text,
  notes text,
  dedication text,
  is_must_play boolean not null default false,
  status public.project_neo_song_request_status not null default 'requested',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint song_requests_email_format check (
    requested_by_email is null
    or requested_by_email ~* '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$'
  )
);

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete set null,
  title text not null,
  caption text,
  media_type public.project_neo_media_type not null default 'image',
  url text not null,
  thumbnail_url text,
  alt_text text,
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gallery_items
  add column if not exists description text,
  add column if not exists media_category text not null default 'photos',
  add column if not exists event_date date,
  add column if not exists venue text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists source_type text not null default 'storage',
  add column if not exists storage_bucket text,
  add column if not exists storage_path text,
  add column if not exists external_url text,
  add column if not exists embed_url text,
  add column if not exists provider text;

update public.gallery_items
set description = caption
where description is null
  and caption is not null;

update public.gallery_items
set media_category = case
  when media_type = 'video' then 'videos'
  when media_type = 'audio' then 'mixes'
  else media_category
end
where media_category = 'photos';

do $$
begin
  alter table public.gallery_items
    add constraint gallery_items_media_category_allowed
    check (media_category in ('photos', 'videos', 'mixes', 'flyers', 'event_recaps', 'venue_shots', 'promo_images'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.gallery_items
    add constraint gallery_items_source_type_allowed
    check (source_type in ('storage', 'external', 'local'));
exception
  when duplicate_object then null;
end $$;

create table if not exists public.mixes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  platform text,
  audio_url text,
  embed_url text,
  cover_image_url text,
  duration_seconds integer,
  recorded_at date,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mixes_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint mixes_duration_positive check (duration_seconds is null or duration_seconds > 0),
  constraint mixes_published_has_playback_url check (is_published = false or audio_url is not null or embed_url is not null)
);

create table if not exists public.event_notes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  author_user_id uuid references public.users(id) on delete set null,
  note_type text not null default 'general',
  body text not null,
  is_private boolean not null default true,
  client_editable boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.event_notes
  add column if not exists client_editable boolean not null default false;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  booking_inquiry_id uuid references public.booking_inquiries(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  assigned_to uuid references public.users(id) on delete set null,
  created_by uuid references public.users(id) on delete set null,
  title text not null,
  description text,
  status public.project_neo_task_status not null default 'todo',
  priority public.project_neo_priority not null default 'normal',
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_done_requires_completed_at check (status <> 'done' or completed_at is not null)
);

create index if not exists users_role_active_idx on public.users (role, is_active);

create index if not exists clients_email_idx on public.clients (email);
create index if not exists clients_portal_user_id_idx on public.clients (portal_user_id);

create index if not exists venues_name_idx on public.venues (name);
create index if not exists venues_city_state_idx on public.venues (city, state);
create unique index if not exists venues_name_address_uidx
on public.venues (lower(name), lower(coalesce(address_line1, '')), lower(coalesce(city, '')), lower(coalesce(state, '')));

create index if not exists services_active_sort_idx on public.services (is_active, sort_order, name);
create index if not exists packages_active_sort_idx on public.packages (is_active, sort_order, name);
create index if not exists package_services_package_id_idx on public.package_services (package_id, sort_order);
create index if not exists package_services_service_id_idx on public.package_services (service_id);

create index if not exists booking_inquiries_created_at_idx on public.booking_inquiries (created_at desc);
create index if not exists booking_inquiries_status_idx on public.booking_inquiries (status);
create index if not exists booking_inquiries_status_created_at_idx on public.booking_inquiries (status, created_at desc);
create index if not exists booking_inquiries_event_date_idx on public.booking_inquiries (event_date);
create index if not exists booking_inquiries_client_id_idx on public.booking_inquiries (client_id);
create index if not exists booking_inquiries_email_idx on public.booking_inquiries (email);
create index if not exists booking_inquiries_city_state_idx on public.booking_inquiries (city_state);

create index if not exists contact_messages_status_created_at_idx on public.contact_messages (status, created_at desc);
create index if not exists contact_messages_email_idx on public.contact_messages (email);

create index if not exists events_date_status_idx on public.events (event_date, status);
create index if not exists events_availability_idx on public.events (event_date, status, visibility);
create index if not exists events_client_id_idx on public.events (client_id);
create index if not exists events_booking_inquiry_id_idx on public.events (booking_inquiry_id);
create index if not exists events_venue_id_idx on public.events (venue_id);
create index if not exists events_package_id_idx on public.events (package_id);
create unique index if not exists events_calendar_sync_id_uidx
on public.events (calendar_sync_id)
where calendar_sync_id is not null;

create index if not exists invoices_status_due_date_idx on public.invoices (status, due_date);
create index if not exists invoices_client_id_idx on public.invoices (client_id);
create index if not exists invoices_event_id_idx on public.invoices (event_id);
create index if not exists invoices_created_at_idx on public.invoices (created_at desc);
create index if not exists invoices_open_balance_idx on public.invoices (status, due_date, balance_due_cents)
where balance_due_cents > 0;
create index if not exists invoices_payment_provider_idx on public.invoices (payment_provider, external_invoice_id)
where external_invoice_id is not null;

create index if not exists invoice_items_invoice_id_idx on public.invoice_items (invoice_id, sort_order);
create index if not exists invoice_items_service_id_idx on public.invoice_items (service_id);
create index if not exists invoice_items_package_id_idx on public.invoice_items (package_id);

create index if not exists payments_invoice_id_idx on public.payments (invoice_id);
create index if not exists payments_status_paid_at_idx on public.payments (status, paid_at desc);
create index if not exists payments_payment_date_idx on public.payments (payment_date desc)
where payment_date is not null;
create unique index if not exists payments_provider_payment_id_uidx
on public.payments (payment_provider, provider_payment_id)
where provider_payment_id is not null;

create index if not exists contracts_client_id_idx on public.contracts (client_id);
create index if not exists contracts_event_id_idx on public.contracts (event_id);
create index if not exists contracts_status_expires_at_idx on public.contracts (status, expires_at);

create index if not exists song_requests_event_sort_idx on public.song_requests (event_id, sort_order, created_at);
create index if not exists song_requests_event_status_idx on public.song_requests (event_id, status);
create index if not exists song_requests_must_play_idx on public.song_requests (event_id, is_must_play)
where is_must_play = true;

create index if not exists gallery_items_public_idx on public.gallery_items (is_published, sort_order, created_at desc);
create index if not exists gallery_items_event_id_idx on public.gallery_items (event_id);
create index if not exists gallery_items_category_public_idx on public.gallery_items (media_category, is_published, sort_order);
create index if not exists gallery_items_event_date_idx on public.gallery_items (event_date desc)
where event_date is not null;
create index if not exists gallery_items_tags_idx on public.gallery_items using gin (tags);

create index if not exists mixes_public_idx on public.mixes (is_published, sort_order, created_at desc);
create index if not exists mixes_featured_idx on public.mixes (is_featured, sort_order)
where is_published = true;

create index if not exists event_notes_event_id_idx on public.event_notes (event_id, created_at desc);
create index if not exists event_notes_author_user_id_idx on public.event_notes (author_user_id);
create index if not exists event_notes_client_visible_idx on public.event_notes (event_id, client_editable, created_at desc)
where is_private = false;

create index if not exists tasks_assigned_status_due_idx on public.tasks (assigned_to, status, due_at);
create index if not exists tasks_event_id_idx on public.tasks (event_id);
create index if not exists tasks_booking_inquiry_id_idx on public.tasks (booking_inquiry_id);
create index if not exists tasks_client_id_idx on public.tasks (client_id);

create or replace function public.project_neo_prepare_invoice_ledger()
returns trigger
language plpgsql
as $$
begin
  new.amount_paid_cents = greatest(coalesce(new.amount_paid_cents, 0), 0);
  new.deposit_paid_cents = least(greatest(coalesce(new.deposit_paid_cents, 0), 0), coalesce(new.deposit_cents, 0));
  new.balance_due_cents = greatest(coalesce(new.total_cents, 0) - new.amount_paid_cents, 0);

  if new.status <> 'cancelled' then
    if new.total_cents > 0 and new.amount_paid_cents >= new.total_cents then
      new.status = 'paid';
    elsif new.amount_paid_cents > 0 then
      new.status = 'partially_paid';
    elsif new.status <> 'draft' and new.due_date is not null and new.due_date < current_date then
      new.status = 'overdue';
    elsif new.status = 'overdue' and (new.due_date is null or new.due_date >= current_date) then
      new.status = 'sent';
    end if;
  end if;

  if new.status in ('sent', 'partially_paid', 'paid', 'overdue') and new.sent_at is null then
    new.sent_at = now();
  end if;

  if new.status = 'paid' then
    new.paid_at = coalesce(new.paid_at, now());
  else
    new.paid_at = null;
  end if;

  return new;
end;
$$;

create or replace function public.project_neo_prepare_payment_ledger()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'paid' then
    new.paid_at = coalesce(new.paid_at, now());
    new.payment_date = coalesce(new.payment_date, new.paid_at::date);
  elsif new.status = 'refunded' then
    new.refunded_at = coalesce(new.refunded_at, now());
    new.payment_date = coalesce(new.payment_date, new.refunded_at::date);
  end if;

  return new;
end;
$$;

create or replace function public.project_neo_refresh_invoice_payment_totals(target_invoice_id uuid)
returns void
language plpgsql
as $$
declare
  collected_cents integer := 0;
  collected_deposit_cents integer := 0;
begin
  if target_invoice_id is null then
    return;
  end if;

  select
    coalesce(sum(
      case
        when status = 'paid' and payment_type in ('deposit', 'balance', 'other') then amount_cents
        when status = 'paid' and payment_type = 'refund' then -amount_cents
        when status = 'refunded' then -amount_cents
        else 0
      end
    ), 0),
    coalesce(sum(
      case
        when status = 'paid' and payment_type = 'deposit' then amount_cents
        when status = 'refunded' and payment_type = 'deposit' then -amount_cents
        else 0
      end
    ), 0)
  into collected_cents, collected_deposit_cents
  from public.payments
  where invoice_id = target_invoice_id;

  update public.invoices
  set
    amount_paid_cents = greatest(collected_cents, 0),
    deposit_paid_cents = least(greatest(collected_deposit_cents, 0), deposit_cents)
  where id = target_invoice_id;
end;
$$;

create or replace function public.project_neo_sync_invoice_payment_totals()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform public.project_neo_refresh_invoice_payment_totals(old.invoice_id);
    return old;
  end if;

  if tg_op = 'UPDATE' and old.invoice_id is distinct from new.invoice_id then
    perform public.project_neo_refresh_invoice_payment_totals(old.invoice_id);
  end if;

  perform public.project_neo_refresh_invoice_payment_totals(new.invoice_id);
  return new;
end;
$$;

drop trigger if exists project_neo_users_updated_at on public.users;
create trigger project_neo_users_updated_at
before update on public.users
for each row execute function public.project_neo_set_updated_at();

drop trigger if exists project_neo_clients_updated_at on public.clients;
create trigger project_neo_clients_updated_at
before update on public.clients
for each row execute function public.project_neo_set_updated_at();

drop trigger if exists project_neo_venues_updated_at on public.venues;
create trigger project_neo_venues_updated_at
before update on public.venues
for each row execute function public.project_neo_set_updated_at();

drop trigger if exists project_neo_services_updated_at on public.services;
create trigger project_neo_services_updated_at
before update on public.services
for each row execute function public.project_neo_set_updated_at();

drop trigger if exists project_neo_packages_updated_at on public.packages;
create trigger project_neo_packages_updated_at
before update on public.packages
for each row execute function public.project_neo_set_updated_at();

drop trigger if exists project_neo_package_services_updated_at on public.package_services;
create trigger project_neo_package_services_updated_at
before update on public.package_services
for each row execute function public.project_neo_set_updated_at();

drop trigger if exists project_neo_booking_inquiries_updated_at on public.booking_inquiries;
create trigger project_neo_booking_inquiries_updated_at
before update on public.booking_inquiries
for each row execute function public.project_neo_set_updated_at();

drop trigger if exists project_neo_contact_messages_updated_at on public.contact_messages;
create trigger project_neo_contact_messages_updated_at
before update on public.contact_messages
for each row execute function public.project_neo_set_updated_at();

drop trigger if exists project_neo_events_updated_at on public.events;
create trigger project_neo_events_updated_at
before update on public.events
for each row execute function public.project_neo_set_updated_at();

drop trigger if exists project_neo_invoices_prepare_ledger on public.invoices;
create trigger project_neo_invoices_prepare_ledger
before insert or update on public.invoices
for each row execute function public.project_neo_prepare_invoice_ledger();

drop trigger if exists project_neo_invoices_updated_at on public.invoices;
create trigger project_neo_invoices_updated_at
before update on public.invoices
for each row execute function public.project_neo_set_updated_at();

drop trigger if exists project_neo_invoice_items_updated_at on public.invoice_items;
create trigger project_neo_invoice_items_updated_at
before update on public.invoice_items
for each row execute function public.project_neo_set_updated_at();

drop trigger if exists project_neo_payments_prepare_ledger on public.payments;
create trigger project_neo_payments_prepare_ledger
before insert or update on public.payments
for each row execute function public.project_neo_prepare_payment_ledger();

drop trigger if exists project_neo_payments_updated_at on public.payments;
create trigger project_neo_payments_updated_at
before update on public.payments
for each row execute function public.project_neo_set_updated_at();

drop trigger if exists project_neo_payments_sync_invoice_totals on public.payments;
create trigger project_neo_payments_sync_invoice_totals
after insert or update or delete on public.payments
for each row execute function public.project_neo_sync_invoice_payment_totals();

do $$
declare
  invoice_record record;
begin
  for invoice_record in select id from public.invoices loop
    perform public.project_neo_refresh_invoice_payment_totals(invoice_record.id);
  end loop;
end $$;

drop trigger if exists project_neo_contracts_updated_at on public.contracts;
create trigger project_neo_contracts_updated_at
before update on public.contracts
for each row execute function public.project_neo_set_updated_at();

drop trigger if exists project_neo_song_requests_updated_at on public.song_requests;
create trigger project_neo_song_requests_updated_at
before update on public.song_requests
for each row execute function public.project_neo_set_updated_at();

drop trigger if exists project_neo_gallery_items_updated_at on public.gallery_items;
create trigger project_neo_gallery_items_updated_at
before update on public.gallery_items
for each row execute function public.project_neo_set_updated_at();

drop trigger if exists project_neo_mixes_updated_at on public.mixes;
create trigger project_neo_mixes_updated_at
before update on public.mixes
for each row execute function public.project_neo_set_updated_at();

drop trigger if exists project_neo_event_notes_updated_at on public.event_notes;
create trigger project_neo_event_notes_updated_at
before update on public.event_notes
for each row execute function public.project_neo_set_updated_at();

drop trigger if exists project_neo_tasks_updated_at on public.tasks;
create trigger project_neo_tasks_updated_at
before update on public.tasks
for each row execute function public.project_neo_set_updated_at();

alter table public.users enable row level security;
alter table public.clients enable row level security;
alter table public.venues enable row level security;
alter table public.services enable row level security;
alter table public.packages enable row level security;
alter table public.package_services enable row level security;
alter table public.booking_inquiries enable row level security;
alter table public.contact_messages enable row level security;
alter table public.events enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.contracts enable row level security;
alter table public.song_requests enable row level security;
alter table public.gallery_items enable row level security;
alter table public.mixes enable row level security;
alter table public.event_notes enable row level security;
alter table public.tasks enable row level security;

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on
  public.users,
  public.clients,
  public.venues,
  public.services,
  public.packages,
  public.package_services,
  public.booking_inquiries,
  public.contact_messages,
  public.events,
  public.invoices,
  public.invoice_items,
  public.payments,
  public.contracts,
  public.song_requests,
  public.gallery_items,
  public.mixes,
  public.event_notes,
  public.tasks
to authenticated;

grant select on
  public.services,
  public.packages,
  public.package_services,
  public.gallery_items,
  public.mixes
to anon;

grant insert on
  public.booking_inquiries,
  public.contact_messages
to anon;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_project_neo_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = (select auth.uid())
      and role in ('owner', 'admin')
      and is_active = true
  );
$$;

create or replace function private.is_project_neo_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = (select auth.uid())
      and role in ('owner', 'admin', 'staff')
      and is_active = true
  );
$$;

revoke all on function private.is_project_neo_admin() from public;
revoke all on function private.is_project_neo_staff() from public;
grant execute on function private.is_project_neo_admin() to authenticated;
grant execute on function private.is_project_neo_staff() to authenticated;

drop policy if exists "Project Neo staff can read users" on public.users;
create policy "Project Neo staff can read users"
on public.users
for select
to authenticated
using (id = (select auth.uid()) or private.is_project_neo_staff());

drop policy if exists "Project Neo admins manage users" on public.users;
create policy "Project Neo admins manage users"
on public.users
for all
to authenticated
using (private.is_project_neo_admin())
with check (private.is_project_neo_admin());

drop policy if exists "Project Neo staff manage clients" on public.clients;
create policy "Project Neo staff manage clients"
on public.clients
for all
to authenticated
using (private.is_project_neo_staff())
with check (private.is_project_neo_staff());

drop policy if exists "Portal clients can read their own client profile" on public.clients;
create policy "Portal clients can read their own client profile"
on public.clients
for select
to authenticated
using (portal_user_id = (select auth.uid()));

drop policy if exists "Project Neo staff manage venues" on public.venues;
create policy "Project Neo staff manage venues"
on public.venues
for all
to authenticated
using (private.is_project_neo_staff())
with check (private.is_project_neo_staff());

drop policy if exists "Project Neo staff manage services" on public.services;
create policy "Project Neo staff manage services"
on public.services
for all
to authenticated
using (private.is_project_neo_staff())
with check (private.is_project_neo_staff());

drop policy if exists "Active services are public" on public.services;
create policy "Active services are public"
on public.services
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Project Neo staff manage packages" on public.packages;
create policy "Project Neo staff manage packages"
on public.packages
for all
to authenticated
using (private.is_project_neo_staff())
with check (private.is_project_neo_staff());

drop policy if exists "Active packages are public" on public.packages;
create policy "Active packages are public"
on public.packages
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Project Neo staff manage package services" on public.package_services;
create policy "Project Neo staff manage package services"
on public.package_services
for all
to authenticated
using (private.is_project_neo_staff())
with check (private.is_project_neo_staff());

drop policy if exists "Package services for active packages are public" on public.package_services;
create policy "Package services for active packages are public"
on public.package_services
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.packages
    where packages.id = package_services.package_id
      and packages.is_active = true
  )
);

drop policy if exists "Project Neo staff manage booking inquiries" on public.booking_inquiries;
create policy "Project Neo staff manage booking inquiries"
on public.booking_inquiries
for all
to authenticated
using (private.is_project_neo_staff())
with check (private.is_project_neo_staff());

drop policy if exists "Public users can submit booking inquiries" on public.booking_inquiries;
create policy "Public users can submit booking inquiries"
on public.booking_inquiries
for insert
to anon, authenticated
with check (
  status = 'new'
  and client_id is null
  and length(trim(full_name)) > 1
  and event_date is not null
  and event_type is not null
  and city_state is not null
  and guest_count is not null
  and quoted_amount_cents is null
  and deposit_requested_cents is null
  and internal_notes is null
  and reviewed_at is null
  and confirmed_at is null
  and cancelled_at is null
);

drop policy if exists "Project Neo staff manage contact messages" on public.contact_messages;
create policy "Project Neo staff manage contact messages"
on public.contact_messages
for all
to authenticated
using (private.is_project_neo_staff())
with check (private.is_project_neo_staff());

drop policy if exists "Public users can submit contact messages" on public.contact_messages;
create policy "Public users can submit contact messages"
on public.contact_messages
for insert
to anon, authenticated
with check (status = 'new' and internal_notes is null);

drop policy if exists "Project Neo staff manage events" on public.events;
create policy "Project Neo staff manage events"
on public.events
for all
to authenticated
using (private.is_project_neo_staff())
with check (private.is_project_neo_staff());

drop policy if exists "Portal clients can read their own events" on public.events;
create policy "Portal clients can read their own events"
on public.events
for select
to authenticated
using (
  exists (
    select 1
    from public.clients
    where clients.id = events.client_id
      and clients.portal_user_id = (select auth.uid())
  )
);

drop policy if exists "Project Neo staff manage invoices" on public.invoices;
create policy "Project Neo staff manage invoices"
on public.invoices
for all
to authenticated
using (private.is_project_neo_staff())
with check (private.is_project_neo_staff());

drop policy if exists "Portal clients can read their own invoices" on public.invoices;
create policy "Portal clients can read their own invoices"
on public.invoices
for select
to authenticated
using (
  exists (
    select 1
    from public.clients
    where clients.id = invoices.client_id
      and clients.portal_user_id = (select auth.uid())
  )
);

drop policy if exists "Project Neo staff manage invoice items" on public.invoice_items;
create policy "Project Neo staff manage invoice items"
on public.invoice_items
for all
to authenticated
using (private.is_project_neo_staff())
with check (private.is_project_neo_staff());

drop policy if exists "Portal clients can read their own invoice items" on public.invoice_items;
create policy "Portal clients can read their own invoice items"
on public.invoice_items
for select
to authenticated
using (
  exists (
    select 1
    from public.invoices
    join public.clients on clients.id = invoices.client_id
    where invoices.id = invoice_items.invoice_id
      and clients.portal_user_id = (select auth.uid())
  )
);

drop policy if exists "Project Neo staff manage payments" on public.payments;
create policy "Project Neo staff manage payments"
on public.payments
for all
to authenticated
using (private.is_project_neo_staff())
with check (private.is_project_neo_staff());

drop policy if exists "Portal clients can read their own payments" on public.payments;
create policy "Portal clients can read their own payments"
on public.payments
for select
to authenticated
using (
  exists (
    select 1
    from public.invoices
    join public.clients on clients.id = invoices.client_id
    where invoices.id = payments.invoice_id
      and clients.portal_user_id = (select auth.uid())
  )
);

drop policy if exists "Project Neo staff manage contracts" on public.contracts;
create policy "Project Neo staff manage contracts"
on public.contracts
for all
to authenticated
using (private.is_project_neo_staff())
with check (private.is_project_neo_staff());

drop policy if exists "Portal clients can read their own contracts" on public.contracts;
create policy "Portal clients can read their own contracts"
on public.contracts
for select
to authenticated
using (
  exists (
    select 1
    from public.clients
    where clients.id = contracts.client_id
      and clients.portal_user_id = (select auth.uid())
  )
);

drop policy if exists "Project Neo staff manage song requests" on public.song_requests;
create policy "Project Neo staff manage song requests"
on public.song_requests
for all
to authenticated
using (private.is_project_neo_staff())
with check (private.is_project_neo_staff());

drop policy if exists "Portal clients can read song requests for their events" on public.song_requests;
create policy "Portal clients can read song requests for their events"
on public.song_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.events
    join public.clients on clients.id = events.client_id
    where events.id = song_requests.event_id
      and clients.portal_user_id = (select auth.uid())
  )
);

drop policy if exists "Portal clients can add requested songs for their events" on public.song_requests;
create policy "Portal clients can add requested songs for their events"
on public.song_requests
for insert
to authenticated
with check (
  status = 'requested'
  and exists (
    select 1
    from public.events
    join public.clients on clients.id = events.client_id
    where events.id = song_requests.event_id
      and clients.portal_user_id = (select auth.uid())
  )
);

drop policy if exists "Portal clients can edit requested songs for their events" on public.song_requests;
create policy "Portal clients can edit requested songs for their events"
on public.song_requests
for update
to authenticated
using (
  exists (
    select 1
    from public.events
    join public.clients on clients.id = events.client_id
    where events.id = song_requests.event_id
      and clients.portal_user_id = (select auth.uid())
  )
)
with check (
  status = 'requested'
  and exists (
    select 1
    from public.events
    join public.clients on clients.id = events.client_id
    where events.id = song_requests.event_id
      and clients.portal_user_id = (select auth.uid())
  )
);

drop policy if exists "Project Neo staff manage gallery items" on public.gallery_items;
create policy "Project Neo staff manage gallery items"
on public.gallery_items
for all
to authenticated
using (private.is_project_neo_staff())
with check (private.is_project_neo_staff());

drop policy if exists "Published gallery items are public" on public.gallery_items;
create policy "Published gallery items are public"
on public.gallery_items
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "Project Neo staff manage mixes" on public.mixes;
create policy "Project Neo staff manage mixes"
on public.mixes
for all
to authenticated
using (private.is_project_neo_staff())
with check (private.is_project_neo_staff());

drop policy if exists "Published mixes are public" on public.mixes;
create policy "Published mixes are public"
on public.mixes
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "Project Neo staff manage event notes" on public.event_notes;
create policy "Project Neo staff manage event notes"
on public.event_notes
for all
to authenticated
using (private.is_project_neo_staff())
with check (private.is_project_neo_staff());

drop policy if exists "Portal clients can read public event notes" on public.event_notes;
create policy "Portal clients can read public event notes"
on public.event_notes
for select
to authenticated
using (
  is_private = false
  and exists (
    select 1
    from public.events
    join public.clients on clients.id = events.client_id
    where events.id = event_notes.event_id
      and clients.portal_user_id = (select auth.uid())
  )
);

drop policy if exists "Project Neo staff manage tasks" on public.tasks;
create policy "Project Neo staff manage tasks"
on public.tasks
for all
to authenticated
using (private.is_project_neo_staff())
with check (private.is_project_neo_staff());

drop function if exists public.is_project_neo_admin();
drop function if exists public.is_project_neo_staff();

insert into public.services (name, slug, description, base_price_cents, duration_minutes, sort_order)
values
  ('DJ Performance', 'dj-performance', 'Live DJ mixing for weddings, private parties, corporate events, and clubs.', 80000, 240, 10),
  ('MC and Announcements', 'mc-announcements', 'Professional hosting, timeline announcements, and crowd direction.', 20000, null, 20),
  ('Ceremony Sound', 'ceremony-sound', 'Separate ceremony audio setup with microphones and music playback.', 25000, 60, 30),
  ('Uplighting', 'uplighting', 'Room accent lighting matched to the event style and color palette.', 30000, null, 40)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  base_price_cents = excluded.base_price_cents,
  duration_minutes = excluded.duration_minutes,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.packages (name, slug, description, price_cents, deposit_cents, duration_minutes, features, sort_order)
values
  (
    'Essentials',
    'essentials',
    'Core DJ coverage for smaller celebrations and focused private events.',
    90000,
    25000,
    240,
    array['DJ performance', 'Basic sound system', 'Planning call'],
    10
  ),
  (
    'Signature',
    'signature',
    'Most popular package for weddings and milestone events.',
    140000,
    40000,
    360,
    array['DJ performance', 'MC announcements', 'Premium sound system', 'Custom planning timeline'],
    20
  ),
  (
    'Elite Experience',
    'elite-experience',
    'Expanded entertainment package with ceremony support and lighting.',
    220000,
    60000,
    480,
    array['DJ performance', 'MC announcements', 'Ceremony sound', 'Uplighting', 'Priority planning'],
    30
  )
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  price_cents = excluded.price_cents,
  deposit_cents = excluded.deposit_cents,
  duration_minutes = excluded.duration_minutes,
  features = excluded.features,
  sort_order = excluded.sort_order,
  updated_at = now();

with package_service_map(package_slug, service_slug, quantity, sort_order) as (
  values
    ('essentials', 'dj-performance', 1::numeric, 10),
    ('signature', 'dj-performance', 1::numeric, 10),
    ('signature', 'mc-announcements', 1::numeric, 20),
    ('elite-experience', 'dj-performance', 1::numeric, 10),
    ('elite-experience', 'mc-announcements', 1::numeric, 20),
    ('elite-experience', 'ceremony-sound', 1::numeric, 30),
    ('elite-experience', 'uplighting', 1::numeric, 40)
)
insert into public.package_services (package_id, service_id, quantity, sort_order)
select packages.id, services.id, package_service_map.quantity, package_service_map.sort_order
from package_service_map
join public.packages on packages.slug = package_service_map.package_slug
join public.services on services.slug = package_service_map.service_slug
on conflict (package_id, service_id) do update
set
  quantity = excluded.quantity,
  sort_order = excluded.sort_order,
  updated_at = now();

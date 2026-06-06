-- Harden browser-role table grants for Project Neo production launch.
-- RLS remains the primary row filter, but TRUNCATE/TRIGGER/REFERENCES should not
-- be available to anon or authenticated browser roles.

revoke all privileges on
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
  public.tasks,
  public.availability_blocks
from anon, authenticated;

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
  public.tasks,
  public.availability_blocks
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

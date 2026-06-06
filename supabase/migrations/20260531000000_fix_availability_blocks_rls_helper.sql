-- Fix launch-blocking helper mismatch for availability_blocks RLS.
-- Core schema exposes private.is_project_neo_admin(); private.is_project_neo_staff()
-- is intentionally absent in the active migration set.

drop policy if exists "Project Neo staff manage availability blocks" on public.availability_blocks;
drop policy if exists "Project Neo admins manage availability blocks" on public.availability_blocks;

create policy "Project Neo admins manage availability blocks"
on public.availability_blocks
for all
to authenticated
using (private.is_project_neo_admin())
with check (private.is_project_neo_admin());

-- Document the service-only boundary without granting direct table access.
create policy account_deletion_targets_service_only
on app_private.account_deletion_targets
for all to service_role using (true) with check (true);

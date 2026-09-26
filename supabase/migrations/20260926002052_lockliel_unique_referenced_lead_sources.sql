create unique index if not exists lead_sources_unique_referenced_event_uidx
on public.lead_sources(lead_id,source_type,source_ref)
where source_ref is not null;

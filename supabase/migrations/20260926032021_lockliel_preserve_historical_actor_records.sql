alter table public.founders50_reviews
  alter column reviewer_id drop not null;

alter table public.founders50_reviews
  drop constraint founders50_reviews_reviewer_id_fkey,
  add constraint founders50_reviews_reviewer_id_fkey
    foreign key(reviewer_id)
    references public.profiles(id)
    on delete set null;

alter table public.group_weekly_checkins
  alter column submitted_by drop not null;

alter table public.group_weekly_checkins
  drop constraint group_weekly_checkins_submitted_by_fkey,
  add constraint group_weekly_checkins_submitted_by_fkey
    foreign key(submitted_by)
    references public.profiles(id)
    on delete set null;

alter table public.member_staff_notes
  alter column author_id drop not null;

alter table public.member_staff_notes
  drop constraint member_staff_notes_author_id_fkey,
  add constraint member_staff_notes_author_id_fkey
    foreign key(author_id)
    references public.profiles(id)
    on delete set null;

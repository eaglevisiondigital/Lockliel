alter table public.courses
  add constraint courses_title_length
    check (char_length(trim(title)) between 1 and 300),
  add constraint courses_description_length
    check (description is null or char_length(description)<=10000),
  add constraint courses_language_code_length
    check (char_length(language_code) between 2 and 35);

alter table public.leader_profiles
  add constraint leader_profiles_country_length
    check (country is null or char_length(country)<=160),
  add constraint leader_profiles_language_code_length
    check (char_length(language_code) between 2 and 35);

alter table public.lesson_assets
  add constraint lesson_assets_title_length
    check (title is null or char_length(title)<=300),
  add constraint lesson_assets_provider_length
    check (provider is null or char_length(provider)<=80),
  add constraint lesson_assets_provider_ref_length
    check (provider_ref is null or char_length(provider_ref)<=500),
  add constraint lesson_assets_storage_path_length
    check (storage_path is null or char_length(storage_path)<=1000);

alter table public.lessons
  add constraint lessons_slug_length
    check (char_length(slug) between 1 and 200),
  add constraint lessons_title_length
    check (char_length(trim(title)) between 1 and 300),
  add constraint lessons_translation_key_length
    check (char_length(translation_key) between 1 and 200),
  add constraint lessons_video_provider_length
    check (video_provider is null or char_length(video_provider)<=80),
  add constraint lessons_video_ref_length
    check (video_ref is null or char_length(video_ref)<=500),
  add constraint lessons_worksheet_schema_object
    check (jsonb_typeof(worksheet_schema)='object'),
  add constraint lessons_worksheet_schema_size
    check (pg_column_size(worksheet_schema)<=131072),
  add constraint lessons_worksheet_questions_array
    check (
      not (worksheet_schema ? 'questions')
      or jsonb_typeof(worksheet_schema->'questions')='array'
    ),
  add constraint lessons_worksheet_questions_count
    check (
      not (worksheet_schema ? 'questions')
      or jsonb_array_length(worksheet_schema->'questions')<=100
    );

alter table public.products
  add constraint products_description_length
    check (description is null or char_length(description)<=10000),
  add constraint products_storage_path_length
    check (storage_path is null or char_length(storage_path)<=1000),
  add constraint products_cover_path_length
    check (cover_path is null or char_length(cover_path)<=1000);

alter table public.referral_links
  add constraint referral_links_campaign_length
    check (campaign is null or char_length(campaign)<=120),
  add constraint referral_links_content_id_length
    check (content_id is null or char_length(content_id)<=100),
  add constraint referral_links_content_type_length
    check (content_type is null or char_length(content_type)<=80);

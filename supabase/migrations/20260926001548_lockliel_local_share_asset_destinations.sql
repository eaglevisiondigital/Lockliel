alter table public.share_assets
  drop constraint if exists share_assets_destination_local_path,
  add constraint share_assets_destination_local_path
    check (
      char_length(destination_path)>=1
      and char_length(destination_path)<=500
      and left(destination_path,1)='/'
      and left(destination_path,2)<>'//'
    );

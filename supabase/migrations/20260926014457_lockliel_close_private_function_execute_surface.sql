alter default privileges in schema app_private
  revoke execute on functions from public;

revoke all on function app_private.convert_linked_lead()
from public,anon,authenticated;

revoke all on function app_private.default_translation_key_from_slug()
from public,anon,authenticated;

revoke all on function app_private.preserve_lesson_start_time()
from public,anon,authenticated;

revoke all on function app_private.preserve_media_start_time()
from public,anon,authenticated;

revoke all on function app_private.resolve_course_translation(uuid,text)
from public,anon,authenticated;

revoke all on function app_private.resolve_equivalent_lesson(uuid,text)
from public,anon,authenticated;

revoke all on function app_private.resolve_product_translation(uuid,text)
from public,anon,authenticated;

revoke all on function app_private.resolve_share_asset_translation(uuid,text)
from public,anon,authenticated;

revoke all on function app_private.validate_feature_activation()
from public,anon,authenticated;

revoke all on function app_private.validate_product_release()
from public,anon,authenticated;

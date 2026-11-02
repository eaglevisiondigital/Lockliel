"""Pure local provider-evidence checks. No network or credential access."""
import re

SITE = '70b03a42-6329-476e-bf4b-2b1ce30e9567'
NAME = 'jade-unicorn-642f40'
TEAM = '6a674f7a0e2cdcc2b838db89'
SITE_KEYS = {'id', 'name', 'account_id', 'published_deploy', 'deploy_id',
             'custom_domain', 'domain_aliases', 'branch_deploy_custom_domain',
             'deploy_preview_custom_domain'}
SNAP_SITE_KEYS = {'id', 'name', 'account_id', 'publishedId', 'deploy_id',
                  'custom_domain', 'domain_aliases', 'branch_deploy_custom_domain',
                  'deploy_preview_custom_domain'}
DEPLOY_KEYS = {'id', 'site_id', 'state', 'context', 'published_at'}


def valid_id(value):
    return isinstance(value, str) and re.fullmatch(r'[0-9a-f]{24}', value) is not None


def site_publication_complete(site):
    required = {'id', 'name', 'account_id', 'published_deploy', 'deploy_id'}
    return (isinstance(site, dict) and required <= site.keys()
            and site['id'] == SITE and site['name'] == NAME
            and site['account_id'] == TEAM and site['published_deploy'] is None
            and site['deploy_id'] == '')


def site_complete(site):
    """Require independent raw publication fields; never default missing to null."""
    return (isinstance(site, dict) and SITE_KEYS <= site.keys()
            and site['id'] == SITE and site['name'] == NAME
            and site['account_id'] == TEAM and site['published_deploy'] is None
            and site['deploy_id'] == '' and site['custom_domain'] is None
            and site['domain_aliases'] == []
            and site['branch_deploy_custom_domain'] is None
            and site['deploy_preview_custom_domain'] is None)


def site_projection(site):
    if not site_complete(site):
        return None
    return {**{k: site[k] for k in SITE_KEYS - {'published_deploy'}},
            'publishedId': None}


def preservation_complete(before, after, ident, *, removed=False):
    if not all(isinstance(x, dict) for x in (before, after)):
        return False
    needed = {'site', 'historicalDeploys', 'deployedBranches', 'allDeployIds'}
    if not all(needed <= x.keys() for x in (before, after)):
        return False
    bs, a_s = before['site'], after['site']
    if not all(isinstance(x, dict) and SNAP_SITE_KEYS <= x.keys() for x in (bs, a_s)):
        return False
    if bs != a_s or bs['id'] != SITE or bs['name'] != NAME or bs['account_id'] != TEAM:
        return False
    if bs['publishedId'] is not None or bs['deploy_id'] != '':
        return False
    history = before['historicalDeploys']
    if not isinstance(history, dict) or not history or ident in history:
        return False
    if after['historicalDeploys'] != history:
        return False
    if not all(valid_id(k) and isinstance(v, dict) and v.get('id') == k
               and v.get('site_id') == SITE for k, v in history.items()):
        return False
    if before['deployedBranches'] != after['deployedBranches']:
        return False
    if not isinstance(before['deployedBranches'], list):
        return False
    old = set(history)
    for snap, expected in ((before, old), (after, old if removed else old | {ident})):
        ids = snap['allDeployIds']
        if (not isinstance(ids, list) or not all(valid_id(i) for i in ids)
                or len(set(ids)) != len(ids) or set(ids) != expected):
            return False
    return True


def draft_form(deploy):
    if 'draft' not in deploy:
        return 'omitted'
    if deploy['draft'] is None:
        return 'null'
    if deploy['draft'] is True:
        return 'true'
    return 'denied'


def check_deploy_pair(created, observed, site, ident, before, after, *, stage='reserve'):
    """Allow optional draft only with TWO provider receipts and publication proof."""
    def deny(reason):
        return {'ok': False, 'reason': reason}
    if stage not in ('reserve', 'finalize') or not valid_id(ident):
        return deny('invalid_stage_or_id')
    if not site_complete(site):
        return deny('independent_site_publication_metadata_missing_or_changed')
    if not preservation_complete(before, after, ident):
        return deny('historical_deployment_or_alias_preservation_not_verified')
    if site_projection(site) != after['site']:
        return deny('site_receipts_disagree')
    for index, d in enumerate((created, observed)):
        if not isinstance(d, dict) or not DEPLOY_KEYS <= d.keys():
            return deny('required_deployment_metadata_missing')
        if d['id'] != ident or d['site_id'] != SITE or ident in before['historicalDeploys']:
            return deny('deployment_identity_mismatch')
        if d['context'] != 'deploy-preview':
            return deny('required_context_not_verified')
        if d['published_at'] is not None:
            return deny('published_deployment')
        if d.get('branch') is not None or d.get('review_id') is not None:
            return deny('unexpected_alias_or_review_binding')
        if draft_form(d) == 'denied':
            return deny('explicit_false_or_malformed_draft')
        allowed = {'new', 'prepared'} if index == 0 or stage == 'reserve' else {'ready'}
        if d['state'] not in allowed:
            return deny('expected_reservation_or_finalization_state_not_verified')
    return {'ok': True, 'reason': 'independent_identity_publication_and_preservation_verified',
            'createDraft': draft_form(created), 'observedDraft': draft_form(observed)}


def cleanup_complete(ident, before, after, site_status, global_status, url_status):
    return (valid_id(ident) and site_status == 404 and global_status == 404
            and url_status == 404 and preservation_complete(before, after, ident, removed=True))

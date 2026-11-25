"""Materialize a credential-free, default-blocked experiment kit. Never call providers."""
import argparse
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
PINS = {
    'experiment.py.txt': '993cae277ee28ef4671914b9274d47aa93beaaf90726ec03d0cf20d7f3ee0d72',
    'preflight.py.txt': '684e63c2ecda1fe5a6e0ddc65a94fe0dfb3f7c521bb49cc44bdd13033dcd46e9',
    'verify.py.txt': 'cee0aa64c449269c9642cf0555cad3167e328e39fd5d935f00b2f38f74c441e2',
}
GUARD = '''import sys
if sys.argv[1:] != ['--execute-after-owner-authorization']:
    print('BLOCKED: local preparation only; a separate owner authorization is required.')
    raise SystemExit(2)
'''


def swap(source, old, new, count=1):
    if source.count(old) != count:
        raise ValueError('Historical template differs from reviewed patch location')
    return source.replace(old, new)


def materialize(output):
    output = Path(output).resolve()
    if output.exists() or not str(output).startswith('/private/tmp/'):
        raise ValueError('Choose a NEW directory under /private/tmp; no overwrite')
    sources = {}
    for name, expected in PINS.items():
        data = (HERE / 'templates' / name).read_bytes()
        if hashlib.sha256(data).hexdigest() != expected:
            raise ValueError('Historical helper seal mismatch')
        sources[name] = data.decode()
    original = dict(sources)
    ex = sources['experiment.py.txt']
    start, end = ex.index('def phase3('), ex.index("assert not JOURNAL.exists()")
    ex = ex[:start] + '''def phase3(d,site,ident):
 result=check_deploy_pair(reservation_metadata,d,site,ident,
                         journal['beforeReservation'],
                         journal['afterFinalization' if finalize_attempted else 'afterReservation'],
                         stage='finalize' if finalize_attempted else 'reserve')
 journal['latestProviderGate']=result
 save()
 return result['ok']

''' + ex[end:]
    ex = swap(ex, "assert not JOURNAL.exists(),'Existing experiment journal prohibits automatic repeat reservation'", "JOURNAL.open('x').close() # Exclusive, one-attempt journal; never overwrite or retry")
    ex = swap(ex, "cfg=json.loads(Path('/Users/davesmacbookpro/Library/Preferences/netlify/config.json').read_text());assert cfg['userId']==USER;token=cfg['users'][USER]['auth']['token'];assert token", "if (datetime.now(timezone.utc)-datetime.fromisoformat(BASE['observedAt'])).total_seconds() not in range(0,301):\n raise Stop('fresh_preflight_required')\nif BASE.get('operator',{}).get('teamSiteAccess')!='all' or not BASE.get('preflightPassed'):\n raise Stop('operator_or_cost_preflight_not_verified')\ncfg=json.loads(Path('/Users/davesmacbookpro/Library/Preferences/netlify/config.json').read_text());assert cfg['userId']==USER;token=cfg['users'][USER]['auth']['token'];assert token")
    # Avoid float membership in range; preserve an inclusive five-minute age bound.
    ex = ex.replace("if (datetime.now(timezone.utc)-datetime.fromisoformat(BASE['observedAt'])).total_seconds() not in range(0,301):", "if not 0 <= (datetime.now(timezone.utc)-datetime.fromisoformat(BASE['observedAt'])).total_seconds() <= 300:")
    ex = swap(ex, 'start=time.monotonic();new_id=None;create_attempted=False;finalize_attempted=False', 'start=time.monotonic();new_id=None;create_attempted=False;finalize_attempted=False;reservation_metadata=None')
    ex = swap(ex, 'st,s=api(\'GET\',\'/sites/\'+SITE);assert st==200 and s.get(\'id\')==SITE and s.get(\'name\')==NAME and s.get(\'account_id\')==TEAM', "st,s=api('GET','/sites/'+SITE)\n if st!=200 or not site_complete(s):raise Stop('required_raw_site_metadata_not_verified')")
    ex = swap(ex, 'save();return stable,rows', 'save();return s,rows')
    ex = swap(ex, "if st!=200 or (s.get('published_deploy') or {}).get('id')==new_id or s.get('deploy_id')==new_id:raise Stop('cleanup_publication_guard_failed')", "if st!=200 or not site_publication_complete(s):raise Stop('cleanup_publication_guard_failed')")
    ex = swap(ex, "new_id=d['id'];journal['experimentalId']=new_id;journal['reservationResponse']=minimal(d);save()", "new_id=d['id'];reservation_metadata=d;journal['experimentalId']=new_id;journal['reservationResponse']=receipt(d);save()")
    for key in ['reservedProviderMetadata', 'finalizedProviderMetadata', 'cleanupIdentity']:
        ex = swap(ex, "journal['" + key + "']=minimal(d)", "journal['" + key + "']=receipt(d)")
    old = "st,d=api('GET','/sites/'+SITE+'/deploys/'+new_id)\n journal['finalizedProviderMetadata']"
    new = "for attempt in range(6):\n  st,d=api('GET','/sites/'+SITE+'/deploys/'+new_id)\n  if st!=200 or d.get('state') in ['ready','error','rejected']:break\n  time.sleep(1)\n journal['finalizedProviderMetadata']"
    ex = swap(ex, old, new)
    ex = swap(ex, "if len(journal['calls'])>=30 or (time.monotonic()-start>600 and not cleanup):raise Stop('request_or_time_budget_reached')", "if len(journal['calls']) >= (40 if cleanup else 20) or (time.monotonic()-start>600 and not cleanup):raise Stop('request_or_time_budget_reached')")
    ex = swap(ex, "'requestBudget':30,", "'requestBudget':40,'normalRequestBudget':20,'cleanupQuotaReserved':20,")
    a, b = ex.index('def snapshot('), ex.index('def verify_ownership(')
    block = ex[a:b].replace('def snapshot(label):', 'def snapshot(label,cleanup=False):')
    block = block.replace("api('GET','/sites/'+SITE)", "api('GET','/sites/'+SITE,cleanup=cleanup)")
    block = block.replace("api('GET','/sites/'+SITE+'/deploys?per_page=100&page=1')", "api('GET','/sites/'+SITE+'/deploys?per_page=100&page=1',cleanup=cleanup)")
    block = block.replace("api('GET','/sites/'+SITE+'/deployed-branches')", "api('GET','/sites/'+SITE+'/deployed-branches',cleanup=cleanup)")
    ex = ex[:a] + block + ex[b:]
    ex = swap(ex, "snapshot('afterCleanup')", "snapshot('afterCleanup',cleanup=True)")
    receipt = '''from checker import check_deploy_pair, site_complete, site_publication_complete

def receipt(d):
 result=minimal(d)
 result['draftFieldPresent']='draft' in d
 result['publishedAtFieldPresent']='published_at' in d
 return result

'''
    # receipt() is called only after the original minimal() definition is loaded.
    ex = receipt + ex

    pre = sources['preflight.py.txt']
    pre = swap(pre, "'teamRole':a.get('role') if a else None", "'teamRole':a.get('role') if a else None,'teamSiteAccess':a.get('site_access') if a else None")
    marker = "Path('/private/tmp/lockliel-wave10e-preflight.json').write_text"
    insertion = '''from checker import site_complete
if not (out['operator']['authenticatedCallerMatchesExpected'] and out['operator']['teamOwnerIdMatchesCaller']
        and out['operator']['teamRole']=='Owner' and out['operator']['teamSiteAccess']=='all'
        and out['deployListComplete'] and len(allrows)<100 and branches==[] and site_complete(s)):
 raise SystemExit('BLOCKED: site, operator, publication or complete alias inventory not verified')
out['billing']={k:a.get(k) for k in ['type_slug','plan_credits','auto_topup_enabled','lifecycle_state','usages_exceeded','configurable_limits_exceeded']}
credits=a.get('capabilities',{}).get('credits',{})
if not (a.get('lifecycle_state')=='active' and a.get('auto_topup_enabled') is False
        and a.get('usages_exceeded')==[] and a.get('configurable_limits_exceeded')==[]
        and type(credits.get('included')) in (int,float) and type(credits.get('used')) in (int,float)
        and credits['included']-credits['used']>=20):
 raise SystemExit('BLOCKED: bounded cost exposure not established; no billing setting may change')
out['publicBaselines']=[]
latest=next((d['id'] for d in allrows if d.get('branch')=='rehearsal' and d.get('state')=='ready'),None)
if not latest:raise SystemExit('BLOCKED: existing rehearsal identity missing')
for target in ['https://jade-unicorn-642f40.netlify.app/','https://rehearsal--jade-unicorn-642f40.netlify.app/',
               'https://'+latest+'--jade-unicorn-642f40.netlify.app/']:
 try:
  with opener.open(urllib.request.Request(target,method='GET'),timeout=20) as response:
   status=response.status;body=response.read(100000);headers=response.headers
 except urllib.error.HTTPError as error:
  status=error.code;body=error.read(100000);headers=error.headers
 from urllib.parse import urlsplit
 location=headers.get('location')
 out['publicBaselines'].append({'url':target,'status':status,'sha256':hashlib.sha256(body).hexdigest(),
                                'locationPath':urlsplit(location).path if location else None})
if not (out['publicBaselines'][0]['status']==404 and out['publicBaselines'][1]['status']==302
        and out['publicBaselines'][2]['status']==302
        and out['publicBaselines'][1]['sha256']==out['publicBaselines'][2]['sha256']):
 raise SystemExit('BLOCKED: existing public alias baseline cannot be established')
out['preflightPassed']=True
'''
    pre = swap(pre, marker, insertion + marker)

    verify = sources['verify.py.txt']
    verify = swap(verify, "ID='6ae8942b7f6512d039ce0da6'", 'ID=None')
    verify = swap(verify, "extra=json.loads(Path('/private/tmp/lockliel-wave10e-baseline-extra.json').read_text());", "extra={'publicBaselines':base['publicBaselines']};")
    verify = swap(verify, "assert journal['containmentVerified'] and journal['experimentalId']==ID", "ID=journal.get('experimentalId');\nfrom checker import valid_id,site_complete\nassert valid_id(ID) and ID not in {x['id'] for x in base['deploys']}")
    verify = swap(verify, "st,s=get('/sites/'+SITE);assert st==200 and s['id']==SITE and s['name']==NAME", "st,s=get('/sites/'+SITE);assert st==200 and site_complete(s)")
    verify = swap(verify, "'https://6abfd81ccee16b59b75711a0--'+NAME+'.netlify.app/'", "'https://'+next(d['id'] for d in base['deploys'] if d.get('branch')=='rehearsal' and d.get('state')=='ready')+'--'+NAME+'.netlify.app/'")
    replacements = {
        '/private/tmp/lockliel-wave10e-preflight.json': str(output / 'preflight.json'),
        '/private/tmp/lockliel-wave10e-experiment.json': str(output / 'experiment.json'),
        '/private/tmp/lockliel-wave10e-independent-verification.json': str(output / 'independent-verification.json'),
    }
    generated = {'preflight.py': pre, 'experiment.py': ex, 'verify.py': verify}
    for name, body in generated.items():
        for old, new in replacements.items():
            body = body.replace(old, new)
        generated[name] = GUARD + body
        compile(generated[name], name, 'exec')
    output.mkdir(mode=0o700)
    (output / 'checker.py').write_bytes((HERE / 'checker.py').read_bytes())
    for name, body in generated.items():
        (output / name).write_text(body)
    manifest = {'mode': 'PREPARED_ONLY_NOT_AUTHORIZED', 'siteId': '70b03a42-6329-476e-bf4b-2b1ce30e9567',
                'historicalTemplateHashes': PINS, 'files': {p.name: hashlib.sha256(p.read_bytes()).hexdigest()
                for p in sorted(output.glob('*.py'))}, 'requiresSeparateOwnerAuthorization': True,
                'remoteCallsDuringPreparation': 0, 'credentialAccessDuringPreparation': False}
    (output / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    return manifest


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output-dir', required=True)
    args = parser.parse_args()
    print(json.dumps(materialize(args.output_dir), indent=2))

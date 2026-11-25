#!/usr/bin/env python3
"""Offline review helper. Reads files only; never connects or authorizes a release."""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--snapshot', type=Path)
parser.add_argument('--phase', choices=['274', '275', '276', '277'], default='274')
args = parser.parse_args()
manifest = json.loads((HERE / 'manifest.json').read_text())
historical = json.loads((ROOT / manifest['historical_manifest']).read_text())
expected = historical | {m['filename']: m['sha256'] for m in manifest['migrations']}
actual = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in (ROOT / 'supabase/migrations').glob('*.sql')}
errors = []
def require(ok, message):
    if not ok:
        errors.append(message)
require(len(historical) == 274, 'Historical manifest must contain 274 entries')
require(actual == expected, 'Migration filenames/bytes differ from exact 277-file inventory')
if args.snapshot:
    snap = json.loads(args.snapshot.read_text())
    phase = int(args.phase)
    ledger = [x['version'] for x in snap['ledger']]
    required_versions = sorted(f.split('_', 1)[0] for f in historical)
    required_versions += [m['filename'].split('_', 1)[0] for m in manifest['migrations'][:phase-274]]
    require(ledger == sorted(required_versions), 'Ledger is not the exact repository prefix for this phase')
    for key, count in snap['compatibility'].items():
        if key != 'non_null_durations':
            require(count == 0, 'Compatibility violation: ' + key)
    require(snap['waiters'] == 0 and not snap['locks'] and not snap['active_transactions'], 'Activity/locks require review')
    delta = json.loads((HERE / 'expected-catalog-277.json').read_text())
    if phase == 274:
        for key, fields in [('columns', ['table','column']), ('constraints',['table','name']), ('policies',['tablename','policyname'])]:
            for item in delta[key]:
                require(not any(all(x[f] == item[f] for f in fields) for x in snap[key]), 'New object collision in ' + key + ': ' + str([item[f] for f in fields]))
        for name in ['course_watch_met','course_lesson_unlocked','audit_learning_configuration','lockliel_course_gates','lockliel_save_lesson','lockliel_sample_media']:
            require(not any(x['name'] == name for x in snap['functions']), 'New function collision: ' + name)
        for name in ['audit_learning_course','audit_learning_duration_source','audit_learning_media','audit_learning_lesson']:
            require(not any(x['name'] == name for x in snap['triggers']), 'New trigger collision: ' + name)
        require(not any(t['name'] in ['lesson_private_notes','course_answer_keys'] for t in snap['tables']), 'New table collision')
        require(any(x['name']=='normalize_lesson_asset_duration_verification_trigger' and x['enabled']=='O' for x in snap['triggers']), 'Required existing duration trigger absent')
        baseline = json.loads((ROOT / 'docs/evidence/course-release-review-2026-09-30/production-after.json').read_text())
        for key in ['columns','constraints','policies','triggers','grants','column_grants','functions']:
            require(snap[key] == baseline[key], 'Production baseline catalog drift: ' + key)
    else:
        for key in ['columns','constraints','policies','triggers','grants','column_grants']:
            for item in delta[key]:
                require(item in snap[key], 'Missing/changed expected ' + key + ': ' + str(item))
        for item in delta['tables']:
            require(any(all(t[k] == v for k,v in item.items()) for t in snap['tables']), 'New table/RLS mismatch: ' + item['name'])
        for item in delta['functions']:
            matches = [f for f in snap['functions'] if (f['schema'],f['name'],f['arguments']) == (item['schema'],item['name'],item['arguments'])]
            require(len(matches)==1, 'Function signature missing/ambiguous: ' + item['name'])
            if not matches:
                continue
            if item['name']=='validate_course_release' and phase==275:
                require(not matches[0]['definer'], '276 unexpectedly present at stage 275')
            elif item['name']=='lockliel_save_lesson' and phase<277:
                require(all(matches[0][k]==item[k] for k in item if k!='body_md5'), 'Save function privileges/signature differ')
                # Body hash for pre-277 must be established by the new runner rehearsal.
            else:
                require(matches[0] == item, 'Function implementation/privilege mismatch: ' + item['name'])
if errors:
    raise SystemExit('\n'.join(['OFFLINE REVIEW FAILED'] + errors))
print('OFFLINE REVIEW PASSED: exact 277 migration hashes' + (' and phase '+args.phase+' snapshot checks' if args.snapshot else ''))
print('Not release authorization. Fresh TLS, backups, maintenance, stage rehearsal and manual gates remain required.')

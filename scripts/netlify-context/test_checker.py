"""Offline checker and prepared-operator regressions. Real sockets are denied."""
import contextlib,copy,hashlib,io,json,runpy,socket,sys,tempfile,unittest,urllib.error
from pathlib import Path
from unittest.mock import patch
from checker import SITE,NAME,TEAM,check_deploy_pair,cleanup_complete
from prepare import materialize
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
HISTORY=json.loads((ROOT/'docs/coordination/evidence/2026-11-02-wave10e/experiment.json').read_text())['beforeReservation']
ID='f'*24;USER='6a674f7a0e2cdcc2b838db86';CONFIG='/Users/davesmacbookpro/Library/Preferences/netlify/config.json'
def fixtures(draft=True):
 before=copy.deepcopy(HISTORY);after=copy.deepcopy(before);after['allDeployIds'].append(ID);after['allDeployIds'].sort()
 site={**{k:v for k,v in before['site'].items() if k!='publishedId'},'published_deploy':None}
 d={'id':ID,'site_id':SITE,'context':'deploy-preview','state':'new','draft':draft,'published_at':None,'branch':None,'review_id':None}
 return d,copy.deepcopy(d),site,before,after
class EvidenceTests(unittest.TestCase):
 def setUp(self):
  p=patch('socket.socket',side_effect=AssertionError('network forbidden'));p.start();self.addCleanup(p.stop)
 def verdict(self,f,stage='reserve'):
  a,b,s,before,after=f;return check_deploy_pair(a,b,s,ID,before,after,stage=stage)['ok']
 def test_draft_true(self):self.assertTrue(self.verdict(fixtures(True)))
 def test_draft_null_complete_proof(self):self.assertTrue(self.verdict(fixtures(None)))
 def test_draft_omitted_complete_proof(self):
  f=fixtures();del f[0]['draft'];del f[1]['draft'];self.assertTrue(self.verdict(f))
 def test_false_and_malformed_draft(self):
  for val in [False,0,1,'true','',[],{}]:
   for i in (0,1):
    with self.subTest(value=val,index=i):
     f=fixtures(None);f[i]['draft']=val;self.assertFalse(self.verdict(f))
 def test_context_site_id_on_either_receipt(self):
  for k,v in [('context','branch-deploy'),('context','production'),('site_id','other'),('id',next(iter(HISTORY['historicalDeploys'])))]:
   for i in (0,1):
    with self.subTest(key=k,index=i):
     f=fixtures(None);f[i][k]=v;self.assertFalse(self.verdict(f))
 def test_missing_deploy_metadata(self):
  for k in ['id','site_id','state','context']:
   for i in (0,1):
    with self.subTest(key=k,index=i):
     f=fixtures(None);del f[i][k];self.assertFalse(self.verdict(f))
 def test_missing_raw_site_metadata(self):
  for k in fixtures()[2]:
   with self.subTest(key=k):
    f=fixtures(None);del f[2][k];self.assertFalse(self.verdict(f))
 def test_omitted_optional_timestamp_requires_independent_site_proof(self):
  f=fixtures(None);del f[0]['published_at'];del f[1]['published_at'];self.assertTrue(self.verdict(f))
  del f[2]['published_deploy'];self.assertFalse(self.verdict(f))
 def test_published_timestamp(self):
  for i in (0,1):
   f=fixtures(None);f[i]['published_at']='2026-11-02T14:00:00Z';self.assertFalse(self.verdict(f))
 def test_current_publication_pointers(self):
  for k,v in [('published_deploy',{'id':ID}),('deploy_id',ID)]:
   f=fixtures(None);f[2][k]=v;self.assertFalse(self.verdict(f))
 def test_malformed_publication_metadata(self):
  for k,v in [('published_deploy',{}),('published_deploy',''),('deploy_id',None)]:
   f=fixtures(None);f[2][k]=v;self.assertFalse(self.verdict(f))
 def test_site_name_and_team(self):
  for k in ['id','name','account_id']:
   f=fixtures(None);f[2][k]='other';self.assertFalse(self.verdict(f))
 def test_alias_changes(self):
  for k,v in [('domain_aliases',['unexpected.invalid']),('custom_domain','unexpected.invalid'),('branch_deploy_custom_domain','unexpected.invalid'),('deploy_preview_custom_domain','unexpected.invalid')]:
   f=fixtures(None);f[4]['site'][k]=v;self.assertFalse(self.verdict(f))
  f=fixtures(None);f[4]['deployedBranches']=[{'name':'other'}];self.assertFalse(self.verdict(f))
 def test_new_alias_and_review_binding(self):
  for k,v in [('branch','rehearsal'),('review_id',4)]:
   f=fixtures(None);f[1][k]=v;self.assertFalse(self.verdict(f))
 def test_historical_deletion_or_change(self):
  for missing in (True,False):
   f=fixtures(None);k=next(iter(f[4]['historicalDeploys']))
   if missing:del f[4]['historicalDeploys'][k]
   else:f[4]['historicalDeploys'][k]['context']='production'
   self.assertFalse(self.verdict(f))
 def test_missing_preservation_metadata(self):
  for i in (3,4):
   for k in HISTORY:
    f=fixtures(None);del f[i][k];self.assertFalse(self.verdict(f))
  for k in HISTORY['site']:
   f=fixtures(None);del f[4]['site'][k];self.assertFalse(self.verdict(f))
 def test_unknown_duplicate_ids(self):
  for ids in [[],fixtures()[4]['allDeployIds']+[ID],fixtures()[4]['allDeployIds']+['e'*24]]:
   f=fixtures(None);f[4]['allDeployIds']=ids;self.assertFalse(self.verdict(f))
 def test_missing_independent_receipt(self):
  f=fixtures(None);self.assertFalse(self.verdict((f[0],None,*f[2:])))
 def test_finalization_ready_same_id(self):
  for draft in (True,None):
   f=fixtures(draft);f[1]['state']='ready';self.assertTrue(self.verdict(f,'finalize'))
 def test_wrong_final_id_or_nonready_state(self):
  for state in ('new','processing','error',None):
   f=fixtures(None);f[1]['state']=state;self.assertFalse(self.verdict(f,'finalize'))
  f=fixtures(None);f[1]['state']='ready';f[1]['id']='e'*24;self.assertFalse(self.verdict(f,'finalize'))
 def test_cleanup_requires_independent_404s(self):
  before=copy.deepcopy(HISTORY);after=copy.deepcopy(before)
  self.assertTrue(cleanup_complete(ID,before,after,404,404,404))
  for statuses in [(200,404,404),(404,200,404),(404,404,503)]:self.assertFalse(cleanup_complete(ID,before,after,*statuses))
  self.assertFalse(cleanup_complete(next(iter(before['historicalDeploys'])),before,after,404,404,404))
  after['allDeployIds'].append(ID);self.assertFalse(cleanup_complete(ID,before,after,404,404,404))
class Response:
 def __init__(self,data=None,status=200,body=None):self.status=status;self.headers={};self.data=data;self.body=body
 def __enter__(self):return self
 def __exit__(self,*_):return False
 def read(self,*_):return self.body if self.body is not None else json.dumps(self.data).encode()
class FakeProvider:
 def __init__(self,draft=None,context='deploy-preview'):
  self.old=copy.deepcopy(list(HISTORY['historicalDeploys'].values()));self.new=None;self.deleted=False;self.calls=[];self.draft=draft;self.context=context;self.site=fixtures()[2]
  self.site.update({'url':'http://'+NAME+'.netlify.app','ssl_url':'https://'+NAME+'.netlify.app'})
  self.account={'id':TEAM,'role':'Owner','site_access':'all','owner_ids':[USER],'capabilities':{'credits':{'included':10000,'used':0}},'lifecycle_state':'active','auto_topup_enabled':False,'usages_exceeded':[],'configurable_limits_exceeded':[]}
 def open(self,request,**_):
  url=request.full_url;method=request.get_method();self.calls.append((method,url))
  if 'api.netlify.com/api/v1' not in url:
   if ID in url or url=='https://'+NAME+'.netlify.app/':raise urllib.error.HTTPError(url,404,'',{},io.BytesIO(b'not found'))
   raise urllib.error.HTTPError(url,302,'',{'location':'/my-lockliel/journey'},io.BytesIO(b'redirect'))
  path=url.split('/api/v1')[1];collection='/sites/'+SITE+'/deploys'
  if method=='POST' and path==collection:
   assert self.new is None and not self.deleted and json.loads(request.data)=={'draft':True}
   self.new=fixtures(self.draft)[0];self.new['context']=self.context;return Response(self.new)
  if method=='PUT':
   assert path==collection+'/'+ID and json.loads(request.data)=={'draft':True,'files':{}}
   self.new['state']='ready';return Response(self.new)
  if method=='DELETE':
   assert path==collection+'/'+ID and self.new is not None
   self.new=None;self.deleted=True;return Response(status=204,body=b'')
  if method=='POST' and path=='/deploys/'+ID+'/cancel':self.new['state']='error';return Response(self.new)
  assert method=='GET','unexpected mutation'
  if path=='/user':return Response({'id':USER})
  if path=='/accounts/'+TEAM:return Response(self.account)
  if path=='/sites/'+SITE:return Response(self.site)
  if path=='/sites/'+SITE+'/deployed-branches':return Response([])
  if path.startswith(collection+'?'):return Response(self.old+([self.new] if self.new else []))
  if path in (collection+'/'+ID,'/deploys/'+ID):
   if self.new is None:raise urllib.error.HTTPError(url,404,'',{},io.BytesIO(b''))
   return Response(self.new)
  raise AssertionError('unexpected request path')
class PreparedKitTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory(prefix='lockliel-wave10f-test-',dir='/private/tmp');self.addCleanup(self.tmp.cleanup);self.out=Path(self.tmp.name)/'kit';self.manifest=materialize(self.out)
 def run_script(self,name,provider):
  read=Path.read_text
  def protected_read(path,*args,**kwargs):
   if str(path)==CONFIG:return json.dumps({'userId':USER,'users':{USER:{'auth':{'token':'fixture'}}}})
   return read(path,*args,**kwargs)
  with patch.object(sys,'argv',[str(self.out/name),'--execute-after-owner-authorization']),patch.object(Path,'read_text',protected_read),patch('urllib.request.build_opener',return_value=provider),patch('socket.socket',side_effect=AssertionError('real network forbidden')),patch('time.sleep'),contextlib.redirect_stdout(io.StringIO()) as output:
   result=runpy.run_path(str(self.out/name),run_name='__main__')
  self.assertNotIn('Bearer fixture',output.getvalue());return result
 def test_default_block_before_credentials_or_network(self):
  for name in ['preflight.py','experiment.py','verify.py']:
   with self.subTest(name=name),patch.object(sys,'argv',[str(self.out/name)]),patch.object(Path,'read_text',side_effect=AssertionError('file/credential access forbidden')),patch('socket.socket',side_effect=AssertionError('network forbidden')),contextlib.redirect_stdout(io.StringIO()):
    with self.assertRaises(SystemExit) as e:runpy.run_path(str(self.out/name),run_name='__main__')
    self.assertEqual(e.exception.code,2)
 def test_manifest_and_no_overwrite(self):
  for name,expected in self.manifest['files'].items():self.assertEqual(hashlib.sha256((self.out/name).read_bytes()).hexdigest(),expected)
  with self.assertRaises(ValueError):materialize(self.out)
 def test_mocked_null_full_workflow_and_independent_cleanup(self):
  server=FakeProvider(None);self.run_script('preflight.py',server);self.run_script('experiment.py',server);self.run_script('verify.py',server)
  journal=json.loads((self.out/'experiment.json').read_text());self.assertEqual(journal['assessment'],'NETLIFY DEPLOYMENT WORKFLOW VERIFIED');self.assertEqual(journal['reservationAttempts'],1);self.assertEqual(journal['finalizationAttempts'],1);self.assertTrue(journal['containmentVerified']);self.assertEqual([m for m,_ in server.calls if m!='GET'],['POST','PUT','DELETE']);self.assertEqual(journal['latestProviderGate']['observedDraft'],'null')
 def test_mocked_wrong_context_never_finalizes(self):
  server=FakeProvider(None,'branch-deploy');self.run_script('preflight.py',server);self.run_script('experiment.py',server);journal=json.loads((self.out/'experiment.json').read_text());self.assertEqual(journal['finalizationAttempts'],0);self.assertTrue(journal['containmentVerified']);self.assertEqual([m for m,_ in server.calls if m!='GET'],['POST','POST','DELETE'])
 def test_mocked_false_stops_and_cleans(self):
  server=FakeProvider(False);self.run_script('preflight.py',server);self.run_script('experiment.py',server);journal=json.loads((self.out/'experiment.json').read_text());self.assertEqual(journal['finalizationAttempts'],0);self.assertTrue(journal['containmentVerified'])
 def test_mocked_permission_denial_before_reservation(self):
  server=FakeProvider(None);server.account['role']='Reviewer'
  with self.assertRaises(SystemExit):self.run_script('preflight.py',server)
  self.assertFalse(any(m!='GET' for m,_ in server.calls))

class AdditionalPreparedFailureTests(unittest.TestCase):
 setUp=PreparedKitTests.setUp
 run_script=PreparedKitTests.run_script
 def test_mocked_omitted_draft_full_workflow(self):
  class Omitted(FakeProvider):
   def open(self,request,**kwargs):
    response=super().open(request,**kwargs)
    if isinstance(response.data,dict) and response.data.get('id')==ID:response.data.pop('draft',None)
    return response
  server=Omitted(None);self.run_script('preflight.py',server);self.run_script('experiment.py',server);self.run_script('verify.py',server)
  j=json.loads((self.out/'experiment.json').read_text());self.assertEqual(j['assessment'],'NETLIFY DEPLOYMENT WORKFLOW VERIFIED');self.assertEqual(j['latestProviderGate']['observedDraft'],'omitted')
 def test_mocked_optional_timestamps_omitted_full_workflow(self):
  class OmittedTimestamp(FakeProvider):
   def open(self,request,**kwargs):
    response=super().open(request,**kwargs)
    if isinstance(response.data,dict) and response.data.get('id')==ID:response.data.pop('published_at',None)
    return response
  server=OmittedTimestamp(None);self.run_script('preflight.py',server);self.run_script('experiment.py',server);self.run_script('verify.py',server)
  j=json.loads((self.out/'experiment.json').read_text());self.assertTrue(j['containmentVerified']);self.assertTrue(j['finalizationPassed'])
 def test_mocked_final_context_change_denied_and_contained(self):
  class Flip(FakeProvider):
   def open(self,request,**kwargs):
    response=super().open(request,**kwargs)
    if request.get_method()=='PUT':self.new['context']='branch-deploy'
    return response
  server=Flip(None);self.run_script('preflight.py',server);self.run_script('experiment.py',server)
  j=json.loads((self.out/'experiment.json').read_text());self.assertFalse(j['finalizationPassed']);self.assertTrue(j['containmentVerified']);self.assertEqual(j['reservationAttempts'],1)
 def test_mocked_missing_publication_metadata_preflight_denied(self):
  server=FakeProvider(None);del server.site['published_deploy']
  with self.assertRaises(SystemExit):self.run_script('preflight.py',server)
  self.assertFalse(any(m!='GET' for m,_ in server.calls))
 def test_mocked_unbounded_billing_preflight_denied(self):
  server=FakeProvider(None);server.account['auto_topup_enabled']=True
  with self.assertRaises(SystemExit):self.run_script('preflight.py',server)
  self.assertFalse(any(m!='GET' for m,_ in server.calls))
 def test_mocked_pending_finalization_fails_but_cleanup_runs(self):
  class Pending(FakeProvider):
   def open(self,request,**kwargs):
    response=super().open(request,**kwargs)
    if request.get_method()=='PUT':self.new['state']='processing'
    return response
  server=Pending(None);self.run_script('preflight.py',server);self.run_script('experiment.py',server)
  j=json.loads((self.out/'experiment.json').read_text());self.assertFalse(j['finalizationPassed']);self.assertTrue(j['containmentVerified']);self.assertLessEqual(len(j['calls']),40)

if __name__=='__main__':unittest.main(verbosity=2)

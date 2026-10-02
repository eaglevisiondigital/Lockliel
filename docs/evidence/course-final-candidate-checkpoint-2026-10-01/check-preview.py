import json, urllib.request, urllib.error, pathlib
from html.parser import HTMLParser

folder=pathlib.Path('/private/tmp/lockliel-checkpoint-20261001'); folder.mkdir(exist_ok=True)
deploy_id='6abebc5dc0b59000076c25a5'
expected='eaff3fea36d4ce489009ebf2070071311619f9c2'
def deployment():
    with urllib.request.urlopen('https://api.netlify.com/api/v1/deploys/'+deploy_id,timeout=30) as r: return json.load(r)
d=deployment()
assert d['state']=='ready', 'Preview not ready: '+d['state']
assert d['context']=='deploy-preview' and d['branch']=='lockliel-backend-v1' and d['commit_ref']==expected and d['review_id']==4 and not d['published_at']
base='https://'+deploy_id+'--lockliel.netlify.app'
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*args,**kwargs): return None
opener=urllib.request.build_opener(NoRedirect())
def request(method,path):
    req=urllib.request.Request(base+path,method=method,data=b'' if method=='POST' else None)
    try: response=opener.open(req,timeout=30)
    except urllib.error.HTTPError as e: response=e
    with response:
        return response.status,response.headers,response.read()
probes=[('GET','/api/lockliel/admin/content'),('POST','/api/lockliel/admin/content'),('GET','/.netlify/functions/lockliel-admin-content'),('POST','/.netlify/functions/lockliel-admin-content'),('GET','/api/lockliel/journey'),('POST','/api/lockliel/journey'),('GET','/.netlify/functions/lockliel-journey'),('POST','/.netlify/functions/lockliel-journey'),('GET','/api/lockliel/lesson-resource'),('GET','/api/lockliel/journey?export=unavailable'),('GET','/api/lockliel/my-five'),('POST','/api/lockliel/my-five'),('GET','/.netlify/functions/lockliel-my-five'),('POST','/.netlify/functions/lockliel-my-five'),('GET','/api/lockliel/share-library'),('GET','/api/lockliel/share-link'),('POST','/api/lockliel/share-link'),('POST','/.netlify/functions/lockliel-share-link'),('POST','/api/lockliel/connections'),('GET','/api/lockliel-auth/session'),('GET','/.netlify/functions/lockliel-session'),('GET','/api/lockliel/next-step'),('GET','/.netlify/functions/lockliel-next-step'),('GET','/api/lockliel/onboarding'),('POST','/api/lockliel/onboarding'),('POST','/.netlify/functions/lockliel-onboarding'),('GET','/r/invalid_referral'),('GET','/api/faith-boost/access'),('GET','/who-god-says-you-are/reader/chapter.pdf'),('POST','/api/lockliel-auth/signup'),('POST','/api/faith-boost/signup'),('POST','/api/book-release'),('POST','/thank-you'),('POST','/__founders50.html'),('POST','/__faith-boost-book.html'),('POST','/__heart-book-release.html')]
results=[]
for method,path in probes:
    status,headers,body=request(method,path)
    assert status==503, (method,path,status)
    assert json.loads(body).get('code')=='production_backend_disabled',(method,path,'wrong denial')
    assert headers.get('Cache-Control')=='no-store' and not headers.get('Set-Cookie') and not headers.get('Location'),(method,path,'unexpected headers')
    results.append({'method':method,'path':path,'status':status,'code':'production_backend_disabled','cache_control':'no-store','set_cookie':False,'redirect':False})
class Forms(HTMLParser):
    def __init__(self): super().__init__(); self.forms=[]
    def handle_starttag(self,tag,attrs):
        if tag=='form': self.forms.append(dict(attrs))
pages=[]
for path in ['/','/founders-50','/__founders50.html','/__faith-boost-book.html','/__heart-book-release.html','/my-lockliel','/my-lockliel/onboarding','/my-lockliel/connections','/my-lockliel/connections/person','/my-lockliel/share','/my-lockliel/journey','/my-lockliel/journey/lesson?lesson=lesson-1','/my-lockliel/admin/person','/my-lockliel/admin','/my-lockliel/journey/lesson?lesson=lesson-11']:
    status,headers,body=request('GET',path)
    assert status==200,(path,status)
    parser=Forms();parser.feed(body.decode())
    assert all('data-netlify' not in f and 'netlify' not in f for f in parser.forms),path
    if not path.startswith('/my-lockliel'): assert parser.forms,path
    pages.append({'path':path,'status':status,'form_count':len(parser.forms),'netlify_detection':False})
status,headers,body=request('GET','/getting-a-grip')
assert status==200,('grip',status)
html=body.decode()
manifest=json.loads(pathlib.Path('content/share-library/getting-a-grip.json').read_text())['asset']
assert manifest['title'] in html and manifest['description'] in html
class Invitation(HTMLParser):
    def __init__(self): super().__init__(); self.links={}; self.current=None; self.forbidden=[]
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if tag=='a': self.current=attrs.get('href'); self.links[self.current]=''
        if tag in ('form','iframe','video'): self.forbidden.append(tag)
    def handle_data(self,data):
        if self.current is not None: self.links[self.current]+=data
    def handle_endtag(self,tag):
        if tag=='a': self.current=None
parser=Invitation();parser.feed(html)
assert parser.links['/my-lockliel/sign-up']=='Start Getting a Grip'
assert parser.links['/my-lockliel/sign-in']=='Already have an account? Sign in'
assert not parser.forbidden
for private in ['storage/v1','lesson-assets','.pdf','private_notes','linked_profile_id','access_token','original_inviter_id']:
    assert private not in html,private
pages.append({'path':'/getting-a-grip','status':status,'approved_copy':True,'signup':'/my-lockliel/sign-up','signin':'/my-lockliel/sign-in','protected_exposure':False})
after=deployment()
assert after['commit_ref']==expected and after['state']=='ready'
keys=['id','state','context','branch','commit_ref','published_at','created_at','deploy_ssl_url','review_id','summary']
output={'deploy':{k:after.get(k) for k in keys},'guards':results,'static_pages':pages}
folder.joinpath('preview-checks.json').write_text(json.dumps(output,indent=2))
print(json.dumps({'deploy':output['deploy'],'guard_checks':len(results),'static_pages':len(pages),'result':'PASS'},indent=2))

import ast,contextlib,ctypes,hashlib,importlib.util,io,json,pathlib,re,socket
from unittest.mock import patch
w=pathlib.Path('/Users/davesmacbookpro/.codex/worktrees/lockliel-wave10-hosted-composition/Lockliel');src=w/'scripts/member-hosted/supabase_recovery.py';data=src.read_bytes();assert hashlib.sha256(data).hexdigest()=='9f8991b9e0c390b0790ac1cae2f7d90729e6cbb6aa17964669bcf2764c6697b2'
spec=importlib.util.spec_from_file_location('reviewed_worker',src);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
patterns=[n.args[0].value for n in ast.walk(ast.parse(data)) if isinstance(n,ast.Call) and isinstance(n.func,ast.Attribute) and n.func.attr=='fullmatch' and n.args and isinstance(n.args[0],ast.Constant) and isinstance(n.args[0].value,(str,bytes)) and n.args[0].value.startswith('sbp_' if isinstance(n.args[0].value,str) else b'sbp_')]
assert set(patterns)=={r'sbp_[0-9a-f]{40}',rb'sbp_[0-9a-f]{40}'}
patterns=[r'sbp_[0-9a-f]{40}',rb'sbp_[0-9a-f]{40}']
cli=pathlib.Path('/private/tmp/lockliel-token-compatibility-public/cli--apps--cli--src--auth--access-token.ts').read_text();official=re.search(r'ACCESS_TOKEN_PATTERN = /(.+)/;',cli).group(1);assert official==r'^sbp_(oauth_|v0_)?[a-f0-9]{40}$'
cases=[]
for pos in range(38):
 for char in '0123456789abcdef':
  tail=list('0'*38);tail[pos]=char;cases.append(('scoped_candidate_44char','sbp_fc'+''.join(tail),True))
for length in list(range(0,40))+list(range(41,65)):
 body='fc'+'0'*max(0,length-2);cases.append(('wrong_length','sbp_'+body,False))
for char in 'ABCDEFxyz_- \n\r\t\0é':cases.append(('invalid_character','sbp_fc'+'0'*37+char,False))
for prefix in ('sbp_oauth_','sbp_v0_'):cases.append(('other_cli_token_family',prefix+'0'*40,False))
class TTY:
 def __enter__(self):return self
 def __exit__(self,*_args):pass
 def isatty(self):return True
attempts=[]
def deny(*_args,**_kwargs):attempts.append('forbidden');raise RuntimeError('Forbidden offline operation')
counts={};out=io.StringIO();err=io.StringIO()
with patch.object(socket,'socket',deny),patch.object(socket,'getaddrinfo',deny),patch.object(ctypes,'CDLL',deny),contextlib.redirect_stdout(out),contextlib.redirect_stderr(err):
 for category,value,expected in cases:
  # Full current input+request regex parity; actual hidden input implementation
  # receives synthetic values from a mock, never an owner or real Terminal.
  with patch('builtins.open',return_value=TTY()),patch.object(m.getpass,'getpass',return_value=value):
   accepted=False
   try:
    secret=m._authorization();accepted=True;m._wipe(secret);assert not any(secret)
   except m.RecoveryError as exc:assert exc.code=='AUTHORIZATION_REQUIRED'
  assert accepted is expected
  assert bool(re.fullmatch(patterns[0],value))==expected
  assert bool(re.fullmatch(patterns[1],value.encode('utf-8')))==expected
  if category=='scoped_candidate_44char':assert bool(re.fullmatch(official,value))
  if category=='other_cli_token_family':assert bool(re.fullmatch(official,value))
  counts[category]=counts.get(category,0)+1
assert not attempts and out.getvalue()==err.getvalue()==''
result={'syntheticCasesPassed':len(cases),'categories':counts,'inputAndRequestGrammarIdentical':True,'officialCliPattern':official,'workerPattern':patterns[0],'plainPatTotalCharacters':44,'scopedPrefix':'sbp_fc','scopedCandidateRemainingLowercaseHexCharacters':38,'formatContractLimit':'Provider-issued scoped tokens are string in public create-response type; public CLI grammar is consumer evidence, not proof of private issuer or resource authority.','liveTokens':0,'providerCalls':0,'databaseConnections':0,'grantConsumption':0,'credentialExposure':False}
pathlib.Path('/private/tmp/lockliel-token-compatibility-public/offline-result.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))

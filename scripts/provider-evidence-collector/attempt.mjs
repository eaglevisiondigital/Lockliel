/** Consume-before-input primitive. No authority/grant mint, reset or deletion.
 * Only the inaccessible verified capability can supply fixed installation data.
 * Owner deletion/OS filesystem compromise is not prevented by local storage. */
import fs from 'node:fs';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {inspectVerifiedAuthority} from './authority.mjs';
const C=fs.constants;
export function consumeInstalledAttempt(authority,now) {
 try {
  const {attemptRoot:root,grantSha256}=inspectVerifiedAuthority(authority,now);
  if(typeof root!=='string'||resolve(root)!==root||fs.realpathSync(root)!==root||!/^[a-f0-9]{64}$/.test(grantSha256))throw 0;
  const stat=fs.lstatSync(root);
  if(!stat.isDirectory()||stat.isSymbolicLink()||stat.uid!==process.getuid()||(stat.mode&0o777)!==0o700)throw 0;
  const d=fs.openSync(root,C.O_RDONLY|C.O_DIRECTORY|C.O_NOFOLLOW);
  const same=()=>{const current=fs.lstatSync(root),fd=fs.fstatSync(d);if(current.ino!==stat.ino||current.dev!==stat.dev||fd.ino!==stat.ino||fd.dev!==stat.dev||current.isSymbolicLink()||fs.realpathSync(root)!==root)throw 0;};
  try {
   same();const grantPath=join(root,'grant.json'),g=fs.lstatSync(grantPath);
   if(!g.isFile()||g.isSymbolicLink()||g.nlink!==1||g.uid!==process.getuid()||(g.mode&0o777)!==0o400||g.size>4096||g.size===0)throw 0;
   const grantFd=fs.openSync(grantPath,C.O_RDONLY|C.O_NOFOLLOW);
   try{const opened=fs.fstatSync(grantFd);if(opened.ino!==g.ino||opened.dev!==g.dev||createHash('sha256').update(fs.readFileSync(grantFd)).digest('hex')!==grantSha256)throw 0;}finally{fs.closeSync(grantFd);}
   same();fs.mkdirSync(join(root,'CONSUMED'),{mode:0o700});same();fs.fsyncSync(d);
   const fd=fs.openSync(join(root,'CONSUMED','receipt.json'),C.O_WRONLY|C.O_CREAT|C.O_EXCL|C.O_NOFOLLOW,0o400);
   try {fs.writeFileSync(fd,JSON.stringify({schema:'lockliel-provider-attempt-v1',project:'qjksggxorghaxvpyslip',operation:'GET_AUTH_CONFIG',consumedAt:now}));fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
   const marker=fs.openSync(join(root,'CONSUMED'),C.O_RDONLY|C.O_DIRECTORY|C.O_NOFOLLOW);try{fs.fsyncSync(marker);}finally{fs.closeSync(marker);}same();
  }finally{fs.closeSync(d);}
  return Object.freeze({consumed:true});
 }catch{return Object.freeze({consumed:false,category:'ATTEMPT_UNAVAILABLE',attemptState:'UNVERIFIED_OR_SPENT'});}
}

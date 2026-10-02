import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

// Exercise the actual static export that a browser sees before any JavaScript
// runs. An onSubmit handler alone cannot protect this native HTML phase.
for(const [page,endpoint,fields] of [
  ['sign-in','login',['email','password']],
  ['sign-up','signup',['firstName','lastName','email','password']],
]){
  test(`${page} static form cannot submit credentials through a native GET`,async()=>{
    const html=await readFile(new URL(`../out/my-lockliel/${page}.html`,import.meta.url),'utf8');
    const form=html.match(/<form\b[^>]*class="ml-auth-card"[^>]*>[\s\S]*?<\/form>/)?.[0];
    assert.ok(form,'Exported authentication form must exist');
    const opening=form.match(/^<form[^>]*>/)[0];
    assert.match(opening,/method="post"/i);
    assert.ok(opening.includes(`action="/api/lockliel-auth/${endpoint}"`));
    assert.match(opening,/aria-busy="true"/);
    for(const name of fields){
      const input=[...form.matchAll(/<input\b[^>]*>/g)].map(m=>m[0]).find(tag=>tag.includes(`name="${name}"`));
      assert.ok(input,`${name} exists`);
      assert.match(input,/\bdisabled=""/,`${name} stays disabled until hydration`);
    }
    assert.match(form,/<button\b[^>]*disabled=""/);
  });
}

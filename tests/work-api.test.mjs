import test from 'node:test';
import assert from 'node:assert/strict';
import * as admin from '../functions/admin/api/media-entries/[section].js';
import { onRequestGet as publicGet } from '../functions/api/media-entries/[section].js';
const fixture=()=>{
 const entries=new Map(),files=new Map();
 const env={CONTENT_KV:{list:async({prefix})=>({keys:[...entries.keys()].filter(key=>key.startsWith(prefix)).map(name=>({name}))}),get:async key=>Array.isArray(key)?new Map(key.map(k=>[k,entries.has(k)?JSON.parse(entries.get(k)):null])):entries.has(key)?JSON.parse(entries.get(key)):null,put:async(k,v)=>entries.set(k,v),delete:async k=>entries.delete(k)},MEDIA_BUCKET:{put:async(k,body,metadata)=>files.set(k,{body,metadata}),delete:async k=>files.delete(k)}};
 return{env,entries,files};
};
const request=(method,overrides={},attachment)=>{const form=new FormData();for(const [k,v] of Object.entries({title:'Test film',description:'A sample project.',date:'2026-09-19',link:'https://example.com/film',...overrides}))form.set(k,v);if(attachment)form.set('attachment',attachment);return new Request('https://example.test/admin/api/media-entries/remember',{method,body:form})};
test('upload, publish, edit, replace/remove attachment, and delete remain isolated by section',async()=>{
 const {env,files}=fixture();const params={section:'remember'};
 let response=await admin.onRequestPost({env,params,request:request('POST',{},new File(['video'],'film.mp4',{type:'video/mp4'}))});assert.equal(response.status,201);
 let {entry}=await response.json();assert.equal(files.size,1);assert.match(entry.attachmentUrl,/^\/api\/media\//);
 const id=entry.id;
 let published=await (await publicGet({env,params})).json();assert.equal(published.entries[0].title,'Test film');assert.equal((await (await publicGet({env,params:{section:'capture'}})).json()).entries.length,0);
 response=await admin.onRequestPut({env,params,request:request('PUT',{id,title:'Updated film'})});entry=(await response.json()).entry;assert.equal(entry.attachmentName,'film.mp4');
 response=await admin.onRequestPut({env,params,request:request('PUT',{id},new File(['new video'],'replacement.mp4',{type:'video/mp4'}))});entry=(await response.json()).entry;assert.equal(entry.attachmentName,'replacement.mp4');
 response=await admin.onRequestPut({env,params,request:request('PUT',{id,removeAttachment:'true'})});entry=(await response.json()).entry;assert.equal(entry.attachmentUrl,null);
 response=await admin.onRequestDelete({env,params,request:new Request(`https://example.test/admin/api/media-entries/remember?id=${id}`,{method:'DELETE'})});assert.equal(response.status,200);assert.equal((await (await publicGet({env,params})).json()).entries.length,0);
});
test('rejects unsupported section, unsafe URL, and executable attachment',async()=>{
 const {env,files}=fixture();assert.equal((await admin.onRequestPost({env,params:{section:'film'},request:request('POST')})).status,404);
 assert.equal((await admin.onRequestPost({env,params:{section:'remember'},request:request('POST',{link:'javascript:alert(1)'})})).status,400);
 assert.equal((await admin.onRequestPost({env,params:{section:'remember'},request:request('POST',{},new File(['bad'],'bad.html',{type:'text/html'}))})).status,415);assert.equal(files.size,0);
});
test('failed metadata persistence rolls back the uploaded object',async()=>{
 const {env,files}=fixture();env.CONTENT_KV.put=async()=>{throw new Error('test storage failure')};const original=console.error;console.error=()=>{};
 try{const response=await admin.onRequestPost({env,params:{section:'remember'},request:request('POST',{},new File(['video'],'film.mp4',{type:'video/mp4'}))});assert.equal(response.status,500);assert.equal(files.size,0);}finally{console.error=original;}
});
test('optional dates sort newest first in every section, with undated posts last', async()=>{
 const {env}=fixture();
 for(const section of ['remember','connect','capture']){
  const params={section};
  for(const [title,date] of [['Older','2022-01-01'],['Undated',''],['Newest','2026-09-19']]){
   const response=await admin.onRequestPost({env,params,request:request('POST',{title,date})});assert.equal(response.status,201);
  }
  for(const get of [publicGet,admin.onRequestGet]){
   const result=await (await get({env,params})).json();assert.deepEqual(result.entries.map(e=>e.title),['Newest','Older','Undated']);
  }
  const items=await (await admin.onRequestGet({env,params})).json();
  const updated=await admin.onRequestPut({env,params,request:request('PUT',{id:items.entries[2].id,title:'Undated',date:'2025-01-01'})});assert.equal(updated.status,200);
  const reordered=await (await publicGet({env,params})).json();assert.deepEqual(reordered.entries.map(e=>e.title),['Newest','Undated','Older']);
  const invalid=await admin.onRequestPost({env,params,request:request('POST',{date:'2026-02-30'})});assert.equal(invalid.status,400);
 }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../functions/admin/api/gear.js';
import {responseItem} from '../functions/_shared/gear.js';
const request=(method,owner,id='')=>{const form=new FormData();for(const[k,v]of Object.entries({id,name:'Camera',category:'Camera',owner,rating:'5',description:'Camera body',kitParts:'Body',imageAlt:''}))form.set(k,v);if(method==='POST')form.set('image',new File(['image'],'camera.png',{type:'image/png'}));return new Request('https://site.test/admin/api/gear',{method,body:form})};
test('ownership survives creation, API listing, and editing',async()=>{
 const items=new Map();const env={CONTENT_KV:{get:async key=>items.has(key)?JSON.parse(items.get(key)):null,put:async(k,v)=>items.set(k,v),list:async()=>({keys:[...items.keys()].map(name=>({name})),list_complete:true})},MEDIA_BUCKET:{put:async()=>{}}};
 const response=await api.onRequestPost({env,request:request('POST','Jet Sullivan')});assert.equal(response.status,201);const {item}=await response.json();assert.equal(item.owner,'Jet Sullivan');assert.equal(item.imageAlt,'Camera owned by Jet Sullivan');
 const updated=await api.onRequestPut({env,request:request('PUT','Ben Stapleton',item.id)});assert.equal(updated.status,200);assert.equal((await updated.json()).item.owner,'Ben Stapleton');
 const listed=await api.onRequestGet({env});assert.equal((await listed.json()).items[0].owner,'Ben Stapleton');
 const invalid=await api.onRequestPut({env,request:request('PUT','invalid',item.id)});assert.equal(invalid.status,400);
 assert.equal(responseItem({name:'Old gear'}).owner,'');
});

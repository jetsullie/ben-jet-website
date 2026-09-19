import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultSettings,validateSettings,SETTINGS_KEY} from '../functions/_shared/site-settings.js';
import {onRequestGet,onRequestPut} from '../functions/admin/api/settings.js';
import {onRequestGet as publicGet} from '../functions/api/settings.js';
const fixture=()=>{const values=new Map();return{values,env:{CONTENT_KV:{get:async key=>values.has(key)?JSON.parse(values.get(key)):null,put:async(key,value)=>values.set(key,value)}}}};
const put=settings=>new Request('https://site.test/admin/api/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(settings)});
test('settings save and reload through admin and public APIs',async()=>{
 const {env,values}=fixture();assert.deepEqual((await(await onRequestGet({env})).json()).settings,defaultSettings);
 const settings=structuredClone(defaultSettings);settings.location='Chicago, Illinois';settings.contacts.ben.email='ben@example.com';settings.contacts.ben.phone='+1 (555) 123-4567';settings.contacts.ben.website='https://example.com/work';settings.contacts.ben.color='#252525';
 assert.equal((await onRequestPut({env,request:put(settings)})).status,200);assert.ok(values.has(SETTINGS_KEY));
 for(const get of [onRequestGet,publicGet])assert.deepEqual((await(await get({env})).json()).settings,settings);
});
test('invalid contact URLs, colors, and empty contact methods cannot overwrite settings',async()=>{
 const {env}=fixture();await onRequestPut({env,request:put(defaultSettings)});
 for(const update of [{website:'javascript:alert(1)'},{color:'red;display:none'},{email:'bad'},{phone:'abc'},{email:'',phone:'',website:''}]){
  const settings=structuredClone(defaultSettings);Object.assign(settings.contacts.jet,update);
  assert.equal((await onRequestPut({env,request:put(settings)})).status,400);
  assert.deepEqual((await(await publicGet({env})).json()).settings,defaultSettings);
 }
});
test('missing storage refuses writes and extra identity fields are not stored',async()=>{
 assert.equal((await onRequestPut({env:{},request:put(defaultSettings)})).status,503);
 const value=validateSettings({...defaultSettings,authorizedEmails:['attacker@example.com']});assert.equal('authorizedEmails' in value,false);
});

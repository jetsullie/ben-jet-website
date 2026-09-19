import {people,aboutKey,readAbout,validateAbout} from '../../../_shared/about.js';
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export const onRequestGet=async({env,params})=>{
 if(!people.includes(params.person))return json({error:'Unknown profile.'},404);
 if(!env.CONTENT_KV)return json({error:'CONTENT_KV binding is missing.'},503);
 try{return json({about:await readAbout(env,params.person)});}catch{return json({error:'Could not load biography.'},500);}
};
export const onRequestPut=async({request,env,params})=>{
 if(!people.includes(params.person))return json({error:'Unknown profile.'},404);
 if(!env.CONTENT_KV)return json({error:'CONTENT_KV binding is missing.'},503);
 let about;try{about=validateAbout(await request.json());}catch(error){return json({error:error.message},400);}
 try{await env.CONTENT_KV.put(aboutKey(params.person),JSON.stringify(about));return json({about});}catch{return json({error:'Could not save biography.'},500);}
};

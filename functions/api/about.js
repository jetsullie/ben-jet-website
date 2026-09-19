import {people,readAbout} from '../_shared/about.js';
export const onRequestGet=async({env})=>{
 try{const profiles=Object.fromEntries(await Promise.all(people.map(async person=>[person,await readAbout(env,person)])));return Response.json({profiles},{headers:{'Cache-Control':'no-store'}});}
 catch{return Response.json({error:'Biographies are temporarily unavailable.'},{status:503});}
};

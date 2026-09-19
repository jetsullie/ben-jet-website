import {normalizeBiographyDocument,biographyDocumentToText,BIOGRAPHY_MAX_LENGTH} from './biography.js';
export const people=['jet','ben'];
export const aboutKey=person=>`team-about:${person}`;
export const readAbout=async(env,person)=>env.CONTENT_KV?await env.CONTENT_KV.get(aboutKey(person),'json'):null;
export const validateAbout=value=>{
 const document=normalizeBiographyDocument(value?.document);
 if(!document||biographyDocumentToText(document).length>BIOGRAPHY_MAX_LENGTH)throw new Error('Use a valid biography with no more than 5,000 characters.');
 return{document,updatedAt:new Date().toISOString()};
};

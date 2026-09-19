import { applyContact, type Settings, type Contact } from './contact-settings';
import { defaultSettings, validateSettings } from '../../functions/_shared/site-settings';
const form=document.querySelector<HTMLFormElement>('#site-settings-form')!;
const fields=document.querySelector<HTMLFieldSetElement>('#settings-fields')!;
const status=document.querySelector<HTMLOutputElement>('#settings-status')!;
let saved:Settings=structuredClone(defaultSettings);
const input=(name:string)=>form.elements.namedItem(name) as HTMLInputElement;
const read=():Settings=>({location:input('location').value,contacts:Object.fromEntries(['jet','ben'].map(id=>[id,Object.fromEntries(['name','description','email','phone','website','buttonLabel','color'].map(key=>[key,input(`${id}.${key}`).value]))])) as Settings['contacts']});
const preview=()=>{const settings=read();for(const id of ['jet','ben'] as const)applyContact(document.querySelector<HTMLElement>(`[data-settings-preview="${id}"]`)!,settings.contacts[id]);};
const populate=(settings:Settings)=>{input('location').value=settings.location;for(const id of ['jet','ben'] as const)for(const [key,value] of Object.entries(settings.contacts[id]))input(`${id}.${key}`).value=value;preview();};
const request=async(options:RequestInit={})=>{const response=await fetch('/admin/api/settings',{credentials:'same-origin',...options});let result;try{result=await response.json();}catch{throw new Error('Settings require Cloudflare Pages Functions and are unavailable in Astro preview.');}if(!response.ok)throw new Error(result.error||'Settings could not be saved.');return validateSettings(result.settings) as Settings;};
form.addEventListener('input',preview);
form.querySelectorAll('.settings-preview a').forEach(link=>link.addEventListener('click',event=>event.preventDefault()));
document.querySelector('#settings-reset')!.addEventListener('click',()=>{populate(saved);status.textContent='Unsaved changes discarded.';});
form.addEventListener('submit',async event=>{
  event.preventDefault();let settings:Settings;
  try{settings=validateSettings(read()) as Settings;}catch(error){status.textContent=(error as Error).message;return;}
  fields.disabled=true;status.textContent='Saving settings…';
  try{saved=await request({method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(settings)});populate(saved);status.textContent='Saved. Your location and contact panels are updated.';}
  catch(error){status.textContent=(error as Error).message;}finally{fields.disabled=false;}
});
populate(saved);
void request().then(settings=>{saved=settings;populate(saved);fields.disabled=false;status.textContent='Ready to edit.';}).catch(error=>{status.textContent=error.message;});

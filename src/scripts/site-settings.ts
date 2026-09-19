import { applyContact, type Settings } from './contact-settings';
import { validateSettings } from '../../functions/_shared/site-settings';
void fetch('/api/settings').then(async response=>{
  if(!response.ok)return;
  const {settings:raw}=await response.json();const settings=validateSettings(raw) as Settings;
  for(const element of document.querySelectorAll<HTMLElement>('[data-site-location]'))element.textContent=settings.location;
  for(const id of ['jet','ben'] as const){const panel=document.querySelector<HTMLElement>(`[data-contact-panel="${id}"]`);if(panel)applyContact(panel,settings.contacts[id]);}
}).catch(()=>{});

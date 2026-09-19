type Entry = {id:string;section:string;title:string;description:string;date:string;link?:string;attachmentName?:string;attachmentUrl?:string;attachmentAlt?:string};
const form = document.querySelector<HTMLFormElement>('#work-form')!;
const field = (name:string) => form.elements.namedItem(name) as HTMLInputElement;
const section = form.elements.namedItem('section') as HTMLSelectElement;
const status = document.querySelector<HTMLOutputElement>('#work-status')!;
const list = document.querySelector<HTMLElement>('#work-admin-list')!;
const cancel = document.querySelector<HTMLButtonElement>('#work-cancel')!;
const submit = form.querySelector<HTMLButtonElement>('[type=submit]')!;
const current = document.querySelector<HTMLElement>('#work-attachment-current')!;
const dialog = document.querySelector<HTMLDialogElement>('#work-delete-dialog')!;
let pending: Entry | null = null;
let generation = 0;
const request = async(url:string, options:RequestInit = {}) => {
  const response = await fetch(url, { credentials:'same-origin', ...options });
  let body; try { body = await response.json(); } catch { throw new Error('Work publishing requires Cloudflare Pages Functions; it is unavailable in Astro preview.'); }
  if (!response.ok) throw new Error(body.error || 'The request could not be completed.');
  return body;
};
const endpoint = (value=section.value) => `/admin/api/media-entries/${value}`;
const reset = () => {
  const selected = section.value; form.reset(); section.value = selected; section.disabled = false;
  field('id').value = ''; field('date').value = '';
  submit.textContent = 'Publish post'; cancel.hidden = true; current.textContent = '';
};
const edit = (entry:Entry) => {
  reset(); section.value = entry.section; section.disabled = true;
  for (const name of ['id','title','description','date','link','attachmentAlt'] as const) field(name).value = entry[name] || '';
  current.textContent = entry.attachmentName ? `Current: ${entry.attachmentName}. Leave the upload empty to keep it.` : 'No attachment.';
  cancel.hidden = false; submit.textContent = 'Update post'; status.textContent = `Editing “${entry.title}”.`;
  form.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});field('title').focus({preventScroll:true});
};
const render = (entries:Entry[]) => {
  list.replaceChildren();
  if (!entries.length) { list.textContent = 'No posts in this section yet.'; return; }
  for (const entry of entries) {
    const card=document.createElement('article');card.className='work-admin-entry';
    const heading=document.createElement('h4');heading.textContent=entry.title;
    const meta=document.createElement('p');meta.textContent=entry.date || 'No date';
    const description=document.createElement('p');description.textContent=entry.description;
    const actions=document.createElement('div');actions.className='work-admin-entry-actions';
    const editButton=document.createElement('button');editButton.type='button';editButton.className='button';editButton.textContent='Edit';editButton.onclick=()=>edit(entry);
    const remove=document.createElement('button');remove.type='button';remove.className='button';remove.textContent='Delete';remove.onclick=()=>{pending=entry;document.querySelector('#work-delete-copy')!.textContent=`“${entry.title}” will be removed from Previous Work.`;dialog.showModal()};
    actions.append(editButton,remove);card.append(heading,meta,description,actions);list.append(card);
  }
};
const load = async(message='') => {
  const version=++generation;status.textContent='Loading work…';
  try { const result=await request(endpoint());if(version!==generation)return;render(result.entries || []);status.textContent=message; }
  catch(error){if(version===generation){status.textContent=(error as Error).message;list.textContent='Work could not be loaded.';}}
};
section.onchange=()=>{reset();void load()};cancel.onclick=()=>{reset();status.textContent='Edit cancelled.'};
form.onsubmit=async event=>{
  event.preventDefault();const updating=Boolean(field('id').value);const url=endpoint();const payload=new FormData(form);
  submit.disabled=true;cancel.disabled=true;section.disabled=true;status.textContent=updating?'Updating post…':'Publishing post…';
  try {await request(url,{method:updating?'PUT':'POST',body:payload});reset();await load(updating?'Post updated.':'Post published.');}
  catch(error){status.textContent=(error as Error).message;}
  finally{submit.disabled=false;cancel.disabled=false;section.disabled=Boolean(field('id').value);}
};
dialog.addEventListener('close',async()=>{
  const entry=pending;pending=null;if(dialog.returnValue!=='confirm'||!entry)return;
  try{await request(`${endpoint(entry.section)}?id=${encodeURIComponent(entry.id)}`,{method:'DELETE'});if(field('id').value===entry.id)reset();await load('Post deleted.');}
  catch(error){status.textContent=(error as Error).message;}
});
reset();void load();

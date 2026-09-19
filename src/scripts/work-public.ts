import { createArrow } from './arrow';
const safeLink = (value: unknown) => {
  if (typeof value !== 'string') return null;
  try {const url=new URL(value,location.origin);return url.protocol==='https:' || (url.origin===location.origin && url.pathname.startsWith('/api/media/')) ? url.href : null;}catch{return null;}
};
for (const container of document.querySelectorAll<HTMLElement>('[data-work-entries]')) {
  const section=container.dataset.workEntries!;
  void fetch(`/api/media-entries/${section}`).then(async response=>{
    if(!response.ok)return;
    const result=await response.json();if(!Array.isArray(result.entries)||!result.entries.length)return;
    const fragment=document.createDocumentFragment();
    for(const entry of result.entries){
      const card=document.createElement('article');card.className='work-project';
      const heading=document.createElement('h3');heading.textContent=entry.title;
      const date=document.createElement('time');date.dateTime=entry.date;date.textContent=entry.date;
      const description=document.createElement('p');description.textContent=entry.description;
      const attachment=safeLink(entry.attachmentUrl);
      if(attachment){
        if(entry.attachmentType?.startsWith('image/')){const image=document.createElement('img');image.src=attachment;image.alt=entry.attachmentAlt||entry.title;image.loading='lazy';card.append(image);}
        else if(entry.attachmentType?.startsWith('video/')||entry.attachmentType?.startsWith('audio/')){const media=document.createElement(entry.attachmentType.startsWith('video/')?'video':'audio');media.src=attachment;media.controls=true;media.preload='metadata';media.setAttribute('aria-label',entry.attachmentAlt||entry.title);if(media instanceof HTMLVideoElement)media.playsInline=true;card.append(media);}
        const download=document.createElement('a');download.href=attachment;download.textContent=entry.attachmentName||'Open attachment';download.target='_blank';download.rel='noopener noreferrer';download.className='work-file';card.append(download);
      }
      if(entry.date)card.append(date);
      card.append(heading,description);
      const link=safeLink(entry.link);if(link){const anchor=document.createElement('a');anchor.href=link;anchor.target='_blank';anchor.rel='noopener noreferrer';anchor.className='button';anchor.append('View project ',createArrow());card.append(anchor);}
      fragment.append(card);
    }
    container.replaceChildren(fragment);
  }).catch(()=>{});
}

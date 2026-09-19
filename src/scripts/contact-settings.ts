export type Contact = {name:string;description:string;email:string;phone:string;website:string;buttonLabel:string;color:string};
export type Settings = {location:string;contacts:Record<'jet'|'ben',Contact>};
export const contactHref = (contact:Contact) => contact.email ? `mailto:${contact.email}` : contact.website || `tel:${contact.phone.replace(/[^+\d]/g,'')}`;
export const applyContact = (panel:HTMLElement, contact:Contact) => {
  for (const key of ['name','description','buttonLabel'] as const) {
    const element=panel.querySelector<HTMLElement>(`[data-contact-field="${key}"]`);if(element)element.textContent=contact[key];
  }
  const button=panel.querySelector<HTMLAnchorElement>('[data-contact-action]');if(button)button.href=contactHref(contact);
  for(const key of ['email','phone','website'] as const){
    const element=panel.querySelector<HTMLAnchorElement>(`[data-contact-field="${key}"]`);if(!element)continue;
    element.hidden=!contact[key];element.textContent=contact[key];
    element.href=key==='email'?`mailto:${contact.email}`:key==='phone'?`tel:${contact.phone.replace(/[^+\d]/g,'')}`:contact.website;
  }
  // Choose black or white using relative luminance for every custom color.
  const rgb=contact.color.slice(1).match(/.{2}/g)!.map(value=>parseInt(value,16)/255);
  const linear=rgb.map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4);
  const luminance=linear[0]*.2126+linear[1]*.7152+linear[2]*.0722;
  panel.style.setProperty('--contact-accent',contact.color);
  panel.style.setProperty('--contact-ink',luminance>.179?'#000000':'#ffffff');
};

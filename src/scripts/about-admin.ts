import {biographyDocumentFromText,biographyDocumentToText,normalizeBiographyDocument,normalizeBiographyLink,serializeBiographyEditor,renderBiographyDocument,type BiographyDocument} from '../lib/biography';
for(const form of document.querySelectorAll<HTMLFormElement>('[data-bio-person]')){
 const person=form.dataset.bioPerson!,editor=form.querySelector<HTMLElement>('.bio-editor')!,fieldset=form.querySelector('fieldset')!,status=form.querySelector('output')!,toolbar=form.querySelector<HTMLElement>('.bio-toolbar')!;
 let saved:BiographyDocument=biographyDocumentFromText('');let range:Range|null=null;
 const count=()=>{const length=biographyDocumentToText(serializeBiographyEditor(editor)).length;form.querySelector('[data-bio-count]')!.textContent=`${length} / 5000`;editor.setAttribute('aria-invalid',String(length>5000));};
 const selection=()=>{const selected=getSelection();if(selected?.rangeCount&&editor.contains(selected.anchorNode)&&editor.contains(selected.focusNode))range=selected.getRangeAt(0).cloneRange();};
 const run=(command:string,value?:string)=>{editor.focus({preventScroll:true});if(range&&editor.contains(range.commonAncestorContainer)){const selected=getSelection();selected?.removeAllRanges();selected?.addRange(range);}document.execCommand(command,false,value);selection();count();};
 document.addEventListener('selectionchange',selection);
 toolbar.addEventListener('pointerdown',event=>{if((event.target as Element).closest('button'))event.preventDefault();});
 toolbar.addEventListener('click',event=>{const button=(event.target as Element).closest<HTMLButtonElement>('button');if(button?.dataset.command)run(button.dataset.command);});
 form.querySelector<HTMLSelectElement>('[data-bio-format]')!.onchange=event=>run('formatBlock',(event.target as HTMLSelectElement).value);
 form.querySelector('[data-bio-link]')!.addEventListener('click',()=>{
  if(!range||range.collapsed){status.textContent='Select the text you want to link first.';return;}
  const value=window.prompt('Enter an HTTPS link or a site path beginning with /','https://');if(value===null)return;
  const link=normalizeBiographyLink(value);if(!link){status.textContent='Use a valid HTTPS link or site path.';return;}run('createLink',link);
 });
 editor.addEventListener('input',count);
 editor.addEventListener('paste',event=>{event.preventDefault();run('insertText',event.clipboardData?.getData('text/plain')||'');});
 editor.addEventListener('drop',event=>event.preventDefault());
 editor.addEventListener('click',event=>{if((event.target as Element).closest('a'))event.preventDefault();});
 const request=async(options:RequestInit={})=>{const response=await fetch(`/admin/api/about/${person}`,{credentials:'same-origin',...options});let result;try{result=await response.json();}catch{throw new Error('Biography editing requires Cloudflare Pages Functions and is unavailable in Astro preview.');}if(!response.ok)throw new Error(result.error||'Could not save biography.');return result;};
 form.querySelector('[data-bio-discard]')!.addEventListener('click',()=>{renderBiographyDocument(editor,saved);range=null;count();status.textContent='Unsaved changes discarded.';});
 form.onsubmit=async event=>{event.preventDefault();const documentValue=serializeBiographyEditor(editor);if(biographyDocumentToText(documentValue).length>5000){status.textContent='Keep the biography within 5,000 characters.';return;}
  fieldset.disabled=true;editor.contentEditable='false';status.textContent='Saving biography…';
  try{const result=await request({method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({document:documentValue})});saved=normalizeBiographyDocument(result.about?.document)||documentValue;status.textContent='Biography saved.';}
  catch(error){status.textContent=(error as Error).message;}finally{fieldset.disabled=false;editor.contentEditable='true';}
 };
 void request().then(result=>{saved=normalizeBiographyDocument(result.about?.document)||saved;renderBiographyDocument(editor,saved);fieldset.disabled=false;editor.contentEditable='true';status.textContent='Ready to edit.';count();}).catch(error=>{status.textContent=error.message;});
}

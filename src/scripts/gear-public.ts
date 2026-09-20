type GearItem = { id: string; name: string; category: string; owner?: string; rating: number; description: string; kitParts: string[]; imageUrl?: string | null; imageAlt?: string | null };
const element = <K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = '') => {
  const node = document.createElement(tag); node.className = className; node.textContent = text; return node;
};
const results = document.querySelector<HTMLElement>('#gear-results')!;
const disclosure = document.querySelector<HTMLDetailsElement>('#gear')!;
const search = document.querySelector<HTMLInputElement>('#gear-search')!;
const filterToggle = document.querySelector<HTMLButtonElement>('#gear-filter-toggle')!;
const clear = document.querySelector<HTMLButtonElement>('#gear-clear')!;
const count = document.querySelector<HTMLElement>('#gear-result-count')!;
const dialog = document.querySelector<HTMLDialogElement>('#gear-detail')!;
let items: GearItem[] = [], owner = '', loaded = false;
let opener: HTMLElement | null = null, closing = false, previousOverflow = '';
const imageFor = (item: GearItem) => {
  if (!item.imageUrl) return element('span', 'gear-photo-placeholder', 'JET × BEN');
  const image = element('img'); image.src = item.imageUrl; image.alt = item.imageAlt || item.name; image.loading = 'lazy'; return image;
};
function openItem(item: GearItem, trigger: HTMLElement) {
  opener = trigger;
  dialog.querySelector('.gear-detail-image')!.replaceChildren(imageFor(item));
  dialog.querySelector('#gear-detail-category')!.textContent = item.category;
  dialog.querySelector('#gear-detail-title')!.textContent = item.name;
  const facts = dialog.querySelector('.gear-detail-facts')!;
  facts.replaceChildren();
  for (const [label, value] of [['Owner', item.owner || 'Not specified'], ['Condition', `${Number(item.rating).toFixed(1)} / 5`]]) {
    const group = element('div'); group.append(element('dt', '', label), element('dd', '', value)); facts.append(group);
  }
  dialog.querySelector('.gear-detail-description')!.textContent = item.description;
  const kit = dialog.querySelector<HTMLElement>('.gear-detail-kit')!;
  kit.hidden = !item.kitParts?.length;
  kit.querySelector('ul')!.replaceChildren(...(item.kitParts || []).map(part => element('li', '', part)));
  previousOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = 'hidden';
  dialog.showModal(); dialog.scrollTop = 0;
}
async function closeItem() {
  if (closing || !dialog.open) return;
  closing = true;
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    await dialog.animate([{ opacity: 1, transform: 'translateY(0) scale(1)' }, { opacity: 0, transform: 'translateY(12px) scale(.98)' }], { duration: 160, easing: 'ease-in' }).finished.catch(() => {});
  }
  dialog.close(); closing = false;
}
dialog.querySelector('button')!.addEventListener('click', closeItem);
dialog.addEventListener('cancel', event => { event.preventDefault(); void closeItem(); });
let backdropPress = false;
dialog.addEventListener('pointerdown', event => { backdropPress = event.target === dialog; });
dialog.addEventListener('click', event => { const rect = dialog.getBoundingClientRect(); if (backdropPress && event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) void closeItem(); });
dialog.addEventListener('close', () => { document.documentElement.style.overflow = previousOverflow; opener?.focus({ preventScroll: true }); });
function render() {
  const query = search.value.trim().toLocaleLowerCase();
  const visible = items.filter(item => (!owner || item.owner?.includes(owner)) && `${item.name} ${item.category}`.toLocaleLowerCase().includes(query));
  clear.hidden = !owner && !query;
  filterToggle.dataset.active = String(Boolean(owner));
  document.querySelector<HTMLElement>('#gear-search-toggle')!.dataset.active = String(Boolean(query));
  count.textContent = loaded ? `${visible.length} ${visible.length === 1 ? 'item' : 'items'}` : '';
  results.replaceChildren();
  if (!visible.length) { results.append(element('p', 'gear-empty', items.length ? 'No matching gear. Try another name, category, or owner.' : 'Our gear collection is coming soon.')); return; }
  const categories = [...new Set(visible.map(item => item.category))].sort();
  for (const [index, category] of categories.entries()) {
    const section = element('section', 'gear-category-group');
    const heading = element('h3', '', category);
    heading.id = `gear-category-${index}`;
    section.setAttribute('aria-labelledby', heading.id);
    const grid = element('div', 'gear-card-grid');
    section.append(heading, grid);
    for (const item of visible.filter(item => item.category === category).sort((a, b) => a.name.localeCompare(b.name))) {
      const card = element('button', 'gear-preview'); card.type = 'button'; card.setAttribute('aria-haspopup', 'dialog');
      const photo = element('span', 'gear-preview-photo'); photo.append(imageFor(item));
      const copy = element('span', 'gear-preview-copy');
      copy.append(element('span', 'gear-preview-owner', `${item.category} · ${item.owner || 'Our collection'}`), element('strong', '', item.name), element('span', 'gear-preview-description', item.description), element('span', 'gear-preview-meta', `Condition ${Number(item.rating).toFixed(1)} / 5${item.kitParts?.length ? ` · ${item.kitParts.length} kit parts` : ''}`), element('span', 'gear-preview-link', 'Explore gear ↗'));
      card.append(photo, copy); card.addEventListener('click', () => openItem(item, card)); grid.append(card);
    }
    results.append(section);
  }
}
const tools = document.querySelector<HTMLElement>('.gear-tools')!;
const syncTools = () => {
  const expanded = disclosure.dataset.expanded === 'true' || (!disclosure.hasAttribute('data-expanded') && disclosure.open);
  if (!expanded && tools.contains(document.activeElement)) disclosure.querySelector<HTMLElement>('summary')!.focus({ preventScroll: true });
  tools.inert = !expanded;
};
new MutationObserver(syncTools).observe(disclosure, { attributes: true, attributeFilter: ['data-expanded', 'open'] });
syncTools();
for (const [buttonId, panelId] of [['gear-filter-toggle', 'gear-filters'], ['gear-search-toggle', 'gear-search-box']]) {
  const button = document.getElementById(buttonId)!; const panel = document.getElementById(panelId)!;
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(expanded));
    panel.parentElement!.dataset.open = String(expanded);
    panel.inert = !expanded;
    if (expanded && !disclosure.open) (disclosure.querySelector('summary') as HTMLElement).click();
    if (expanded && panelId === 'gear-search-box') search.focus({ preventScroll: true });
  });
}
document.querySelectorAll<HTMLButtonElement>('[data-owner]').forEach(button => button.addEventListener('click', () => {
  owner = button.dataset.owner || ''; filterToggle.querySelector('.gear-tool-label')!.textContent = owner ? `Filter · ${owner.split(' ')[0]}` : 'Filter';
  document.querySelectorAll('[data-owner]').forEach(option => option.setAttribute('aria-pressed', String((option as HTMLElement).dataset.owner === owner))); render();
}));
search.addEventListener('input', render);
clear.addEventListener('click', () => { search.value = ''; document.querySelector<HTMLButtonElement>('[data-owner=""]')!.click(); });
fetch('/api/gear').then(async response => {
  if (response.status === 404) return { items: [] };
  if (!response.ok) throw new Error('unavailable'); return response.json();
}).then(data => { if (!Array.isArray(data.items)) throw new Error('invalid'); items = data.items; loaded = true; render(); }).catch(() => { results.replaceChildren(element('p', 'gear-empty', 'Our collection is temporarily unavailable. Please try again shortly.')); });

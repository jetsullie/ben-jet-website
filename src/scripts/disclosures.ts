const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const controllers = new Map<HTMLDetailsElement, (expanded: boolean, animate?: boolean) => Promise<void>>();

document.querySelectorAll<HTMLDetailsElement>('details[data-disclosure]').forEach(details => {
  const summary = details.querySelector<HTMLElement>(':scope > summary')!;
  const content = summary.nextElementSibling as HTMLElement;
  let expanded = details.open;
  let animation: Animation | null = null;
  let resolvePending: (() => void) | undefined;
  const settle = () => {
    details.open = expanded;
    details.style.removeProperty('height');
    details.style.removeProperty('overflow');
    content.inert = !expanded;
  };
  const setExpanded = (next: boolean, animate = true): Promise<void> => {
    const start = details.getBoundingClientRect().height;
    if (animation) { animation.onfinish = null; animation.cancel(); animation = null; }
    resolvePending?.();
    expanded = next;
    details.dataset.expanded = String(expanded);
    summary.setAttribute('aria-expanded', String(expanded));
    if (!animate || reduced.matches) { settle(); return Promise.resolve(); }
    details.open = true;
    content.inert = !expanded;
    details.style.height = 'auto';
    const end = expanded ? details.getBoundingClientRect().height : summary.getBoundingClientRect().height;
    details.style.height = `${start}px`;
    details.style.overflow = 'hidden';
    return new Promise(resolve => {
      resolvePending = resolve;
      animation = details.animate({ height: [`${start}px`, `${end}px`] }, {
        duration: 360, easing: 'cubic-bezier(.22, 1, .36, 1)',
      });
      animation.onfinish = () => { animation = null; settle(); resolvePending = undefined; resolve(); };
    });
  };
  details.dataset.expanded = String(expanded);
  summary.setAttribute('aria-expanded', String(expanded));
  summary.addEventListener('click', event => { event.preventDefault(); void setExpanded(!expanded); });
  reduced.addEventListener('change', () => { if (reduced.matches) void setExpanded(expanded, false); });
  controllers.set(details, setExpanded);
});

let navigation = 0;
async function openHash(animate = false) {
  const request = ++navigation;
  let id: string;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  const target = document.getElementById(id);
  if (!(target instanceof HTMLDetailsElement) || !target.matches('[data-work-section]')) return;
  await controllers.get(target)?.(true, animate);
  await document.fonts.ready;
  if (request !== navigation) return;
  target.scrollIntoView({ block: 'start', behavior: animate && !reduced.matches ? 'smooth' : 'instant' });
  target.querySelector<HTMLElement>('summary')?.focus({ preventScroll: true });
}
addEventListener('hashchange', () => { void openHash(true); });
// Clicking the current anchor must also reopen a section the visitor closed.
document.addEventListener('click', event => {
  const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
  if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const url = new URL(link.href);
  if (url.origin === location.origin && url.pathname === location.pathname && url.hash && url.hash === location.hash) {
    event.preventDefault(); void openHash(true);
  }
});
void openHash();

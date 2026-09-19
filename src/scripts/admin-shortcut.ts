// A navigation shortcut only; /admin remains protected by owner middleware.
const footerName = document.querySelector<HTMLAnchorElement>('[data-admin-shortcut="true"]');
if (footerName) {
  let clicks = 0;
  let started = 0;
  footerName.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const now = performance.now();
    if (!clicks || now - started > 1200) { clicks = 0; started = now; }
    clicks += 1;
    if (clicks === 3) { clicks = 0; window.location.assign('/admin/'); }
  });
  footerName.addEventListener('blur', () => { clicks = 0; });
}

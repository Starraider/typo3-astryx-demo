export class MobileNavController {
  constructor(root) {
    const dialog = root.querySelector('dialog');
    const open = root.querySelector('[data-nav-open]');
    if (!dialog || typeof dialog.showModal !== 'function') return;
    const close = () => { if (dialog.open) dialog.close(); };
    open.addEventListener('click', () => { dialog.showModal(); open.setAttribute('aria-expanded', 'true'); });
    dialog.querySelector('[data-nav-close]').addEventListener('click', close);
    dialog.addEventListener('close', () => { open.setAttribute('aria-expanded', 'false'); if (open.getClientRects().length) open.focus(); });
    dialog.addEventListener('click', event => { if (event.target.closest('a')) close(); });
    const desktop = matchMedia('(min-width: 60rem)'); desktop.addEventListener('change', event => { if (event.matches) close(); });
    root.dataset.enhanced = '';
  }
}

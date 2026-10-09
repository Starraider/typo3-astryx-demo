export class DropdownController {
  constructor(root) {
    const dropdowns = [...root.querySelectorAll('[data-astryx-dropdown]')];
    const summary = dropdown => dropdown.querySelector(':scope > summary');
    const close = dropdown => {
      dropdown.open = false;
      summary(dropdown).setAttribute('aria-expanded', 'false');
    };
    for (const dropdown of dropdowns) {
      summary(dropdown).setAttribute('aria-expanded', String(dropdown.open));
      dropdown.addEventListener('toggle', () => {
        summary(dropdown).setAttribute('aria-expanded', String(dropdown.open));
        if (dropdown.open) {
          const panel = dropdown.querySelector(':scope > .astryx-dropdown-panel');
          panel.style.removeProperty('--astryx-dropdown-offset');
          if (getComputedStyle(panel).position === 'absolute') {
            const bounds = panel.getBoundingClientRect();
            const offset = bounds.left < 16 ? 16 - bounds.left : Math.min(0, innerWidth - 16 - bounds.right);
            panel.style.setProperty('--astryx-dropdown-offset', `${offset}px`);
          }
          for (const other of dropdowns) {
            if (other !== dropdown && !other.contains(dropdown) && !dropdown.contains(other)) close(other);
          }
        } else {
          dropdown.querySelectorAll('[data-astryx-dropdown]').forEach(close);
        }
      });
      dropdown.addEventListener('keydown', event => {
        if (event.key !== 'Escape' || !dropdown.open) return;
        event.preventDefault();
        event.stopPropagation();
        close(dropdown);
        summary(dropdown).focus();
      });
      dropdown.addEventListener('focusout', event => {
        if (!dropdown.contains(event.relatedTarget)) close(dropdown);
      });
    }
    document.addEventListener('click', event => {
      for (const dropdown of dropdowns) {
        if (!dropdown.contains(event.target) || event.target.closest('a')) close(dropdown);
      }
    });
    root.querySelector('dialog')?.addEventListener('close', () => dropdowns.forEach(close));
    matchMedia('(min-width: 60rem)').addEventListener('change', () => dropdowns.forEach(close));
  }
}

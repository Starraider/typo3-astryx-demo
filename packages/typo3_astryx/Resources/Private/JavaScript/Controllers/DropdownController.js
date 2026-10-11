export class DropdownController {
  constructor(root) {
    const dropdowns = [...root.querySelectorAll('[data-astryx-dropdown]')];
    const summary = dropdown => dropdown.querySelector(':scope > summary');
    const panel = dropdown => dropdown.querySelector(':scope > .astryx-dropdown-panel');
    const nested = dropdown => dropdown.parentElement.parentElement.classList.contains('astryx-submenu');
    const desktop = dropdown => dropdown.closest('.astryx-navigation > .astryx-main-menu') && matchMedia('(min-width: 60rem)').matches;
    const timers = new Map();
    const cancelClose = dropdown => { clearTimeout(timers.get(dropdown)); timers.delete(dropdown); };
    const close = dropdown => {
      cancelClose(dropdown);
      dropdown.open = false;
      summary(dropdown).setAttribute('aria-expanded', 'false');
      dropdown.querySelectorAll('[data-astryx-dropdown]').forEach(child => {
        cancelClose(child);
        child.open = false;
        summary(child).setAttribute('aria-expanded', 'false');
      });
    };
    const position = dropdown => {
      const surface = panel(dropdown);
      surface.style.removeProperty('--astryx-dropdown-offset');
      surface.style.removeProperty('--astryx-flyout-offset');
      surface.style.removeProperty('--astryx-flyout-max-width');
      delete dropdown.dataset.side;
      if (getComputedStyle(surface).position !== 'absolute') return;
      if (nested(dropdown) && desktop(dropdown)) {
        const item = dropdown.parentElement.getBoundingClientRect();
        const rtl = getComputedStyle(dropdown).direction === 'rtl';
        const endSpace = rtl ? item.left - 20 : innerWidth - item.right - 20;
        const startSpace = rtl ? innerWidth - item.right - 20 : item.left - 20;
        const width = surface.getBoundingClientRect().width;
        const flip = width > endSpace && startSpace > endSpace;
        dropdown.dataset.side = flip ? 'start' : 'end';
        surface.style.setProperty('--astryx-flyout-max-width', `${Math.max(1, flip ? startSpace : endSpace)}px`);
        const bounds = surface.getBoundingClientRect();
        const offset = bounds.top < 16 ? 16 - bounds.top : Math.min(0, innerHeight - 16 - bounds.bottom);
        surface.style.setProperty('--astryx-flyout-offset', `${offset}px`);
      } else {
        const bounds = surface.getBoundingClientRect();
        const offset = bounds.left < 16 ? 16 - bounds.left : Math.min(0, innerWidth - 16 - bounds.right);
        surface.style.setProperty('--astryx-dropdown-offset', `${offset}px`);
      }
    };
    const open = dropdown => {
      cancelClose(dropdown);
      for (const other of dropdowns) {
        if (other !== dropdown && !other.contains(dropdown) && !dropdown.contains(other)) close(other);
      }
      dropdown.open = true;
      summary(dropdown).setAttribute('aria-expanded', 'true');
      position(dropdown);
    };
    const firstLink = dropdown => panel(dropdown).querySelector(':scope > ul > li > a');
    for (const dropdown of dropdowns) {
      summary(dropdown).setAttribute('aria-expanded', String(dropdown.open));
      dropdown.addEventListener('toggle', () => {
        summary(dropdown).setAttribute('aria-expanded', String(dropdown.open));
        if (dropdown.open) open(dropdown);
        else dropdown.querySelectorAll('[data-astryx-dropdown]').forEach(close);
      });
      dropdown.parentElement.addEventListener('focusout', event => {
        // WebKit may clear summary focus on pointer-down before a link receives its click.
        if (event.relatedTarget && !dropdown.parentElement.contains(event.relatedTarget)) close(dropdown);
      });
      if (nested(dropdown)) {
        const item = dropdown.parentElement;
        summary(dropdown).addEventListener('click', event => {
          // Pointer entry has already opened the flyout; do not immediately toggle it shut.
          if (event.detail > 0 && desktop(dropdown) && dropdown.open) event.preventDefault();
        });
        item.addEventListener('pointerenter', event => {
          if (event.pointerType === 'mouse' && desktop(dropdown)) open(dropdown);
        });
        item.addEventListener('pointerleave', event => {
          if (event.pointerType !== 'mouse' || !desktop(dropdown)) return;
          cancelClose(dropdown);
          timers.set(dropdown, setTimeout(() => {
            if (!item.contains(document.activeElement)) close(dropdown);
          }, 180));
        });
      }
    }
    root.addEventListener('keydown', event => {
      const item = event.target.closest('.astryx-menu-item');
      const own = item?.querySelector(':scope > [data-astryx-dropdown]');
      const containing = event.target.closest('[data-astryx-dropdown]');
      const rtl = getComputedStyle(event.target).direction === 'rtl';
      const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
      const back = rtl ? 'ArrowRight' : 'ArrowLeft';
      if (event.key === 'Escape' || (event.key === back && desktop(containing ?? own ?? root))) {
        const target = own?.open ? own : containing;
        if (!target?.open) return;
        event.preventDefault();
        event.stopPropagation();
        close(target);
        summary(target).focus();
      } else if (own && (event.key === forward || (event.key === 'ArrowDown' && !nested(own)))) {
        event.preventDefault();
        open(own);
        firstLink(own)?.focus();
      } else if (item?.parentElement.classList.contains('astryx-submenu') && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        const links = [...item.parentElement.querySelectorAll(':scope > li > a')];
        const index = links.indexOf(item.querySelector(':scope > a'));
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? links.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
        event.preventDefault();
        links[next]?.focus();
      }
    });
    document.addEventListener('click', event => {
      for (const dropdown of dropdowns) {
        if (!dropdown.parentElement.contains(event.target)) close(dropdown);
        else if (event.target.closest('a')) {
          // Let the link navigate before closing its details; WebKit otherwise cancels navigation.
          setTimeout(() => close(dropdown), 0);
        }
      }
    });
    root.querySelector('dialog')?.addEventListener('close', () => dropdowns.forEach(close));
    matchMedia('(min-width: 60rem)').addEventListener('change', () => dropdowns.forEach(close));
    window.addEventListener('resize', () => dropdowns.filter(dropdown => dropdown.open).forEach(position));
  }
}

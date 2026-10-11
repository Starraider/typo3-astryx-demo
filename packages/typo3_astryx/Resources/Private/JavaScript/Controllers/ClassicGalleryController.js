export class ClassicGalleryController {
  constructor(root) {
    this.initializeLightbox(root);
    const filters = root.querySelector('[data-gallery-filters]');
    const allButton = filters?.querySelector('button');
    const tiles = [...root.querySelectorAll('[data-gallery-category]')];
    if (!filters || !allButton || tiles.length === 0) return;

    // Read categories only from rendered, available images. Keep editor order.
    const categories = new Map();
    const categoryKey = value => value.trim().normalize('NFC').toLocaleLowerCase();
    const tileCategories = tiles.map(tile => {
      const label = tile.dataset.galleryCategory.trim();
      const key = categoryKey(label);
      if (key && !categories.has(key)) categories.set(key, label);
      return key;
    });
    if (categories.size === 0) return;

    const buttons = [allButton];
    const selections = new Map([[allButton, null]]);
    for (const [key, label] of categories) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-controls', allButton.getAttribute('aria-controls'));
      filters.append(button);
      buttons.push(button);
      selections.set(button, key);
    }

    const select = button => {
      const category = selections.get(button);
      buttons.forEach(candidate => candidate.setAttribute('aria-pressed', String(candidate === button)));
      tiles.forEach((tile, index) => { tile.hidden = category !== null && tileCategories[index] !== category; });
      const status = root.querySelector('[data-gallery-status]');
      if (status) {
        const count = tiles.filter(tile => !tile.hidden).length;
        status.textContent = root.dataset.galleryCountLabel.replace('%s', String(count));
      }
    };
    filters.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (selections.has(button)) select(button);
    });
    filters.addEventListener('keydown', event => {
      const current = buttons.indexOf(event.target);
      if (current < 0) return;
      const rtl = getComputedStyle(filters).direction === 'rtl';
      const delta = {ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1}[event.key];
      let next;
      if (delta) next = (current + delta + buttons.length) % buttons.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = buttons.length - 1;
      else return;
      event.preventDefault();
      buttons[next].focus();
      select(buttons[next]);
    });
    filters.hidden = false;
  }
  initializeLightbox(root) {
    const dialog = root.querySelector('[data-gallery-lightbox]');
    const links = [...root.querySelectorAll('[data-gallery-open]')];
    if (!dialog || typeof dialog.showModal !== 'function' || links.length === 0) return;
    const media = dialog.querySelector('[data-lightbox-media]');
    const previous = dialog.querySelector('[data-lightbox-previous]');
    const next = dialog.querySelector('[data-lightbox-next]');
    const close = dialog.querySelector('[data-lightbox-close]');
    const counter = dialog.querySelector('[data-lightbox-counter]');
    let index = 0;
    let opener;
    let savedOverflow;

    const show = target => {
      const captionWasFocused = media.contains(document.activeElement);
      index = Math.max(0, Math.min(links.length - 1, target));
      const link = links[index];
      const thumbnail = link.querySelector('img');
      // Use the original, uncropped FAL URL rather than the thumbnail's srcset.
      const image = new Image();
      image.src = link.href;
      image.alt = thumbnail.alt;
      image.decoding = 'async';
      const caption = document.createElement('figcaption');
      caption.textContent = link.dataset.galleryCaption || '';
      caption.hidden = !caption.textContent;
      // Let keyboard users scroll long descriptions in every supported browser.
      if (!caption.hidden) caption.tabIndex = 0;
      media.replaceChildren(image, caption);
      if (captionWasFocused) (caption.hidden ? close : caption).focus();
      counter.textContent = `${index + 1} / ${links.length}`;
      previous.disabled = index === 0;
      next.disabled = index === links.length - 1;
      // Keep focus inside the dialog if the focused arrow becomes disabled.
      if (document.activeElement === previous && previous.disabled) next.focus();
      if (document.activeElement === next && next.disabled) previous.focus();
    };
    links.forEach((link, target) => {
      link.setAttribute('aria-haspopup', 'dialog');
      link.setAttribute('aria-controls', dialog.id);
      link.addEventListener('click', event => {
        // Preserve modified clicks and the original-image fallback without JS.
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        opener = link;
        show(target);
        savedOverflow = document.documentElement.style.overflow;
        dialog.showModal();
        document.documentElement.style.overflow = 'hidden';
        close.focus();
      });
    });
    previous.addEventListener('click', () => show(index - 1));
    next.addEventListener('click', () => show(index + 1));
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target === dialog || event.target === media) dialog.close();
    });
    dialog.addEventListener('keydown', event => {
      if (event.key === 'Tab') {
        const caption = media.querySelector('figcaption:not([hidden])');
        const controls = [close, previous, caption, next].filter(control => control && !control.disabled);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
        return;
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        const rtl = getComputedStyle(dialog).direction === 'rtl';
        show(index + ((event.key === 'ArrowRight') !== rtl ? 1 : -1));
      }
    });
    // Native dialog supplies Escape dismissal and an inert background.
    dialog.addEventListener('close', () => {
      document.documentElement.style.overflow = savedOverflow;
      media.replaceChildren();
      if (opener?.isConnected && opener.getClientRects().length) opener.focus({preventScroll: true});
    });
  }
}

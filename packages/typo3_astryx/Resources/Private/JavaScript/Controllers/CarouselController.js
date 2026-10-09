export class CarouselController {
  constructor(root) {
    const track = root.querySelector('.astryx-carousel-track');
    const controls = root.querySelector('.astryx-carousel-controls');
    const slides = [...track.children];
    if (!controls || slides.length < 2) return;
    const prev = controls.querySelector('[data-prev]');
    const next = controls.querySelector('[data-next]');
    const live = controls.querySelector('[data-position]');
    const rtl = getComputedStyle(track).direction === 'rtl';
    const position = () => {
      const box = track.getBoundingClientRect();
      const edge = rtl ? box.right : box.left;
      let best = 0;
      for (let i = 1; i < slides.length; i++) {
        const a = slides[i].getBoundingClientRect(); const b = slides[best].getBoundingClientRect();
        if (Math.abs((rtl ? a.right : a.left) - edge) < Math.abs((rtl ? b.right : b.left) - edge)) best = i;
      }
      return best;
    };
    const update = () => {
      const box = track.getBoundingClientRect();
      const first = slides[0].getBoundingClientRect(); const last = slides.at(-1).getBoundingClientRect();
      prev.disabled = rtl ? first.right <= box.right + 2 : first.left >= box.left - 2;
      next.disabled = rtl ? last.left >= box.left - 2 : last.right <= box.right + 2;
      controls.hidden = track.scrollWidth <= track.clientWidth + 2;
    };
    const move = direction => {
      const index = Math.max(0, Math.min(slides.length - 1, position() + direction));
      const box = track.getBoundingClientRect(); const target = slides[index].getBoundingClientRect();
      const delta = rtl ? target.right - box.right : target.left - box.left;
      track.scrollBy({left: delta, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
      // Numeric position avoids untranslated English strings in the announcement.
      live.textContent = `${index + 1} / ${slides.length}`;
    };
    prev.addEventListener('click', () => move(-1)); next.addEventListener('click', () => move(1));
    track.addEventListener('scroll', update, {passive: true});
    this.observer = new ResizeObserver(update); this.observer.observe(track);
    controls.hidden = false; update();
  }
}

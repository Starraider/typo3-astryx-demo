export class CarouselController {
  constructor(root) {
    const track = root.querySelector('.astryx-carousel-track');
    const controls = root.querySelector('.astryx-carousel-controls');
    if (!track || !controls || track.children.length < 2) return;
    const slides = [...track.children];
    const dots = [...controls.querySelectorAll('[data-carousel-page]')];
    const prev = controls.querySelector('[data-prev]');
    const next = controls.querySelector('[data-next]');
    const live = controls.querySelector('[data-position]');
    let pages = [];
    let rtl = false;
    let announced = '';
    const scrollPosition = () => {
      const box = track.getBoundingClientRect();
      const first = slides[0].getBoundingClientRect();
      return rtl ? first.right - box.right : box.left - first.left;
    };
    const position = () => {
      const current = scrollPosition();
      return pages.reduce((best, offset, index) => Math.abs(offset - current) < Math.abs(pages[best] - current) ? index : best, 0);
    };
    const update = () => {
      const index = position();
      prev.disabled = index === 0;
      next.disabled = index === pages.length - 1;
      dots.forEach((dot, i) => {
        if (i === index) dot.setAttribute('aria-current', 'page');
        else dot.removeAttribute('aria-current');
      });
      const label = live.dataset.positionLabel.replace('%d', index + 1).replace('%d', pages.length);
      if (label !== announced) { live.textContent = label; announced = label; }
    };
    const measure = () => {
      rtl = getComputedStyle(track).direction === 'rtl';
      const max = Math.max(0, track.scrollWidth - track.clientWidth);
      const first = slides[0].getBoundingClientRect();
      // Trailing cards can share a clamped final snap position when several cards
      // fit in the viewport. Give every reachable position exactly one dot.
      pages = [];
      for (const slide of slides) {
        const box = slide.getBoundingClientRect();
        const offset = Math.min(max, rtl ? first.right - box.right : box.left - first.left);
        if (!pages.length || offset - pages.at(-1) > 2) pages.push(offset);
      }
      dots.forEach((dot, i) => { dot.hidden = i >= pages.length; });
      if (dots.includes(document.activeElement) && document.activeElement.hidden) dots[pages.length - 1].focus({preventScroll: true});
      controls.hidden = max <= 2;
      update();
    };
    const moveTo = index => {
      const target = Math.max(0, Math.min(pages.length - 1, index));
      const delta = pages[target] - scrollPosition();
      track.scrollBy({left: rtl ? -delta : delta, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    };
    prev.addEventListener('click', () => moveTo(position() - 1));
    next.addEventListener('click', () => moveTo(position() + 1));
    dots.forEach((dot, index) => dot.addEventListener('click', () => moveTo(index)));
    track.addEventListener('scroll', update, {passive: true});
    this.observer = new ResizeObserver(measure);
    this.observer.observe(track);
    slides.forEach(slide => this.observer.observe(slide));
    measure();
  }
}

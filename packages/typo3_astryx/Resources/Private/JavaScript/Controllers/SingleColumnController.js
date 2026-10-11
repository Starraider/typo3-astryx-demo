// Correct the CSS centered breakout for off-center sidebar/nested containers.
export class SingleColumnController {
  constructor(root) {
    if (root.dataset.astryxSingleColumn !== 'full-bleed') return;
    const wrapper = root.parentElement;
    let frame;
    const update = () => {
      frame = undefined;
      const viewport = document.documentElement.clientWidth;
      const box = wrapper.getBoundingClientRect();
      const offset = getComputedStyle(root).direction === 'rtl'
        ? box.right + window.scrollX - viewport
        : -box.left - window.scrollX;
      root.style.setProperty('--astryx-single-bleed-width', `${viewport}px`);
      root.style.setProperty('--astryx-single-bleed-offset', `${offset}px`);
    };
    const schedule = () => { if (frame === undefined) frame = requestAnimationFrame(update); };
    update();
    new ResizeObserver(schedule).observe(wrapper);
    window.addEventListener('resize', schedule, {passive: true});
  }
}

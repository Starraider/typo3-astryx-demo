export class AccordionController {
  constructor(root) {
    this.root = root;
    this.single = root.dataset.mode === 'single';
    this.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    this.items = [...root.children].filter(item => item.tagName === 'DETAILS').map(item => ({
      item,
      trigger: item.querySelector(':scope > summary'),
      content: item.querySelector(':scope > .astryx-accordion-content'),
      expanded: item.open,
      animation: null,
    }));
    let firstOpen = false;
    for (const state of this.items) {
      // Native grouping supplies the no-JS fallback. JS coordinates both animations.
      state.item.removeAttribute('name');
      if (this.single && state.expanded) {
        if (firstOpen) state.item.open = state.expanded = false;
        firstOpen = true;
      }
      state.trigger.setAttribute('aria-expanded', String(state.expanded));
      state.trigger.addEventListener('click', event => {
        event.preventDefault();
        this.setExpanded(state, !state.expanded);
      });
      state.item.addEventListener('toggle', () => {
        // Also synchronize changes made by other scripts, without replaying our animations.
        if (!state.animation && state.item.open !== state.expanded) this.setExpanded(state, state.item.open);
      });
    }
  }

  setExpanded(state, expanded) {
    if (this.single && expanded) {
      for (const other of this.items) if (other !== state && other.expanded) this.setExpanded(other, false);
    }
    const startHeight = state.item.getBoundingClientRect().height;
    state.animation?.cancel();
    state.animation = null;
    state.expanded = expanded;
    state.trigger.setAttribute('aria-expanded', String(expanded));
    // Hidden content cannot receive focus while its closing animation is running.
    state.content.inert = !expanded;
    if (!expanded && state.content.contains(document.activeElement)) state.trigger.focus();
    if (this.reducedMotion.matches || typeof state.item.animate !== 'function') {
      state.item.open = expanded;
      delete state.item.dataset.animating;
      return;
    }
    state.item.open = true;
    // Single-mode cards have their own padding and border; include both in the
    // border-box animation height so content is not clipped before it settles.
    const itemStyle = getComputedStyle(state.item);
    const inset = ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth']
      .reduce((total, property) => total + parseFloat(itemStyle[property]), 0);
    const endHeight = inset + state.trigger.getBoundingClientRect().height + (expanded ? state.content.getBoundingClientRect().height : 0);
    const style = getComputedStyle(this.root);
    const duration = style.getPropertyValue('--astryx-duration').trim();
    const milliseconds = parseFloat(duration) * (duration.endsWith('ms') ? 1 : 1000);
    state.item.dataset.animating = '';
    const animation = state.item.animate(
      [{height: `${startHeight}px`}, {height: `${endHeight}px`}],
      {duration: Number.isFinite(milliseconds) ? milliseconds : 125, easing: style.getPropertyValue('--astryx-easing').trim() || 'ease', fill: 'both'},
    );
    state.animation = animation;
    animation.finished.then(() => {
      if (state.animation !== animation) return;
      state.item.open = state.expanded;
      state.animation = null;
      delete state.item.dataset.animating;
      animation.cancel();
    }).catch(() => {}); // A second click reverses the in-flight animation.
  }
}

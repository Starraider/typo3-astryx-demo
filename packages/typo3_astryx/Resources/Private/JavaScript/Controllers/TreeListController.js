/** Progressive enhancement of linked lists into an ARIA tree, without React. */
export class TreeListController {
  constructor(root) {
    if (root.hasAttribute('data-enhanced')) return;
    this.root = root;
    this.items = [...root.querySelectorAll('[data-tree-item]')];
    this.search = '';
    this.searchTime = 0;
    const list = root.querySelector('[data-tree-root]');
    list.setAttribute('role', 'tree');
    list.setAttribute('aria-label', root.getAttribute('aria-label'));
    for (const item of this.items) {
      const link = this.link(item);
      item.setAttribute('role', 'treeitem');
      item.setAttribute('aria-labelledby', link.id);
      item.tabIndex = -1;
      link.tabIndex = -1;
      const toggle = this.toggle(item);
      if (toggle) {
        toggle.tabIndex = -1;
        this.group(item).setAttribute('role', 'group');
        // Current-page ancestors remain discoverable on first render.
        this.setExpanded(item, !!item.querySelector('[data-active="true"], [aria-current="page"]'));
        toggle.hidden = false;
      }
    }
    const visible = this.visibleItems();
    this.setTabStop(visible.find(item => this.link(item).getAttribute('aria-current') === 'page') ?? visible[0]);
    root.setAttribute('data-enhanced', '');
    root.addEventListener('focusin', event => {
      const item = event.target.closest('[data-tree-item]');
      if (this.items.includes(item)) this.setTabStop(item);
    });
    root.addEventListener('click', event => {
      const toggle = event.target.closest('[data-tree-toggle]');
      if (!toggle || !root.contains(toggle)) return;
      const item = toggle.closest('[data-tree-item]');
      this.setExpanded(item, !this.expanded(item));
      this.focus(item);
    });
    root.addEventListener('keydown', event => this.onKeyDown(event));
  }

  link(item) { return item.querySelector(':scope > .astryx-tree-list-row > a'); }
  toggle(item) { return item.querySelector(':scope > .astryx-tree-list-row > [data-tree-toggle]'); }
  group(item) { return item.querySelector(':scope > ul'); }
  expanded(item) { return item.getAttribute('aria-expanded') === 'true'; }
  visibleItems() { return this.items.filter(item => !item.closest('[hidden]')); }
  setTabStop(item) { for (const node of this.items) node.tabIndex = node === item ? 0 : -1; }
  focus(item) {
    if (item) {
      this.setTabStop(item);
      item.focus({preventScroll: true});
      item.querySelector(':scope > .astryx-tree-list-row').scrollIntoView({block: 'nearest'});
    }
  }

  setExpanded(item, expanded) {
    const group = this.group(item);
    if (!group) return;
    if (!expanded && group.contains(document.activeElement)) this.focus(item);
    group.hidden = !expanded;
    item.setAttribute('aria-expanded', String(expanded));
    this.toggle(item).setAttribute('aria-expanded', String(expanded));
    // A collapsed subtree must never own the tree's only tab stop.
    if (!expanded && group.querySelector('[tabindex="0"]')) this.setTabStop(item);
  }

  onKeyDown(event) {
    if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
    const item = event.target.closest('[data-tree-item]');
    if (!this.items.includes(item)) return;
    const visible = this.visibleItems();
    const index = visible.indexOf(item);
    const rtl = getComputedStyle(this.root).direction === 'rtl';
    const expandKey = rtl ? 'ArrowLeft' : 'ArrowRight';
    const collapseKey = rtl ? 'ArrowRight' : 'ArrowLeft';
    let next;
    switch (event.key) {
      case 'ArrowDown': next = visible[Math.min(index + 1, visible.length - 1)]; break;
      case 'ArrowUp': next = visible[Math.max(index - 1, 0)]; break;
      case 'Home': next = visible[0]; break;
      case 'End': next = visible.at(-1); break;
      case expandKey:
        if (this.group(item)) {
          if (!this.expanded(item)) this.setExpanded(item, true);
          else next = this.group(item).querySelector('[data-tree-item]');
        }
        break;
      case collapseKey:
        if (this.expanded(item)) this.setExpanded(item, false);
        else next = item.parentElement.closest('[data-tree-item]');
        break;
      case 'Enter':
        if (event.target.closest('[data-tree-toggle]')) {
          this.setExpanded(item, !this.expanded(item));
          next = item;
        } else this.link(item).click();
        break;
      case ' ':
        if (this.toggle(item)) this.setExpanded(item, !this.expanded(item));
        break;
      case '*':
        for (const sibling of item.parentElement.children) {
          if (this.toggle(sibling)) this.setExpanded(sibling, true);
        }
        break;
      default:
        if (event.key.length !== 1) return;
        const now = Date.now();
        this.search = now - this.searchTime > 700 ? event.key : this.search + event.key;
        this.searchTime = now;
        const term = this.search.toLocaleLowerCase();
        const prefix = [...term].every(char => char === term[0]) ? term[0] : term;
        next = [...visible.slice(index + 1), ...visible.slice(0, index + 1)]
          .find(node => this.link(node).textContent.trim().toLocaleLowerCase().startsWith(prefix));
    }
    event.preventDefault();
    this.focus(next);
  }
}

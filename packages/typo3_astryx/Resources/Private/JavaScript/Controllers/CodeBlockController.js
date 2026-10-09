// Grammars are loaded only on pages with snippets.
const highlighter = () => import('../code-highlighter.js');

export class CodeBlockController {
  constructor(root) {
    if (root.dataset.enhanced) return;
    const code = root.querySelector('code');
    const button = root.querySelector('[data-code-copy]');
    if (!code || !button) return;
    root.dataset.enhanced = 'true';
    this.code = code.textContent;
    this.button = button;
    this.status = root.querySelector('[data-code-status]');
    button.hidden = false;
    button.addEventListener('click', () => this.copy());
    if (root.dataset.lineNumbers === '1') {
      const gutter = document.createElement('span');
      gutter.className = 'astryx-code-block-gutter';
      gutter.setAttribute('aria-hidden', 'true');
      const lines = this.code.replace(/\r\n?/g, '\n').split('\n');
      gutter.textContent = lines.map((_, index) => index + 1).join('\n');
      code.before(gutter);
    }
    if (root.dataset.language !== 'plaintext' && this.code) {
      highlighter().then(({highlight}) => {
        // Highlight.js escapes source text; editor-supplied HTML is never executed.
        const highlighted = highlight(this.code, root.dataset.language);
        if (highlighted !== null) code.innerHTML = highlighted;
      }).catch(error => console.error('Astryx code highlighting failed', error));
    }
  }

  async copy() {
    if (this.copying) return;
    this.copying = true;
    this.button.setAttribute('aria-busy', 'true');
    clearTimeout(this.resetTimer);
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        try { await navigator.clipboard.writeText(this.code); copied = true; } catch { /* Try the browser fallback. */ }
      }
      if (!copied) copied = this.copyFallback();
    } finally {
      const label = copied ? this.button.dataset.labelCopied : this.button.dataset.labelError;
      this.button.dataset.state = copied ? 'copied' : 'error';
      this.button.setAttribute('aria-label', label);
      this.button.title = label;
      this.status.textContent = label;
      this.copying = false;
      this.button.removeAttribute('aria-busy');
      this.resetTimer = setTimeout(() => {
        delete this.button.dataset.state;
        this.button.setAttribute('aria-label', this.button.dataset.labelCopy);
        this.button.title = this.button.dataset.labelCopy;
        this.status.textContent = '';
      }, 2500);
    }
  }

  copyFallback() {
    const active = document.activeElement;
    const selection = window.getSelection();
    const ranges = selection ? Array.from({length: selection.rangeCount}, (_, index) => selection.getRangeAt(index).cloneRange()) : [];
    const textarea = document.createElement('textarea');
    textarea.value = this.code;
    textarea.className = 'astryx-code-copy-buffer';
    textarea.setAttribute('readonly', '');
    document.body.append(textarea);
    try {
      textarea.focus({preventScroll: true});
      textarea.select();
      return document.execCommand('copy');
    } catch { return false; }
    finally {
      textarea.remove();
      active?.focus({preventScroll: true});
      if (selection) {
        selection.removeAllRanges();
        for (const range of ranges) selection.addRange(range);
      }
    }
  }
}

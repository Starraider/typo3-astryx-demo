import * as stylex from '@stylexjs/stylex';
import {styles} from '../../../../ContentBlocks/ContentElements/code-block/src/code-block.stylex.js';

// Grammars are loaded only on pages with snippets.
const highlighter = () => import('../code-highlighter.js');
const syntaxClasses = {
  comment: stylex.props(styles.part_syntax_comment).className,
  keyword: stylex.props(styles.part_syntax_keyword).className,
  constant: stylex.props(styles.part_syntax_constant).className,
  string: stylex.props(styles.part_syntax_string).className,
  number: stylex.props(styles.part_syntax_number).className,
  type: stylex.props(styles.part_syntax_type).className,
  attribute: stylex.props(styles.part_syntax_attribute).className,
  variable: stylex.props(styles.part_syntax_variable).className,
  function: stylex.props(styles.part_syntax_function).className,
  tag: stylex.props(styles.part_syntax_tag).className,
  property: stylex.props(styles.part_syntax_property).className,
  operator: stylex.props(styles.part_syntax_operator).className,
  punctuation: stylex.props(styles.part_syntax_punctuation).className,
  emphasis: stylex.props(styles.part_syntax_emphasis).className,
  strong: stylex.props(styles.part_syntax_strong).className,
};
const syntaxTokenGroups = [
  ['comment', ['hljs-comment', 'hljs-quote']],
  ['keyword', ['hljs-keyword', 'hljs-selector-tag', 'hljs-deletion']],
  ['constant', ['hljs-literal']],
  ['string', ['hljs-string', 'hljs-regexp', 'hljs-addition']],
  ['number', ['hljs-number']],
  ['type', ['hljs-built_in', 'hljs-type']],
  ['attribute', ['hljs-attr', 'hljs-attribute']],
  ['variable', ['hljs-variable', 'hljs-template-variable']],
  ['function', ['hljs-title', 'hljs-selector-class', 'hljs-selector-id', 'hljs-meta']],
  ['tag', ['hljs-name']],
  ['property', ['hljs-property']],
  ['operator', ['hljs-operator']],
  ['punctuation', ['hljs-punctuation']],
];

function applySyntaxStyles(code) {
  for (const token of code.querySelectorAll('[class*="hljs-"]')) {
    const colorGroup = syntaxTokenGroups.find(([, tokenNames]) => tokenNames.some(name => token.classList.contains(name)));
    if (colorGroup) token.classList.add(...syntaxClasses[colorGroup[0]].split(/\s+/).filter(Boolean));
    for (const [tokenName, recipe] of [['hljs-emphasis', 'emphasis'], ['hljs-strong', 'strong']]) {
      if (token.classList.contains(tokenName)) token.classList.add(...syntaxClasses[recipe].split(/\s+/).filter(Boolean));
    }
  }
}

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
      const gutter = root.querySelector('[data-code-gutter]');
      const lines = this.code.replace(/\r\n?/g, '\n').split('\n');
      if (gutter) {
        gutter.textContent = lines.map((_, index) => index + 1).join('\n');
        gutter.hidden = false;
      }
    }
    if (root.dataset.language !== 'plaintext' && this.code) {
      highlighter().then(({highlight}) => {
        // Highlight.js escapes source text; editor-supplied HTML is never executed.
        const highlighted = highlight(this.code, root.dataset.language);
        if (highlighted !== null) {
          code.innerHTML = highlighted;
          applySyntaxStyles(code);
        }
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
      this.button.querySelector('.astryx-code-block-copy-icon')?.setAttribute('data-copy-state', this.button.dataset.state);
      this.button.setAttribute('aria-label', label);
      this.button.title = label;
      this.status.textContent = label;
      this.copying = false;
      this.button.removeAttribute('aria-busy');
      this.resetTimer = setTimeout(() => {
        delete this.button.dataset.state;
        this.button.querySelector('.astryx-code-block-copy-icon')?.removeAttribute('data-copy-state');
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
    textarea.style.cssText = 'position:fixed;inset:0 auto auto -9999px';
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

import * as stylex from '@stylexjs/stylex';
import { colorTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/color-tokens.stylex.js';
import { shapeTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/shape-tokens.stylex.js';
import { spacingTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/spacing-tokens.stylex.js';

export const styles = stylex.create({
  root: {boxSizing: 'border-box'},
  part_root: {
    display: 'grid',
    gap: spacingTokens['--astryx-spacing-8'],
    padding: 'clamp(1rem, 4vw, 3rem)',
    borderRadius: shapeTokens['--astryx-shape-radius-page'],
    backgroundColor: colorTokens['--astryx-color-background-surface'],
    gridTemplateColumns: {
      default: 'minmax(0, 1fr)',
      ':where([data-layout="split"])': {'@container (min-width: 40rem)': '1.2fr 1fr'},
    },
    textAlign: {
      default: 'start',
      ':where([data-align="center"])': 'center',
      ':where([data-align="end"])': 'end',
    },
    position: {default: 'static', ':where([data-layout="overlay"])': 'relative'},
    isolation: {default: 'auto', ':where([data-layout="overlay"])': 'isolate'},
    overflow: {default: 'visible', ':where([data-layout="overlay"])': 'hidden'},
    borderWidth: {default: 0, ':where([data-variant="accent"])': 2},
    borderStyle: {default: 'none', ':where([data-variant="accent"])': 'solid'},
    borderColor: {default: 'transparent', ':where([data-variant="accent"])': colorTokens['--astryx-color-accent']},
  },
  part_content: {
    minWidth: 0,
    maxWidth: {default: 'none', ':where([data-hero-layout="overlay"])': '42rem'},
    padding: {default: 0, ':where([data-hero-layout="overlay"])': 'clamp(.75rem, 3vw, 1.5rem)'},
    borderRadius: {default: 0, ':where([data-hero-layout="overlay"])': shapeTokens['--astryx-shape-radius-element']},
    backgroundColor: {default: 'transparent', ':where([data-hero-layout="overlay"])': 'rgb(255 255 255 / 46%)'},
    overflowWrap: {default: 'normal', ':where([data-hero-layout="overlay"])': 'anywhere'},
    zIndex: {default: 'auto', ':where([data-hero-layout="overlay"])': 1},
    '--astryx-color-text-primary': {default: null, ':where([data-hero-layout="overlay"])': '#000'},
    '--astryx-color-text-secondary': {default: null, ':where([data-hero-layout="overlay"])': '#000'},
    '--astryx-color-text-link': {default: null, ':where([data-hero-layout="overlay"])': '#000'},
    '--astryx-color-accent': {default: null, ':where([data-hero-layout="overlay"])': '#000'},
    '--astryx-color-code-syntax-background': {default: null, ':where([data-hero-layout="overlay"])': 'transparent'},
    '--astryx-component-badge-variant-neutral-background': {default: null, ':where([data-hero-layout="overlay"])': 'transparent'},
    '--astryx-component-badge-variant-neutral-foreground': {default: null, ':where([data-hero-layout="overlay"])': '#000'},
    '--astryx-component-badge-variant-neutral-border-color': {default: null, ':where([data-hero-layout="overlay"])': '#000'},
    '--astryx-component-button-size-medium-height': {default: null, ':where([data-hero-layout="overlay"])': 'auto'},
    '--astryx-component-button-variant-secondary-background': {default: null, ':where([data-hero-layout="overlay"])': 'transparent'},
    '--astryx-component-button-variant-secondary-background-hover': {default: null, ':where([data-hero-layout="overlay"])': '#ffffff30'},
    '--astryx-component-button-variant-secondary-border-color': {default: null, ':where([data-hero-layout="overlay"])': '#000'},
  },
});

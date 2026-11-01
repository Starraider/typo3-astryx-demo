import * as stylex from '@stylexjs/stylex';
import { spacingTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/spacing-tokens.stylex.js';

export const styles = stylex.create({
  root: {boxSizing: 'border-box'},
  part_root: {
    display: {
      default: 'grid',
      ':where([data-orientation="intext"][data-nowrap="false"])': {
        '@container (min-width: 40rem)': 'flow-root',
      },
    },
    gap: spacingTokens['--astryx-spacing-6'],
    minWidth: 0,
    gridTemplateColumns: {
      default: 'minmax(0, 1fr)',
      ':where([data-orientation="intext"][data-nowrap="true"])': {
        '@container (min-width: 40rem)': 'repeat(2, minmax(0, 1fr))',
      },
    },
  },
  part_text: {
    minWidth: 0,
    gridColumn: {default: 'auto', ':only-child': '1 / -1'},
  },
  part_media: {
    width: {
      default: '100%',
      ':where([data-orientation="intext"][data-nowrap="false"][data-alignment="left"],[data-orientation="intext"][data-nowrap="false"][data-alignment="right"])': {
        '@container (min-width: 40rem)': 'calc((100% - var(--astryx-spacing-6)) / 2)',
      },
    },
    maxWidth: '36rem',
    minWidth: 0,
    justifySelf: {
      default: 'center',
      ':where([data-alignment="left"])': 'start',
      ':where([data-alignment="right"])': 'end',
    },
    order: {
      default: 0,
      ':where([data-orientation="below"],[data-orientation="intext"][data-alignment="right"])': 2,
    },
    float: {
      default: 'none',
      ':where([data-orientation="intext"][data-nowrap="false"][data-alignment="left"])': {
        '@container (min-width: 40rem)': 'left',
      },
      ':where([data-orientation="intext"][data-nowrap="false"][data-alignment="right"])': {
        '@container (min-width: 40rem)': 'right',
      },
    },
    marginBlockEnd: {
      default: 0,
      ':where([data-orientation="intext"][data-nowrap="false"])': {
        '@container (min-width: 40rem)': spacingTokens['--astryx-spacing-6'],
      },
    },
    marginInlineStart: {
      default: 0,
      ':where([data-orientation="intext"][data-nowrap="false"][data-alignment="right"])': {
        '@container (min-width: 40rem)': spacingTokens['--astryx-spacing-6'],
      },
    },
    marginInlineEnd: {
      default: 0,
      ':where([data-orientation="intext"][data-nowrap="false"][data-alignment="left"])': {
        '@container (min-width: 40rem)': spacingTokens['--astryx-spacing-6'],
      },
    },
  },
});

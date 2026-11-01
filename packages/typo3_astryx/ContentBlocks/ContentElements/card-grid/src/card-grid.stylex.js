import * as stylex from '@stylexjs/stylex';
import { spacingTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/spacing-tokens.stylex.js';

export const styles = stylex.create({
  root: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 16rem), 1fr))',
    gap: spacingTokens["--astryx-spacing-6"],
  },
  columns_auto: {},
  columns_two: {
    gridTemplateColumns: {
      default: 'repeat(auto-fit, minmax(min(100%, 16rem), 1fr))',
      '@container (min-width: 40rem)': 'repeat(2, minmax(0, 1fr))',
    },
  },
  columns_three: {
    gridTemplateColumns: {
      default: 'repeat(auto-fit, minmax(min(100%, 16rem), 1fr))',
      '@container (min-width: 54rem)': 'repeat(3, minmax(0, 1fr))',
    },
  },
  columns_four: {
    gridTemplateColumns: {
      default: 'repeat(auto-fit, minmax(min(100%, 16rem), 1fr))',
      '@container (min-width: 68rem)': 'repeat(4, minmax(0, 1fr))',
    },
  },
  gap_normal: {},
  gap_small: {gap: spacingTokens["--astryx-spacing-3"]},
  gap_large: {gap: spacingTokens["--astryx-spacing-8"]},
});

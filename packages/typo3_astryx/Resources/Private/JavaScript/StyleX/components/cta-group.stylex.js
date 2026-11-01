import * as stylex from '@stylexjs/stylex';
import { spacingTokens } from '../tokens/spacing-tokens.stylex.js';

export const styles = stylex.create({
  root: {
    display: 'flex',
    gap: spacingTokens['--astryx-spacing-4'],
    flexWrap: 'wrap',
    marginBlockStart: spacingTokens['--astryx-spacing-6'],
  },
  align_start: {justifyContent: 'start'},
  align_center: {justifyContent: 'center'},
  align_end: {justifyContent: 'end'},
});

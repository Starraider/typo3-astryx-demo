import * as stylex from '@stylexjs/stylex';

import { colorTokens } from '../tokens/color-tokens.stylex.js';
import { spacingTokens } from '../tokens/spacing-tokens.stylex.js';
import { typographyTokens } from '../tokens/typography-tokens.stylex.js';

export const styles = stylex.create({
  root: {
    marginBlock: 0,
    marginBlockEnd: spacingTokens['--astryx-spacing-2'],
    color: colorTokens['--astryx-color-text-secondary'],
    fontSize: typographyTokens['--astryx-typography-body-font-size'],
    fontWeight: 400,
    lineHeight: typographyTokens['--astryx-typography-body-line-height'],
  },
  align_start: { textAlign: 'start' },
  align_center: { textAlign: 'center' },
  align_end: { textAlign: 'end' },
  align_left: { textAlign: 'left' },
  align_right: { textAlign: 'right' },
});

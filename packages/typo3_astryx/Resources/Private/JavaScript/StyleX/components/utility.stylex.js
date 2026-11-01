import * as stylex from '@stylexjs/stylex';

import { spacingTokens } from '../tokens/spacing-tokens.stylex.js';

export const styles = stylex.create({
  root: {},
  part_root: {},
  part_visually_hidden: {
    position: 'absolute',
    inlineSize: 1,
    blockSize: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    border: 0,
  },
  part_button_label: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minInlineSize: 0,
  },
  part_status: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingTokens['--astryx-spacing-2'],
  },
  part_card_media: { marginBlockEnd: spacingTokens['--astryx-spacing-4'] },
  part_badge_heading_gap: {
    ':has(+ :is(h1, h2, h3, h4, h5, h6))': { marginBlockEnd: spacingTokens['--astryx-spacing-3'] },
  },
});

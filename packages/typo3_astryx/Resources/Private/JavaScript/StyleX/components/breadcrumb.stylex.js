import * as stylex from '@stylexjs/stylex';

import { colorTokens } from '../tokens/color-tokens.stylex.js';
import { spacingTokens } from '../tokens/spacing-tokens.stylex.js';
import { typographyTokens } from '../tokens/typography-tokens.stylex.js';

export const styles = stylex.create({
  root: {},
  part_root: { marginBlockStart: spacingTokens['--astryx-spacing-4'] },
  part_list: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacingTokens['--astryx-spacing-1'],
    listStyleType: 'none',
    padding: 0,
    margin: 0,
  },
  part_item: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingTokens['--astryx-spacing-1'],
    minInlineSize: 0,
    fontSize: typographyTokens['--astryx-typography-label-font-size'],
    fontWeight: 400,
    lineHeight: typographyTokens['--astryx-typography-label-line-height'],
  },
  part_link: {
    display: 'flex',
    alignItems: 'center',
    minInlineSize: 0,
    paddingBlock: spacingTokens['--astryx-spacing-1'],
    color: colorTokens['--astryx-color-text-secondary'],
    overflowWrap: 'anywhere',
    textDecoration: 'none',
    ':hover': { textDecoration: 'underline' },
  },
  part_separator: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    paddingBlock: spacingTokens['--astryx-spacing-1'],
    color: colorTokens['--astryx-color-text-secondary'],
    userSelect: 'none',
  },
  part_current: {
    display: 'flex',
    alignItems: 'center',
    minInlineSize: 0,
    paddingBlock: spacingTokens['--astryx-spacing-1'],
    color: colorTokens['--astryx-color-text-primary'],
    fontWeight: 600,
    overflowWrap: 'anywhere',
  },
});

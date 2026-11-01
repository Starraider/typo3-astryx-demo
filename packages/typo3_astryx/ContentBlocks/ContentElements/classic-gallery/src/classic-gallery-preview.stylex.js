import * as stylex from '@stylexjs/stylex';
import { shapeTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/shape-tokens.stylex.js';
import { spacingTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/spacing-tokens.stylex.js';

export const styles = stylex.create({
  root: {boxSizing: 'border-box'},
  part_list: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(8rem, 1fr))',
    gap: spacingTokens['--astryx-spacing-4'],
    listStyle: 'none',
    padding: 0,
  },
  part_item: {
    display: 'grid',
    alignContent: 'start',
    gap: spacingTokens['--astryx-spacing-1'],
    minWidth: 0,
  },
  part_image: {
    width: '100%',
    aspectRatio: '3 / 2',
    objectFit: 'cover',
    borderRadius: shapeTokens['--astryx-shape-radius-container'],
  },
});

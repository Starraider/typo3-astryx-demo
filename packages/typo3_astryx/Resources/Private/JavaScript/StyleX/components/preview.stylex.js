import * as stylex from '@stylexjs/stylex';
import { colorTokens } from '../tokens/color-tokens.stylex.js';
import { shapeTokens } from '../tokens/shape-tokens.stylex.js';
import { spacingTokens } from '../tokens/spacing-tokens.stylex.js';

export const styles = stylex.create({
  root: {boxSizing: 'border-box'},
  part_root: {
    padding: spacingTokens['--astryx-spacing-4'],
    backgroundColor: colorTokens['--astryx-color-background-surface'],
    borderRadius: shapeTokens['--astryx-shape-radius-container'],
  },
  part_image: {maxHeight: '12rem', objectFit: 'contain'},
});

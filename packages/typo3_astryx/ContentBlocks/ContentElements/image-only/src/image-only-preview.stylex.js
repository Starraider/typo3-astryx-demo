import * as stylex from '@stylexjs/stylex';
import { colorTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/color-tokens.stylex.js';
import { shapeTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/shape-tokens.stylex.js';
import { spacingTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/spacing-tokens.stylex.js';
import { typographyTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/typography-tokens.stylex.js';

export const styles = stylex.create({
  root: {boxSizing: 'border-box'},
  part_root: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(3, minmax(0, 1fr))',
      ':where([data-columns="one"])': 'repeat(1, minmax(0, 1fr))',
      ':where([data-columns="two"])': 'repeat(2, minmax(0, 1fr))',
      ':where([data-columns="four"])': 'repeat(4, minmax(0, 1fr))',
      ':where([data-columns="five"])': 'repeat(5, minmax(0, 1fr))',
      ':where([data-columns="six"])': 'repeat(6, minmax(0, 1fr))',
    },
    gap: spacingTokens['--astryx-spacing-4'],
    alignItems: 'start',
  },
  part_figure: {margin: 0, minWidth: 0},
  part_image: {
    display: 'block',
    width: '100%',
    height: 'auto',
    maxHeight: 'none',
    objectFit: 'cover',
    borderRadius: shapeTokens['--astryx-shape-radius-element'],
    aspectRatio: {
      default: 'auto',
      ':where([data-aspect="landscape"])': '4 / 3',
      ':where([data-aspect="wide"])': '16 / 9',
      ':where([data-aspect="square"])': '1',
    },
  },
  part_caption: {
    overflowWrap: 'anywhere',
    color: colorTokens['--astryx-color-text-secondary'],
    fontSize: typographyTokens['--astryx-typography-supporting-font-size'],
  },
});

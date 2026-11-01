import * as stylex from '@stylexjs/stylex';
import { colorTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/color-tokens.stylex.js';
import { spacingTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/spacing-tokens.stylex.js';

export const styles = stylex.create({
  root: {boxSizing: 'border-box'},
  part_root: {
    color: colorTokens['--astryx-color-text-primary'],
    outlineWidth: 1,
    outlineStyle: 'solid',
    outlineColor: colorTokens['--astryx-color-border-default'],
    outlineOffset: -1,
    backgroundColor: {
      default: 'color-mix(in srgb, var(--astryx-color-background-surface) 92%, white)',
      ':where([data-astryx-background="dark"])': 'color-mix(in srgb, var(--astryx-color-background-surface) 92%, black)',
    },
  },
  part_image: {
    display: 'block',
    width: '100%',
    maxHeight: '8rem',
    objectFit: 'cover',
    marginBlockStart: spacingTokens['--astryx-spacing-2'],
  },
});

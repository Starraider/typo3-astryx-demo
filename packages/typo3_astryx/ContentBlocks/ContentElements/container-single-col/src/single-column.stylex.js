import * as stylex from '@stylexjs/stylex';

import { colorTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/color-tokens.stylex.js';
import { spacingTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/spacing-tokens.stylex.js';
export const styles = stylex.create({
  root: {
    position: 'relative',
    isolation: 'isolate',
    minWidth: 0,
    outlineColor: colorTokens["--astryx-color-border-default"],
    outlineStyle: 'solid',
    outlineWidth: 1,
    outlineOffset: -1,
    color: colorTokens["--astryx-color-text-primary"],
    paddingBlock: spacingTokens["--astryx-spacing-6"],
    paddingInline: spacingTokens["--astryx-spacing-6"],
  },
  background_light: {
    backgroundColor: 'color-mix(in srgb, var(--astryx-color-background-surface) 92%, white)',
  },
  background_dark: {
    backgroundColor: 'color-mix(in srgb, var(--astryx-color-background-surface) 92%, black)',
  },
  width_constrained: {},
  width_full_bleed: {
    paddingInline: 0,
    width: 'var(--single-column-bleed-width, var(--single-column-viewport-width, 100vw))',
    marginInlineStart: 'var(--single-column-bleed-offset, calc((100% - var(--single-column-viewport-width, 100vw)) / 2))',
    marginInlineEnd: 0,
  },
});

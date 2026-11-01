import * as stylex from '@stylexjs/stylex';
import { colorTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/color-tokens.stylex.js';
import { motionTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/motion-tokens.stylex.js';
import { shapeTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/shape-tokens.stylex.js';
import { spacingTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/spacing-tokens.stylex.js';
import { typographyTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/typography-tokens.stylex.js';

export const styles = stylex.create({
  part_root: {boxSizing: 'border-box'},
  root: {
    display: 'grid',
    gap: spacingTokens['--astryx-spacing-4'],
    padding: 'calc(var(--astryx-spacing-3) - 1px)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorTokens['--astryx-color-border-default'],
    borderRadius: shapeTokens['--astryx-shape-radius-container'],
    backgroundColor: colorTokens['--astryx-color-background-surface'],
    ':where([data-mode="single"])': {
      gap: spacingTokens['--astryx-spacing-2'],
      padding: 0,
      borderWidth: 0,
      borderRadius: 0,
      backgroundColor: 'transparent',
    },
  },
  part_item: {
    minWidth: 0,
    ':where([data-mode="single"])': {
      padding: 'calc(var(--astryx-spacing-3) - 1px)',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: colorTokens['--astryx-color-border-default'],
      borderRadius: shapeTokens['--astryx-shape-radius-container'],
      backgroundColor: colorTokens['--astryx-color-background-surface'],
    },
    ':where([data-animating])': {overflow: 'hidden'},
  },
  part_trigger: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacingTokens['--astryx-spacing-2'],
    listStyle: 'none',
    cursor: 'pointer',
    color: colorTokens['--astryx-color-text-primary'],
    fontSize: typographyTokens['--astryx-typography-label-font-size'],
    fontWeight: 600,
    lineHeight: typographyTokens['--astryx-typography-label-line-height'],
    '::-webkit-details-marker': {display: 'none'},
  },
  part_label: {minWidth: 0, overflowWrap: 'anywhere'},
  part_chevron: {
    display: 'grid',
    placeItems: 'center',
    flex: `0 0 var(--astryx-typography-body-font-size)`,
    width: typographyTokens['--astryx-typography-body-font-size'],
    height: typographyTokens['--astryx-typography-body-font-size'],
    color: colorTokens['--astryx-color-text-secondary'],
    transition: `transform ${motionTokens['--astryx-motion-duration-fast']} ${motionTokens['--astryx-motion-easing-standard']}`,
    '::before': {
      content: '""',
      width: 7,
      height: 7,
      borderInlineEndWidth: 1.5,
      borderInlineEndStyle: 'solid',
      borderBlockEndWidth: 1.5,
      borderBlockEndStyle: 'solid',
      transform: 'translateY(-2px) rotate(45deg)',
    },
    ':where([data-expanded="true"])': {transform: 'rotate(180deg)'},
    ':where([data-expanded="false"])': {transform: 'none'},
    '@media (prefers-reduced-motion: reduce)': {transition: 'none'},
  },
  part_content: {
    paddingBlockStart: spacingTokens['--astryx-spacing-1'],
    color: colorTokens['--astryx-color-text-secondary'],
    fontSize: typographyTokens['--astryx-typography-label-font-size'],
    lineHeight: typographyTokens['--astryx-typography-label-line-height'],
  },
});

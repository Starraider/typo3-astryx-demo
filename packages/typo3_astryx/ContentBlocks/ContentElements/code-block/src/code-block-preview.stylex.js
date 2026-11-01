import * as stylex from '@stylexjs/stylex';
import { colorTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/color-tokens.stylex.js';
import { codeTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/components/code-tokens.stylex.js';
import { shapeTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/shape-tokens.stylex.js';
import { spacingTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/spacing-tokens.stylex.js';
import { typographyTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/typography-tokens.stylex.js';

export const styles = stylex.create({
  root: {boxSizing: 'border-box'},
  part_pre: {
    margin: 0,
    maxHeight: '12rem',
    overflow: 'auto',
    padding: spacingTokens['--astryx-spacing-3'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorTokens['--astryx-color-border-default'],
    borderRadius: shapeTokens['--astryx-shape-radius-element'],
    backgroundColor: colorTokens['--astryx-color-background-surface'],
    fontFamily: typographyTokens['--astryx-typography-font-family-code'],
    fontSize: codeTokens['--astryx-component-code-preview-font-size'],
    lineHeight: codeTokens['--astryx-component-code-preview-line-height'],
    whiteSpace: 'pre',
  },
  part_code: {font: 'inherit'},
});

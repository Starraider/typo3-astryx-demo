import * as stylex from '@stylexjs/stylex';
import { spacingTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/spacing-tokens.stylex.js';

export const styles = stylex.create({
  root: {boxSizing: 'border-box'},
  part_icon: {display: 'flex', alignItems: 'center', gap: spacingTokens['--astryx-spacing-2']},
});

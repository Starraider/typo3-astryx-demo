import * as stylex from '@stylexjs/stylex';
import { spacingTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/spacing-tokens.stylex.js';
export const styles = stylex.create({
  root: {display: 'flex', alignItems: 'center', gap: spacingTokens["--astryx-spacing-2"], width: '100%', maxWidth: '100%', marginBlock: spacingTokens["--astryx-spacing-4"]},
  position_bottom_center: {justifyContent: 'center'},
  position_top_left: {justifyContent: 'left'},
  position_top_center: {justifyContent: 'center'},
  position_top_right: {justifyContent: 'right'},
  position_bottom_left: {justifyContent: 'left'},
  position_bottom_right: {justifyContent: 'right'},
});

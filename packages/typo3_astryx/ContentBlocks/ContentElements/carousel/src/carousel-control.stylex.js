import * as stylex from '@stylexjs/stylex';
import { colorTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/color-tokens.stylex.js';
import { shapeTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/shape-tokens.stylex.js';
export const styles = stylex.create({
  root: {display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, height: 44, padding: 0, borderWidth: 0, borderStyle: 'solid', borderRadius: shapeTokens["--astryx-shape-radius-element"], backgroundColor: 'transparent', cursor: 'pointer', color: colorTokens["--astryx-color-text-primary"], ':disabled': {opacity: 0.35, cursor: 'default'}},
  kind_dot: {width: 24, '--carousel-dot-color': {default: colorTokens["--astryx-color-text-secondary"], ':is([aria-current="page"], :hover, :focus-visible)': colorTokens["--astryx-color-text-primary"]}},
  kind_arrow: {width: 44},
});

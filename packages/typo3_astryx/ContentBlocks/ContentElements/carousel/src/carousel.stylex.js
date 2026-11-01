import * as stylex from '@stylexjs/stylex';
import { spacingTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/spacing-tokens.stylex.js';

export const styles = stylex.create({
  root: {},
  part_root: {display: 'flex', flexDirection: 'column', minWidth: 0},
  part_track: {
    display: 'flex',
    gap: spacingTokens["--astryx-spacing-6"],
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    padding: 0,
    paddingBlockEnd: spacingTokens["--astryx-spacing-4"],
    margin: 0,
    listStyle: 'none',
    maskImage: {
      default: 'none',
      ':where([data-edge-fade="1"])': 'linear-gradient(to right, transparent, #000 1rem, #000 calc(100% - 1rem), transparent)',
    },
  },
  part_slide: {flex: '0 0 min(85%, 22rem)', scrollSnapAlign: 'start'},
  part_dots: {display: 'flex', flexWrap: 'wrap', justifyContent: 'center', minWidth: 0},
  part_status: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
});

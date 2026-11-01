import * as stylex from '@stylexjs/stylex';
import { colorTokens } from '../tokens/color-tokens.stylex.js';
import { shapeTokens } from '../tokens/shape-tokens.stylex.js';
import { spacingTokens } from '../tokens/spacing-tokens.stylex.js';
import { typographyTokens } from '../tokens/typography-tokens.stylex.js';

export const styles = stylex.create({
  root: {},
  part_figure: {margin: 0, minWidth: 0},
  part_image: {
    display: 'block',
    width: '100%',
    height: 'auto',
    objectFit: 'cover',
    borderRadius: shapeTokens["--astryx-shape-radius-element"],
    position: {default: 'static', ':where([data-hero-layout="overlay"])': 'absolute'},
    inset: {default: 'auto', ':where([data-hero-layout="overlay"])': 0},
    zIndex: {default: 'auto', ':where([data-hero-layout="overlay"])': -1},
    height: {default: 'auto', ':where([data-hero-layout="overlay"])': '100%'},
  },
  aspect_original: {},
  aspect_wide: {aspectRatio: '16 / 9'},
  aspect_landscape: {aspectRatio: '4 / 3'},
  aspect_square: {aspectRatio: '1'},
  part_caption: {
    color: colorTokens["--astryx-color-text-secondary"],
    paddingBlock: spacingTokens["--astryx-spacing-2"],
    fontSize: typographyTokens["--astryx-typography-supporting-font-size"],
    lineHeight: typographyTokens["--astryx-typography-supporting-line-height"],
    overflowWrap: 'anywhere',
    position: {default: 'static', ':where([data-hero-layout="overlay"])': 'relative'},
    backgroundColor: {default: 'transparent', ':where([data-hero-layout="overlay"])': 'rgb(255 255 255 / 46%)'},
    padding: {default: 0, ':where([data-hero-layout="overlay"])': 'var(--astryx-spacing-3) var(--astryx-spacing-4)'},
    borderRadius: {default: 0, ':where([data-hero-layout="overlay"])': shapeTokens["--astryx-shape-radius-element"]},
    maxWidth: {default: 'none', ':where([data-hero-layout="overlay"])': '42rem'},
    '--astryx-color-text-secondary': {default: null, ':where([data-hero-layout="overlay"])': '#000'},
  },
});

// Adapted from Astryx TreeList 0.6.7. See THIRD_PARTY_NOTICES.md.
import * as stylex from '@stylexjs/stylex';
import { colorTokens } from '../tokens/color-tokens.stylex.js';
import { shapeTokens } from '../tokens/shape-tokens.stylex.js';
import { spacingTokens } from '../tokens/spacing-tokens.stylex.js';
import { motionTokens } from '../tokens/motion-tokens.stylex.js';
import { typographyTokens } from '../tokens/typography-tokens.stylex.js';
export const styles = stylex.create({
  root: {
    position: 'relative',
    minWidth: 0,
    '--tree-list-indent': spacingTokens["--astryx-spacing-4"],
    ':has([data-tree-toggle])': {'--tree-list-leaf-inset': 28},
  },
  part_item: {
    position: 'relative',
    margin: 0,
    padding: 0,
    listStyle: 'none',
    outlineStyle: 'none',
    ':focus-visible': {
      outlineColor: colorTokens["--astryx-color-accent"],
      outlineStyle: 'solid',
      outlineWidth: 2,
      outlineOffset: 2,
    },
  },
  part_list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  part_group: {
    position: 'relative',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    marginInlineStart: 'var(--tree-list-indent)',
    '::before': {
      content: '""',
      position: 'absolute',
      insetBlock: 1,
      insetInlineStart: 3,
      borderInlineStartWidth: 1,
      borderInlineStartStyle: 'solid',
      borderInlineStartColor: colorTokens["--astryx-color-border-strong"],
      pointerEvents: 'none',
      '@media (forced-colors: active)': {borderInlineStartColor: 'CanvasText'},
    },
    ':where([data-tree-root])::before': {content: 'none'},
  },
  part_row: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
    minHeight: 36,
    marginBlock: 1,
    paddingInlineEnd: 8,
    paddingInlineStart: {
      default: 8,
      ':not(:has(> [data-tree-toggle]))': 'calc(8px + var(--tree-list-leaf-inset, 0px))',
      ':has(> [data-tree-toggle][hidden])': 36,
    },
    borderRadius: shapeTokens["--astryx-shape-radius-element"],
    fontFamily: typographyTokens["--astryx-typography-font-family-body"],
    fontSize: typographyTokens["--astryx-typography-body-font-size"],
    lineHeight: typographyTokens["--astryx-typography-body-line-height"],
    color: colorTokens["--astryx-color-text-primary"],
    backgroundColor: {
      default: 'transparent',
      ':hover': colorTokens["--astryx-color-navigation-state-hover"],
      ':active': colorTokens["--astryx-color-navigation-state-pressed"],
      ':has(> [aria-current="page"])': {
        default: colorTokens["--astryx-color-navigation-state-selected"],
        '@media (forced-colors: active)': 'Highlight',
      },
    },
  },
  part_link: {
    display: 'block',
    flexGrow: 1,
    minWidth: 0,
    paddingBlock: 8,
    color: {
      default: colorTokens["--astryx-color-text-primary"],
      ':is([aria-current="page"])': {
        default: null,
        '@media (forced-colors: active)': 'HighlightText',
      },
    },
    textDecoration: 'none',
    overflowWrap: 'anywhere',
    fontWeight: {default: 400, ':is([aria-current="page"])': 500},
  },
  part_toggle: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 36,
    padding: 0,
    borderWidth: 0,
    borderRadius: 4,
    backgroundColor: 'transparent',
    cursor: 'pointer',
  },
  part_chevron: {
    transitionProperty: 'transform',
    transitionDuration: motionTokens["--astryx-motion-duration-fast"],
    transitionTimingFunction: motionTokens["--astryx-motion-easing-standard"],
    ':where([data-expanded="true"])': {transform: 'rotate(90deg)'},
    ':where([data-expanded="false"]):dir(rtl)': {transform: 'scaleX(-1)'},
    '@media (prefers-reduced-motion: reduce)': {transition: 'none'},
  },
});

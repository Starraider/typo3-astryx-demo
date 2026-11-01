// Adapted from Astryx SideNav / NavItem 0.6.7. See THIRD_PARTY_NOTICES.md.
import * as stylex from '@stylexjs/stylex';
import { colorTokens } from '../tokens/color-tokens.stylex.js';
import { typographyTokens } from '../tokens/typography-tokens.stylex.js';
export const styles = stylex.create({
  root: {
    boxSizing: 'border-box',
    width: '100%',
    minWidth: 0,
  },
  part_list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  part_item: {
    display: 'flex',
    alignItems: 'center',
    minHeight: 32,
    paddingBlock: 6,
    paddingInline: 8,
    borderRadius: 10,
    fontFamily: typographyTokens["--astryx-typography-font-family-body"],
    fontSize: typographyTokens["--astryx-typography-label-font-size"],
    lineHeight: typographyTokens["--astryx-typography-label-line-height"],
    fontWeight: {
      default: 400,
      ':is([aria-current="page"],[data-active="true"])': 500,
    },
    color: {
      default: colorTokens["--astryx-color-text-primary"],
      ':is([aria-current="page"],[data-active="true"])': {
        default: null,
        '@media (forced-colors: active)': 'HighlightText',
      },
    },
    textAlign: 'start',
    textDecoration: 'none',
    overflowWrap: 'anywhere',
    backgroundColor: {
      default: 'transparent',
      ':hover:where(:not(:active,[aria-current="page"],[data-active="true"]))': {
        default: null,
        '@media (hover: hover)': colorTokens["--astryx-color-navigation-state-hover"],
      },
      ':active': colorTokens["--astryx-color-navigation-state-pressed"],
      ':is([aria-current="page"],[data-active="true"])': {
        default: colorTokens["--astryx-color-navigation-state-selected"],
        '@media (forced-colors: active)': 'Highlight',
      },
      ':is([aria-current="page"],[data-active="true"]):is(:hover,:active)': {
        default: colorTokens["--astryx-color-navigation-state-selected"],
        '@media (forced-colors: active)': 'Highlight',
      },
    },
  },
});

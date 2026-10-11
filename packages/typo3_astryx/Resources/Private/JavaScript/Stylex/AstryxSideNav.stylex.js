// Adapted from Astryx SideNav / NavItem 0.6.7. See THIRD_PARTY_NOTICES.md.
import * as stylex from '@stylexjs/stylex';
import {tokens} from './tokens.stylex.js';

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
    fontFamily: "var(--astryx-font)",
    fontSize: 'var(--astryx-font-size-label)',
    lineHeight: 'var(--astryx-line-label)',
    fontWeight: {
      default: 400,
      ':is([aria-current="page"],[data-active="true"])': 500,
    },
    color: {
      default: 'var(--astryx-text)',
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
        '@media (hover: hover)': 'var(--astryx-nav-hover)',
      },
      ':active': 'var(--astryx-nav-pressed)',
      ':is([aria-current="page"],[data-active="true"])': {
        default: 'var(--astryx-nav-selected)',
        '@media (forced-colors: active)': 'Highlight',
      },
      ':is([aria-current="page"],[data-active="true"]):is(:hover,:active)': {
        default: 'var(--astryx-nav-selected)',
        '@media (forced-colors: active)': 'Highlight',
      },
    },
  },
});

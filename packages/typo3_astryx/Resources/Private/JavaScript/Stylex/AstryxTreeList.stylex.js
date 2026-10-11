// Adapted from Astryx TreeList 0.6.7. See THIRD_PARTY_NOTICES.md.
import * as stylex from '@stylexjs/stylex';
import {tokens} from './tokens.stylex.js';

export const styles = stylex.create({
  root: {
    position: 'relative',
    minWidth: 0,
    '--astryx-tree-indent': 'var(--astryx-space-4)',
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
    marginInlineStart: 'var(--astryx-tree-indent)',
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
      ':not(:has(> [data-tree-toggle]))': 'calc(8px + var(--astryx-tree-leaf-inset, 0px))',
      ':has(> [data-tree-toggle][hidden])': 36,
    },
    borderRadius: 'var(--astryx-radius-element)',
    fontFamily: "var(--astryx-font)",
    fontSize: 'var(--astryx-font-size-body)',
    lineHeight: 'var(--astryx-line-body)',
    color: 'var(--astryx-text)',
    backgroundColor: {
      default: 'transparent',
      ':hover': 'var(--astryx-nav-hover)',
      ':active': 'var(--astryx-nav-pressed)',
      ':has(> [aria-current="page"])': {
        default: 'var(--astryx-nav-selected)',
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
      default: 'var(--astryx-text)',
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
});

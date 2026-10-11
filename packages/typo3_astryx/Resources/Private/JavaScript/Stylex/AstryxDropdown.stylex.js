// Visual adaptation of Astryx DropdownMenu 0.6.8. Navigation remains native links/disclosures.
import * as stylex from '@stylexjs/stylex';

export const styles = stylex.create({
  root: {boxSizing: 'border-box'},
  part_panel: {
    padding: 4,
    borderWidth: 0,
    borderRadius: 'var(--astryx-radius-container)',
    backgroundColor: 'var(--astryx-popover)',
    boxShadow: 'var(--astryx-popover-shadow), inset 0 0 0 1px var(--astryx-border)',
  },
  part_row: {
    marginBlock: 2,
    borderRadius: 'var(--astryx-radius-element)',
    backgroundColor: {
      default: 'transparent',
      ':is(:hover,:focus-within,:has(> details[open]))': 'var(--astryx-nav-hover)',
      ':is(.astryx-menu-item--active)': 'var(--astryx-nav-selected)',
    },
  },
  part_link: {
    minHeight: {default: 44, '@media (min-width: 60rem)': 32},
    paddingBlock: {default: 10, '@media (min-width: 60rem)': 6},
    paddingInline: 8,
    fontSize: 'var(--astryx-font-size-label)',
    lineHeight: 'var(--astryx-line-label)',
    fontWeight: {default: 400, ':is([aria-current="page"],[aria-current="true"])': 600},
    color: 'var(--astryx-text)',
    backgroundColor: {
      default: 'transparent',
      ':hover': 'transparent',
      ':is([aria-current="page"],[aria-current="true"])': 'var(--astryx-nav-selected)',
    },
  },
  part_toggle: {
    minWidth: 28,
    minHeight: {default: 44, '@media (min-width: 60rem)': 32},
    paddingBlock: 6,
    paddingInline: 8,
    backgroundColor: {default: 'transparent', ':hover': 'transparent'},
  },
});

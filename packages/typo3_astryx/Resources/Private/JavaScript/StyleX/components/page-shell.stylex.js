import * as stylex from '@stylexjs/stylex';

import { colorTokens } from '../tokens/color-tokens.stylex.js';
import { headerTokens } from '../tokens/components/header-tokens.stylex.js';
import { layoutTokens } from '../tokens/layout-tokens.stylex.js';
import { shapeTokens } from '../tokens/shape-tokens.stylex.js';
import { spacingTokens } from '../tokens/spacing-tokens.stylex.js';
import { typographyTokens } from '../tokens/typography-tokens.stylex.js';

export const styles = stylex.create({
  root: {},
  part_root: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    minBlockSize: '100vh',
    backgroundColor: colorTokens['--astryx-color-background-body'],
    color: colorTokens['--astryx-color-text-primary'],
    fontFamily: typographyTokens['--astryx-typography-font-family-body'],
    fontSize: typographyTokens['--astryx-typography-label-font-size'],
    lineHeight: typographyTokens['--astryx-typography-label-line-height'],
  },
  part_main: {
    flex: 1,
    inlineSize: '100%',
  },
  part_width: {
    inlineSize: 'min(calc(100% - 2rem), var(--astryx-layout-content-max-width))',
    marginInline: 'auto',
  },
  part_header: {
    paddingBlock: spacingTokens['--astryx-spacing-4'],
    borderBlockEndWidth: 1,
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: colorTokens['--astryx-color-border-default'],
    backgroundColor: colorTokens['--astryx-color-background-surface'],
    boxShadow: headerTokens['--astryx-component-header-shadow'],
    '@media (max-width: 59.99rem)': { paddingBlock: spacingTokens['--astryx-spacing-3'] },
  },
  part_pinned_header: { position: 'sticky', insetBlockStart: 0, zIndex: 30 },
  part_footer: {
    paddingBlock: spacingTokens['--astryx-spacing-4'],
    borderBlockStartWidth: 1,
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: colorTokens['--astryx-color-border-default'],
    backgroundColor: colorTokens['--astryx-color-background-surface'],
  },
  part_pinned_footer: { position: 'sticky', insetBlockEnd: 0, zIndex: 10 },
  part_header_inner: {
    display: 'flex',
    alignItems: 'center',
    gap: 'clamp(.75rem, 2vw, 2rem)',
    minBlockSize: 48,
    '@media (max-width: 59.99rem)': { flexWrap: 'wrap', gap: spacingTokens['--astryx-spacing-2'] },
  },
  part_logo: {
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    fontWeight: 600,
    textDecoration: 'none',
    '@media (max-width: 59.99rem)': {
      maxInlineSize: 'calc(100% - 14rem)',
      overflowWrap: 'anywhere',
    },
  },
  part_logo_image: {
    inlineSize: 'auto',
    blockSize: 48,
    maxInlineSize: 192,
    objectFit: 'contain',
    '@media (max-width: 59.99rem)': { maxInlineSize: '100%', blockSize: 40 },
  },
  part_stage: { paddingBlock: spacingTokens['--astryx-spacing-8'] },
  part_element: { containerType: 'inline-size' },
  part_regions: {
    paddingBlock: spacingTokens['--astryx-spacing-8'],
    minInlineSize: 0,
  },
  part_sidebar_regions: {
    display: 'grid',
    gap: spacingTokens['--astryx-spacing-8'],
    '@media (min-width: 60rem)': {
      gridTemplateColumns: 'minmax(0, 1fr) minmax(14rem, ' + layoutTokens['--astryx-layout-detail-width'] + ')',
    },
  },
  part_app_regions: {
    display: 'grid',
    gap: spacingTokens['--astryx-spacing-8'],
    '@media (min-width: 60rem)': {
      gridTemplateColumns: layoutTokens['--astryx-layout-navigation-width'] + ' minmax(0, 1fr)',
    },
    '@media (min-width: 90rem)': {
      gridTemplateColumns: layoutTokens['--astryx-layout-navigation-width'] + ' minmax(0, 1fr) ' + layoutTokens['--astryx-layout-detail-width'],
    },
  },
  part_region_child: { minInlineSize: 0 },
  part_detail: {
    padding: spacingTokens['--astryx-spacing-6'],
    borderRadius: shapeTokens['--astryx-shape-radius-container'],
    backgroundColor: colorTokens['--astryx-color-background-surface'],
  },
  part_skip: {
    position: 'fixed',
    insetBlockStart: spacingTokens['--astryx-spacing-2'],
    insetInlineStart: spacingTokens['--astryx-spacing-2'],
    zIndex: 100,
    padding: spacingTokens['--astryx-spacing-4'],
    backgroundColor: colorTokens['--astryx-color-background-surface'],
    transform: 'translateY(-200%)',
    ':focus': { transform: 'none' },
  },
  part_header_actions: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingTokens['--astryx-spacing-2'],
    flexShrink: 0,
  },
});

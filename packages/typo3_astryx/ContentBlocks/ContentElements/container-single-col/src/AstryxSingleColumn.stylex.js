import * as stylex from '@stylexjs/stylex';

export const styles = stylex.create({
  root: {
    position: 'relative',
    isolation: 'isolate',
    minWidth: 0,
    outlineColor: 'var(--astryx-border)',
    outlineStyle: 'solid',
    outlineWidth: 1,
    outlineOffset: -1,
    color: 'var(--astryx-text)',
    paddingBlock: 'var(--astryx-space-6)',
    paddingInline: 'var(--astryx-space-6)',
  },
  background_light: {
    backgroundColor: 'color-mix(in srgb, var(--astryx-surface) 92%, white)',
  },
  background_dark: {
    backgroundColor: 'color-mix(in srgb, var(--astryx-surface) 92%, black)',
  },
  width_constrained: {},
  width_full_bleed: {
    paddingInline: 0,
    width: 'var(--astryx-single-bleed-width, var(--astryx-single-viewport-width, 100vw))',
    marginInlineStart: 'var(--astryx-single-bleed-offset, calc((100% - var(--astryx-single-viewport-width, 100vw)) / 2))',
    marginInlineEnd: 0,
  },
});

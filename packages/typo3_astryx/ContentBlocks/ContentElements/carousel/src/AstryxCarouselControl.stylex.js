import * as stylex from '@stylexjs/stylex';
export const styles = stylex.create({
  root: {display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, height: 44, padding: 0, borderWidth: 0, borderStyle: 'solid', borderRadius: 'var(--astryx-radius-element)', backgroundColor: 'transparent', cursor: 'pointer', color: 'var(--astryx-text)'},
  kind_dot: {width: 24},
  kind_arrow: {width: 44},
});

import * as stylex from '@stylexjs/stylex';
export const styles = stylex.create({
  root: {display: 'flex', alignItems: 'center', gap: 'var(--astryx-space-2)', width: '100%', maxWidth: '100%', marginBlock: 'var(--astryx-space-4)'},
  position_bottom_center: {justifyContent: 'center'},
  position_top_left: {justifyContent: 'left'},
  position_top_center: {justifyContent: 'center'},
  position_top_right: {justifyContent: 'right'},
  position_bottom_left: {justifyContent: 'left'},
  position_bottom_right: {justifyContent: 'right'},
});

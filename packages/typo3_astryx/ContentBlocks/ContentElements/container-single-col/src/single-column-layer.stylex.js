import * as stylex from '@stylexjs/stylex';

export const styles = stylex.create({
  root: {boxSizing: 'border-box'},
  part_content: {position: 'relative', minWidth: 0},
  part_background: {
    position: 'absolute',
    inset: 0,
    zIndex: -1,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  part_image: {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

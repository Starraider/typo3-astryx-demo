import * as stylex from '@stylexjs/stylex';

export const styles = stylex.create({
  "root": {
    "display": "grid",
    "gap": "var(--astryx-space-4)",
    "alignItems": "start",
    "minWidth": 0
  },
  "columns_three": {
    "gridTemplateColumns": "repeat(3, minmax(0, 1fr))"
  },
  "columns_one": {
    "gridTemplateColumns": "repeat(1, minmax(0, 1fr))"
  },
  "columns_two": {
    "gridTemplateColumns": "repeat(2, minmax(0, 1fr))"
  },
  "columns_four": {
    "gridTemplateColumns": "repeat(4, minmax(0, 1fr))"
  },
  "columns_five": {
    "gridTemplateColumns": "repeat(5, minmax(0, 1fr))"
  },
  "columns_six": {
    "gridTemplateColumns": "repeat(6, minmax(0, 1fr))"
  }
});

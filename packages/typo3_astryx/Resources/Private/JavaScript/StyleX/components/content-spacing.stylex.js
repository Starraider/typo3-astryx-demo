import * as stylex from '@stylexjs/stylex';
import { spacingTokens } from '../tokens/spacing-tokens.stylex.js';

export const styles = stylex.create({
  root: {},
  before_extra_small: {marginBlockStart: spacingTokens["--astryx-spacing-0-5"]},
  before_small: {marginBlockStart: spacingTokens["--astryx-spacing-1"]},
  before_medium: {marginBlockStart: spacingTokens["--astryx-spacing-2"]},
  before_large: {marginBlockStart: spacingTokens["--astryx-spacing-4"]},
  before_extra_large: {marginBlockStart: spacingTokens["--astryx-spacing-6"]},
  after_extra_small: {marginBlockEnd: spacingTokens["--astryx-spacing-0-5"]},
  after_small: {marginBlockEnd: spacingTokens["--astryx-spacing-1"]},
  after_medium: {marginBlockEnd: spacingTokens["--astryx-spacing-2"]},
  after_large: {marginBlockEnd: spacingTokens["--astryx-spacing-4"]},
  after_extra_large: {marginBlockEnd: spacingTokens["--astryx-spacing-6"]},
});

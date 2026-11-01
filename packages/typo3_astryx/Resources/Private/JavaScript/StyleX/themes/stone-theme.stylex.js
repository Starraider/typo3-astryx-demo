import * as stylex from '@stylexjs/stylex';
import { colorTokens } from '../tokens/color-tokens.stylex.js';
import { categoryColorTokens } from '../tokens/category-color-tokens.stylex.js';
import { codeColorTokens } from '../tokens/code-color-tokens.stylex.js';
import { typographyTokens } from '../tokens/typography-tokens.stylex.js';
import { spacingTokens } from '../tokens/spacing-tokens.stylex.js';
import { layoutTokens } from '../tokens/layout-tokens.stylex.js';
import { shapeTokens } from '../tokens/shape-tokens.stylex.js';
import { shadowTokens } from '../tokens/shadow-tokens.stylex.js';
import { motionTokens } from '../tokens/motion-tokens.stylex.js';
import { buttonTokens } from '../tokens/components/button-tokens.stylex.js';
import { badgeTokens } from '../tokens/components/badge-tokens.stylex.js';
import { noticeTokens } from '../tokens/components/notice-tokens.stylex.js';
import { cardTokens } from '../tokens/components/card-tokens.stylex.js';
import { headerTokens } from '../tokens/components/header-tokens.stylex.js';
import { popoverTokens } from '../tokens/components/popover-tokens.stylex.js';
import { codeTokens } from '../tokens/components/code-tokens.stylex.js';

export const colorTheme = stylex.createTheme(colorTokens, {
  "--astryx-color-accent": "light-dark(#25252a, #f3f3f5)",
  "--astryx-color-accent-subtle": "light-dark(#25252a14, #f3f3f520)",
  "--astryx-color-background-body": "light-dark(#f3f3f5, #111015)",
  "--astryx-color-background-card": "light-dark(#FFFFFF, #242325)",
  "--astryx-color-background-inverse": "light-dark(#25252a, #f3f3f5)",
  "--astryx-color-background-muted": "light-dark(#e2e2e8, #3b3b3f)",
  "--astryx-color-background-popover": "light-dark(#ffffff, #25252a)",
  "--astryx-color-background-skeleton": "light-dark(#d4d4da, #5e5e64)",
  "--astryx-color-background-surface": "light-dark(#ffffff, #1b1b1f)",
  "--astryx-color-border-card": "var(--astryx-color-border-default)",
  "--astryx-color-border-default": "light-dark(#e2e2e8, #f3f3f51a)",
  "--astryx-color-border-strong": "light-dark(#83838a, #5e5e61)",
  "--astryx-color-icon-accent": "light-dark(#25252a, #f3f3f5)",
  "--astryx-color-icon-disabled": "light-dark(#d7d7da, #5e5e61)",
  "--astryx-color-icon-primary": "light-dark(#25252a, #f3f3f5)",
  "--astryx-color-icon-secondary": "light-dark(#83838a, #9d9da3)",
  "--astryx-color-navigation-header-state-hover": "var(--astryx-color-navigation-state-hover)",
  "--astryx-color-navigation-header-state-selected": "var(--astryx-color-navigation-state-selected)",
  "--astryx-color-navigation-state-hover": "light-dark(#25252a0d, #f3f3f50d)",
  "--astryx-color-navigation-state-pressed": "light-dark(#25252a1a, #f3f3f51a)",
  "--astryx-color-navigation-state-selected": "light-dark(#25252a0f, #f3f3f51a)",
  "--astryx-color-on-accent": "light-dark(#ffffff, #25252a)",
  "--astryx-color-on-dark": "#FFFFFF",
  "--astryx-color-on-light": "light-dark(#25252a, #28282a)",
  "--astryx-color-on-status-error": "light-dark(#58413e, #f9dcd7)",
  "--astryx-color-on-status-success": "light-dark(#374c36, #d0e9ce)",
  "--astryx-color-on-status-warning": "light-dark(#524622, #f4e1b7)",
  "--astryx-color-overlay-scrim": "light-dark(#25252a80, #28282acc)",
  "--astryx-color-state-tint-hover": "light-dark(black, white)",
  "--astryx-color-status-error": "light-dark(#58413e, #dcc0bc)",
  "--astryx-color-status-error-subtle": "light-dark(#f9dcd7, #dcc0bc)",
  "--astryx-color-status-success": "light-dark(#374c36, #b4cdb2)",
  "--astryx-color-status-success-subtle": "light-dark(#d0e9ce, #b4cdb2)",
  "--astryx-color-status-warning": "light-dark(#524622, #d7c59c)",
  "--astryx-color-status-warning-subtle": "light-dark(#f4e1b7, #d7c59c)",
  "--astryx-color-text-accent": "light-dark(#25252a, #f3f3f5)",
  "--astryx-color-text-disabled": "light-dark(#d7d7da, #5e5e61)",
  "--astryx-color-text-link": "light-dark(#25252a, #f3f3f5)",
  "--astryx-color-text-primary": "light-dark(#25252a, #f3f3f5)",
  "--astryx-color-text-secondary": "light-dark(#5e5e63, #ababb0)",
});

export const categoryColorTheme = stylex.createTheme(categoryColorTokens, {
  "--astryx-color-category-blue-background": "light-dark(#d7e4f5, #485362)",
  "--astryx-color-category-blue-border": "light-dark(#c9d6e7, #313c4a)",
  "--astryx-color-category-blue-icon": "light-dark(#3c4856, #d7e4f5)",
  "--astryx-color-category-blue-text": "light-dark(#3c4856, #d7e4f5)",
  "--astryx-color-category-cyan-background": "light-dark(#cce8e5, #3e5755)",
  "--astryx-color-category-cyan-border": "light-dark(#bedad7, #28403e)",
  "--astryx-color-category-cyan-icon": "light-dark(#334b49, #cce8e5)",
  "--astryx-color-category-cyan-text": "light-dark(#334b49, #cce8e5)",
  "--astryx-color-category-gray-background": "light-dark(#e2e2e8, #525257)",
  "--astryx-color-category-gray-border": "light-dark(#d4d4da, #3b3b3f)",
  "--astryx-color-category-gray-icon": "light-dark(#46464b, #e2e2e8)",
  "--astryx-color-category-gray-text": "light-dark(#46464b, #e2e2e8)",
  "--astryx-color-category-green-background": "light-dark(#d0e9ce, #425841)",
  "--astryx-color-category-green-border": "light-dark(#c2dbc0, #2b402b)",
  "--astryx-color-category-green-icon": "light-dark(#374c36, #d0e9ce)",
  "--astryx-color-category-green-text": "light-dark(#374c36, #d0e9ce)",
  "--astryx-color-category-orange-background": "light-dark(#ffdcbb, #684d32)",
  "--astryx-color-category-orange-border": "light-dark(#f1ceae, #4f361c)",
  "--astryx-color-category-orange-icon": "light-dark(#5b4227, #ffdcbb)",
  "--astryx-color-category-orange-text": "light-dark(#5b4227, #ffdcbb)",
  "--astryx-color-category-pink-background": "light-dark(#f0dde8, #5e4e57)",
  "--astryx-color-category-pink-border": "light-dark(#e2cfda, #463740)",
  "--astryx-color-category-pink-icon": "light-dark(#52424c, #f0dde8)",
  "--astryx-color-category-pink-text": "light-dark(#52424c, #f0dde8)",
  "--astryx-color-category-purple-background": "light-dark(#e8dff3, #564f60)",
  "--astryx-color-category-purple-border": "light-dark(#d9d1e5, #3f3949)",
  "--astryx-color-category-purple-icon": "light-dark(#4b4454, #e8dff3)",
  "--astryx-color-category-purple-text": "light-dark(#4b4454, #e8dff3)",
  "--astryx-color-category-red-background": "light-dark(#f9dcd7, #644d49)",
  "--astryx-color-category-red-border": "light-dark(#ebcec9, #4c3633)",
  "--astryx-color-category-red-icon": "light-dark(#58413e, #f9dcd7)",
  "--astryx-color-category-red-text": "light-dark(#58413e, #f9dcd7)",
  "--astryx-color-category-teal-background": "light-dark(#d4e7dc, #46564d)",
  "--astryx-color-category-teal-border": "light-dark(#c6d9ce, #303f36)",
  "--astryx-color-category-teal-icon": "light-dark(#3b4a41, #d4e7dc)",
  "--astryx-color-category-teal-text": "light-dark(#3b4a41, #d4e7dc)",
  "--astryx-color-category-yellow-background": "light-dark(#f4e1b7, #5e512d)",
  "--astryx-color-category-yellow-border": "light-dark(#e5d3a9, #463a18)",
  "--astryx-color-category-yellow-icon": "light-dark(#524622, #f4e1b7)",
  "--astryx-color-category-yellow-text": "light-dark(#524622, #f4e1b7)",
});

export const codeColorTheme = stylex.createTheme(codeColorTokens, {
  "--astryx-color-code-border": "var(--astryx-color-border-default)",
  "--astryx-color-code-header-background": "var(--astryx-color-background-muted)",
  "--astryx-color-code-surface": "var(--astryx-color-code-syntax-background)",
  "--astryx-color-code-syntax-attribute": "light-dark(#79693f, #b6aa90)",
  "--astryx-color-code-syntax-background": "light-dark(#f3f3f5, #171719)",
  "--astryx-color-code-syntax-comment": "light-dark(#5e5e5e, #ababb0)",
  "--astryx-color-code-syntax-constant": "light-dark(#755752, #bea792)",
  "--astryx-color-code-syntax-function": "light-dark(#506072, #99adc6)",
  "--astryx-color-code-syntax-keyword": "light-dark(#645a72, #b2a7c1)",
  "--astryx-color-code-syntax-number": "light-dark(#755752, #bea792)",
  "--astryx-color-code-syntax-operator": "light-dark(#5e5e5e, #ababb0)",
  "--astryx-color-code-syntax-property": "light-dark(#4e6357, #94b2a0)",
  "--astryx-color-code-syntax-punctuation": "light-dark(#5e5e5e, #ababb0)",
  "--astryx-color-code-syntax-string": "light-dark(#4e6357, #9bb19a)",
  "--astryx-color-code-syntax-tag": "light-dark(#775751, #c7a39d)",
  "--astryx-color-code-syntax-type": "light-dark(#645a72, #b2a7c1)",
  "--astryx-color-code-syntax-variable": "light-dark(#5e5e5e, #ababb0)",
  "--astryx-color-code-title": "var(--astryx-color-text-secondary)",
});

export const typographyTheme = stylex.createTheme(typographyTokens, {
  "--astryx-typography-body-font-size": "14px",
  "--astryx-typography-body-line-height": "1.4286",
  "--astryx-typography-display-font-size": "43px",
  "--astryx-typography-display-font-weight": "400",
  "--astryx-typography-display-line-height": "1.2093",
  "--astryx-typography-font-family-body": "Figtree, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif",
  "--astryx-typography-font-family-code": "\"JetBrains Mono\", \"SF Mono\", Monaco, Consolas, monospace",
  "--astryx-typography-font-family-heading": "Montserrat, \"Figtree\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif",
  "--astryx-typography-heading-1-font-size": "27px",
  "--astryx-typography-heading-1-font-weight": "400",
  "--astryx-typography-heading-1-line-height": "1.3333",
  "--astryx-typography-heading-2-font-size": "22px",
  "--astryx-typography-heading-2-font-weight": "400",
  "--astryx-typography-heading-2-line-height": "1.4545",
  "--astryx-typography-heading-3-font-size": "18px",
  "--astryx-typography-heading-3-font-weight": "400",
  "--astryx-typography-heading-3-line-height": "1.5556",
  "--astryx-typography-heading-4-font-size": "14px",
  "--astryx-typography-heading-4-font-weight": "400",
  "--astryx-typography-heading-4-line-height": "1.4286",
  "--astryx-typography-heading-5-font-size": "11px",
  "--astryx-typography-heading-5-font-weight": "400",
  "--astryx-typography-heading-5-line-height": "1.4545",
  "--astryx-typography-heading-6-font-size": "9px",
  "--astryx-typography-heading-6-font-weight": "400",
  "--astryx-typography-heading-6-line-height": "1.7778",
  "--astryx-typography-heading-large-font-size": "27px",
  "--astryx-typography-heading-large-line-height": "1.3333",
  "--astryx-typography-label-font-size": "14px",
  "--astryx-typography-label-line-height": "1.4286",
  "--astryx-typography-supporting-font-size": "12px",
  "--astryx-typography-supporting-line-height": "1.4545",
});

export const spacingTheme = stylex.createTheme(spacingTokens, {
  "--astryx-spacing-1": "4px",
  "--astryx-spacing-12": "48px",
  "--astryx-spacing-2": "8px",
  "--astryx-spacing-3": "12px",
  "--astryx-spacing-4": "16px",
  "--astryx-spacing-6": "24px",
  "--astryx-spacing-8": "32px",
});

export const layoutTheme = stylex.createTheme(layoutTokens, {
  "--astryx-layout-content-max-width": "72rem",
  "--astryx-layout-detail-width": "20rem",
  "--astryx-layout-navigation-width": "16rem",
  "--astryx-layout-prose-max-width": "68ch",
});

export const shapeTheme = stylex.createTheme(shapeTokens, {
  "--astryx-shape-radius-container": "0.75rem",
  "--astryx-shape-radius-element": "0.5rem",
  "--astryx-shape-radius-full": "9999px",
  "--astryx-shape-radius-inner": "0.25rem",
  "--astryx-shape-radius-none": "0px",
  "--astryx-shape-radius-page": "1.5rem",
});

export const shadowTheme = stylex.createTheme(shadowTokens, {
  "--astryx-effect-shadow-color": "light-dark(#25252a1a, #0000004d)",
  "--astryx-effect-shadow-default": "0 2px 4px #28282A0D, 0 4px 8px #28282A1A",
  "--astryx-effect-shadow-high": "0 4px 6px #28282A1A, 0 12px 24px #28282A26",
  "--astryx-effect-shadow-inset-error": "inset 0px 0px 0px 2px #83838a30",
  "--astryx-effect-shadow-inset-hover": "inset 0px 0px 0px 2px #28282A30",
  "--astryx-effect-shadow-inset-selected": "inset 0px 0px 0px 2px #28282A50",
  "--astryx-effect-shadow-inset-success": "inset 0px 0px 0px 2px #83838a30",
  "--astryx-effect-shadow-inset-warning": "inset 0px 0px 0px 2px #83838a30",
  "--astryx-effect-shadow-medium": "0 2px 4px #28282A0D, 0 4px 12px #28282A1A",
});

export const motionTheme = stylex.createTheme(motionTokens, {
  "--astryx-motion-duration-fast": "125ms",
  "--astryx-motion-easing-standard": "cubic-bezier(0.24, 1, 0.4, 1)",
});

export const buttonTheme = stylex.createTheme(buttonTokens, {
  "--astryx-component-button-border-width": "0px",
  "--astryx-component-button-radius": "9999px",
  "--astryx-component-button-size-large-font-size": "14px",
  "--astryx-component-button-size-large-height": "36px",
  "--astryx-component-button-size-large-min-height": "0px",
  "--astryx-component-button-size-large-padding": "8px 12px",
  "--astryx-component-button-size-medium-height": "32px",
  "--astryx-component-button-size-medium-min-height": "0px",
  "--astryx-component-button-size-medium-padding": "8px 12px",
  "--astryx-component-button-size-small-font-size": "14px",
  "--astryx-component-button-size-small-height": "28px",
  "--astryx-component-button-size-small-min-height": "0px",
  "--astryx-component-button-size-small-padding": "8px 12px",
  "--astryx-component-button-variant-destructive-background": "var(--astryx-color-category-red-background)",
  "--astryx-component-button-variant-destructive-foreground": "var(--astryx-color-category-red-text)",
  "--astryx-component-button-variant-secondary-background": "transparent",
  "--astryx-component-button-variant-secondary-background-hover": "var(--astryx-color-navigation-state-selected)",
  "--astryx-component-button-variant-secondary-border-color": "var(--astryx-color-border-strong)",
  "--astryx-component-button-variant-secondary-border-width": "1.5px",
});

export const badgeTheme = stylex.createTheme(badgeTokens, {
  "--astryx-component-badge-border-width": "0px",
  "--astryx-component-badge-line-height": "1.4545",
  "--astryx-component-badge-variant-accent-background": "var(--astryx-color-category-blue-background)",
  "--astryx-component-badge-variant-accent-border-color": "var(--astryx-color-category-blue-border)",
  "--astryx-component-badge-variant-accent-foreground": "var(--astryx-color-category-blue-text)",
  "--astryx-component-badge-variant-error-background": "var(--astryx-color-category-red-background)",
  "--astryx-component-badge-variant-error-border-color": "var(--astryx-color-category-red-border)",
  "--astryx-component-badge-variant-error-foreground": "var(--astryx-color-category-red-text)",
  "--astryx-component-badge-variant-neutral-background": "var(--astryx-color-category-gray-background)",
  "--astryx-component-badge-variant-neutral-border-color": "var(--astryx-color-category-gray-border)",
  "--astryx-component-badge-variant-neutral-foreground": "var(--astryx-color-category-gray-text)",
  "--astryx-component-badge-variant-success-background": "var(--astryx-color-category-green-background)",
  "--astryx-component-badge-variant-success-border-color": "var(--astryx-color-category-green-border)",
  "--astryx-component-badge-variant-success-foreground": "var(--astryx-color-category-green-text)",
  "--astryx-component-badge-variant-warning-background": "var(--astryx-color-category-yellow-background)",
  "--astryx-component-badge-variant-warning-border-color": "var(--astryx-color-category-yellow-border)",
  "--astryx-component-badge-variant-warning-foreground": "var(--astryx-color-category-yellow-text)",
});

export const noticeTheme = stylex.createTheme(noticeTokens, {
  "--astryx-component-notice-border-width": "0px",
  "--astryx-component-notice-padding": "12px",
  "--astryx-component-notice-variant-accent-background": "var(--astryx-color-category-blue-background)",
  "--astryx-component-notice-variant-accent-border-color": "var(--astryx-color-category-blue-border)",
  "--astryx-component-notice-variant-accent-foreground": "var(--astryx-color-category-blue-text)",
  "--astryx-component-notice-variant-accent-supporting-text-color": "var(--astryx-color-category-blue-text)",
  "--astryx-component-notice-variant-error-background": "var(--astryx-color-category-red-background)",
  "--astryx-component-notice-variant-error-border-color": "var(--astryx-color-category-red-border)",
  "--astryx-component-notice-variant-error-foreground": "var(--astryx-color-category-red-text)",
  "--astryx-component-notice-variant-error-supporting-text-color": "var(--astryx-color-category-red-text)",
  "--astryx-component-notice-variant-neutral-background": "var(--astryx-color-category-gray-background)",
  "--astryx-component-notice-variant-neutral-border-color": "var(--astryx-color-category-gray-border)",
  "--astryx-component-notice-variant-neutral-foreground": "var(--astryx-color-category-gray-text)",
  "--astryx-component-notice-variant-neutral-supporting-text-color": "var(--astryx-color-category-gray-text)",
  "--astryx-component-notice-variant-success-background": "var(--astryx-color-category-green-background)",
  "--astryx-component-notice-variant-success-border-color": "var(--astryx-color-category-green-border)",
  "--astryx-component-notice-variant-success-foreground": "var(--astryx-color-category-green-text)",
  "--astryx-component-notice-variant-success-supporting-text-color": "var(--astryx-color-category-green-text)",
  "--astryx-component-notice-variant-warning-background": "var(--astryx-color-category-yellow-background)",
  "--astryx-component-notice-variant-warning-border-color": "var(--astryx-color-category-yellow-border)",
  "--astryx-component-notice-variant-warning-foreground": "var(--astryx-color-category-yellow-text)",
  "--astryx-component-notice-variant-warning-supporting-text-color": "var(--astryx-color-category-yellow-text)",
});

export const cardTheme = stylex.createTheme(cardTokens, {
  "--astryx-component-card-padding": "12px",
});

export const headerTheme = stylex.createTheme(headerTokens, {
  "--astryx-component-header-shadow": "var(--astryx-effect-shadow-default)",
});

export const popoverTheme = stylex.createTheme(popoverTokens, {
  "--astryx-component-popover-shadow": "var(--astryx-effect-shadow-high)",
});

export const componentCodeTheme = stylex.createTheme(codeTokens, {
  "--astryx-component-code-preview-font-size": "14px",
  "--astryx-component-code-preview-line-height": "1.4286",
});

<?php
declare(strict_types=1);
namespace Skom\Typo3Astryx\ViewHelpers;
use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;
use Vendor\StylexConnector\Service\StylexManifestService;
/** Finite keys avoid accidental dynamic recipes or silent missing styles. */
final class RecipeViewHelper extends AbstractViewHelper
{
    private const RECIPES = [
        'Button' => ['variant' => ['primary', 'secondary', 'ghost', 'destructive'], 'size' => ['small', 'medium', 'large']],
        'Badge' => ['variant' => ['neutral', 'accent', 'success', 'warning', 'error']],
        'StatusDot' => ['variant' => ['neutral', 'accent', 'success', 'warning', 'error']],
        'Heading' => ['size' => ['medium', 'small', 'large', 'display'], 'align' => ['start', 'center', 'end', 'left', 'right'], 'spacing' => ['after', 'none']],
        'Text' => ['width' => ['prose', 'full'], 'density' => ['normal', 'compact'], 'align' => ['start', 'center', 'end']],
        'CtaGroup' => ['align' => ['start', 'center', 'end']],
        'PageShell' => ['part' => ['root', 'main', 'width', 'header', 'pinned-header', 'footer', 'pinned-footer', 'header-inner', 'logo', 'logo-image', 'stage', 'element', 'regions', 'sidebar-regions', 'app-regions', 'region-child', 'detail', 'skip', 'header-actions']],
        'Navigation' => ['part' => ['root', 'navigation', 'navigation-enhanced', 'main-menu', 'mobile-menu-enhanced', 'submenu', 'row', 'link', 'link-active', 'link-has-submenu', 'disclosure', 'mobile-disclosure', 'nested-disclosure', 'summary', 'toggle', 'submenu-toggle', 'header-control', 'mobile-toggle', 'mobile-toggle-enabled', 'dropdown-panel', 'nested-panel', 'flyout-panel', 'flyout-bridge', 'last-panel', 'dialog', 'dialog-header', 'dialog-menu', 'dialog-row', 'dialog-panel', 'chevron', 'theme-switcher', 'theme-icon', 'language-menu', 'language-toggle', 'language-panel', 'language-option', 'flag', 'flag-image', 'flag-bitmap', 'menu-icon', 'menu-icon-line']],
        'Breadcrumb' => ['part' => ['root', 'list', 'item', 'link', 'separator', 'current']],
        'Lead' => ['align' => ['start', 'center', 'end', 'left', 'right']],
        'Utility' => ['part' => ['root', 'visually-hidden', 'button-label', 'status', 'card-media', 'card-cta', 'badge-heading-gap']],
        'Hero' => ['part' => ['root', 'content']],
        'CodeBlock' => ['part' => ['root', 'header', 'title', 'copy', 'icon', 'icon-inverse', 'body', 'code', 'gutter', 'syntax-comment', 'syntax-keyword', 'syntax-constant', 'syntax-string', 'syntax-number', 'syntax-type', 'syntax-attribute', 'syntax-variable', 'syntax-function', 'syntax-tag', 'syntax-property', 'syntax-operator', 'syntax-punctuation', 'syntax-emphasis', 'syntax-strong']],
        'CodeBlockPreview' => ['part' => ['pre', 'code']],
        'ClassicGalleryPreview' => ['part' => ['list', 'item', 'image']],
        'ClassicGallery' => ['part' => ['gallery', 'header', 'intro', 'intro-text', 'filters', 'filter', 'tiles', 'tile', 'image', 'open', 'dialog', 'control', 'close', 'step', 'media', 'lightbox-image', 'caption', 'counter', 'icon']],
        'ImageOnlyPreview' => ['part' => ['root', 'figure', 'image', 'caption']],
        'NoticePreview' => ['part' => ['icon']],
        'Preview' => ['part' => ['root', 'image']],
        'SingleColumnPreview' => ['part' => ['root', 'image']],
        'Textmedia' => ['part' => ['root', 'media', 'text']],
        'Divider' => ['variant' => ['subtle', 'strong']],
        'Card' => ['variant' => ['outlined', 'elevated', 'flat'], 'padding' => ['normal', 'compact']],
        'Grid' => ['ratio' => ['50-50', '66-33', '33-66', '25-75', '75-25'], 'gap' => ['normal', 'small', 'large'], 'columns' => ['auto', 'two', 'three', 'four']],
        'GridCell' => [],
        'SingleColumn' => ['background' => ['light', 'dark'], 'width' => ['constrained', 'full-bleed']],
        'SingleColumnLayer' => ['part' => ['content', 'background', 'image']],
        'Notice' => ['variant' => ['neutral', 'accent', 'success', 'warning', 'error']],
        'CarouselPagination' => ['position' => ['bottom-center', 'top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-right']],
        'CarouselControl' => ['kind' => ['dot', 'arrow']],
        'CardGrid' => ['columns' => ['auto', 'two', 'three', 'four'], 'gap' => ['normal', 'small', 'large']],
        'Media' => ['part' => ['figure', 'image', 'caption'], 'aspect' => ['original', 'wide', 'landscape', 'square']],
        'ContentSpacing' => ['before' => ['medium', 'extra-small', 'small', 'large', 'extra-large'], 'after' => ['medium', 'extra-small', 'small', 'large', 'extra-large']],
        'Table' => [],
        'CarouselIndicator' => [],
        'Carousel' => ['part' => ['root', 'track', 'slide', 'dots', 'status']],
        'ImageOnly' => ['columns' => ['three', 'one', 'two', 'four', 'five', 'six']],
        'Accordion' => ['part' => ['root', 'item', 'trigger', 'label', 'chevron', 'content']],
        'Icon' => ['size' => ['small', 'medium', 'large']],
        'SideNav' => ['part' => ['list', 'item']],
        'TreeList' => ['part' => ['list', 'item', 'group', 'row', 'link', 'toggle', 'chevron']]
    ];
    public function __construct(private readonly StylexManifestService $manifest) {}
    public function initializeArguments(): void
    {
        $this->registerArgument('name', 'string', 'Recipe name', true);
        $this->registerArgument('options', 'array', 'Allowlisted recipe dimensions', false, []);
    }
    public function render(): string
    {
        $name = $this->arguments['name'];
        if (!isset(self::RECIPES[$name])) { throw new \InvalidArgumentException('Unknown Astryx recipe: ' . $name); }
        $module = strtolower((string)preg_replace('/(?<!^)[A-Z]/', '-$0', $name));
        $keys = [$module . '.root'];
        foreach (self::RECIPES[$name] as $dimension => $values) {
            $value = $this->arguments['options'][$dimension] ?? $values[0];
            $value = in_array($value, $values, true) ? $value : $values[0];
            $keys[] = $module . '.' . $dimension . '_' . str_replace('-', '_', $value);
        }
        return $this->manifest->getClasses(...$keys);
    }
}

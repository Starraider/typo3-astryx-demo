<?php
declare(strict_types=1);

use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Core\SystemEnvironmentBuilder;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\CMS\Core\Http\NormalizedParams;
use TYPO3\CMS\Core\Http\Uri;
use TYPO3\CMS\Core\Site\SiteFinder;
use TYPO3\CMS\Core\TypoScript\FrontendTypoScript;
use TYPO3\CMS\Core\TypoScript\AST\Node\RootNode;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Fluid\Core\Rendering\RenderingContextFactory;
use TYPO3Fluid\Fluid\View\TemplateView;

// Read-only regression checks against the installed component and block templates.
putenv('TYPO3_PATH_APP=' . getcwd());
putenv('TYPO3_PATH_ROOT=' . getcwd() . '/public');
$loader = require getcwd() . '/vendor/autoload.php';
SystemEnvironmentBuilder::run(0, SystemEnvironmentBuilder::REQUESTTYPE_CLI);
Bootstrap::init($loader);
$root = dirname(__DIR__, 2);
$factory = GeneralUtility::makeInstance(RenderingContextFactory::class);
$site = GeneralUtility::makeInstance(SiteFinder::class)->getSiteByPageId(1);
$typoScript = new FrontendTypoScript(new RootNode(), [], [], []);
$typoScript->setSetupTree(new RootNode());
$typoScript->setSetupArray([]);
$typoScript->setConfigArray([]);
$request = (new ServerRequest(new Uri('https://typo3-astryx.ddev.site/')))
    ->withAttribute('applicationType', SystemEnvironmentBuilder::REQUESTTYPE_FE)
    ->withAttribute('site', $site)->withAttribute('language', $site->getDefaultLanguage())
    ->withAttribute('frontend.typoscript', $typoScript);
$request = $request->withAttribute('normalizedParams', NormalizedParams::createFromRequest($request));
$render = static function (string $source, array $data = [], bool $preview = false) use ($factory, $root, $request): string {
    $context = $factory->create([], $request);
    $paths = $context->getTemplatePaths();
    $paths->setTemplateSource($source);
    $paths->setLayoutRootPaths([$root . '/Resources/Private/Layouts/ContentElements']);
    $paths->setPartialRootPaths([$root . '/Resources/Private/Partials']);
    $view = new TemplateView($context);
    $view->assign('data', $data);
    return $preview ? $view->renderSection('Content', ['data' => $data]) : $view->render();
};
$template = file_get_contents($root . '/ContentBlocks/ContentElements/notice/templates/frontend.fluid.html');
$preview = file_get_contents($root . '/ContentBlocks/ContentElements/notice/templates/backend-preview.fluid.html');
$base = ['uid' => 9500, 'header' => 'Notice <unsafe>', 'header_layout' => 2, 'heading_size' => 'medium', 'status' => 'warning', 'bodytext' => '', 'cta_link' => '', 'cta_label' => ''];
$field = array_replace_recursive($GLOBALS['TCA']['tt_content']['columns']['astryx_notice_icon']['config'], $GLOBALS['TCA']['tt_content']['types']['astryx_notice']['columnsOverrides']['astryx_notice_icon']['config'] ?? []);
if ($field['type'] !== 'select' || $field['renderType'] !== 'selectSingle' || array_column($field['items'], 'value') !== ['', 'check', 'warning', 'error', 'info']) {
    throw new RuntimeException('Notice picker must offer the four status icons and None: ' . json_encode($field));
}
$shapes = [];
foreach (['check', 'warning', 'error', 'info'] as $name) {
    $html = $render($template, ['icon' => $name] + $base);
    $document = new DOMDocument(); @$document->loadHTML('<?xml encoding="UTF-8">' . $html);
    $xpath = new DOMXPath($document);
    $svg = $xpath->query('//aside/span[@class="astryx-status"]/svg')->item(0);
    if (!$svg || $svg->getAttribute('aria-hidden') !== 'true' || $svg->getAttribute('focusable') !== 'false' || $svg->getAttribute('viewbox') !== '0 0 24 24') {
        throw new RuntimeException('Selected icon is missing or is not a decorative inline SVG: ' . $name);
    }
    if ($xpath->query('//aside/span[@class="astryx-status"]/span')->length !== 1 || !str_contains($html, 'Warning') || str_contains($html, '<unsafe>') || str_contains($html, '<script')) {
        throw new RuntimeException('Status label/escaping/no-JavaScript rendering regressed.');
    }
    $shape = '';
    foreach ($svg->childNodes as $child) {
        if ($child instanceof DOMElement) $shape .= $document->saveXML($child);
    }
    $shapes[$name] = $shape;
    $asset = new DOMDocument(); $asset->load($root . '/ContentBlocks/ContentElements/notice/assets/icons/' . $name . '.svg');
    // Compare geometric attributes instead of XML whitespace/namespace serialization.
    $geometry = static function (DOMNode $node): array {
        $result = [];
        foreach ($node->childNodes as $child) {
            if ($child instanceof DOMElement) {
                $attrs = [];
                foreach ($child->attributes as $attribute) $attrs[$attribute->name] = $attribute->value;
                $result[] = [$child->nodeName, $attrs];
            }
        }
        return $result;
    };
    if ($geometry($svg) !== $geometry($asset->documentElement)) throw new RuntimeException('Backend and frontend shapes differ: ' . $name);
    $previewHtml = $render($preview, ['icon' => $name] + $base, true);
    if (!str_contains($previewHtml, '<svg') || !str_contains($previewHtml, 'Warning')) throw new RuntimeException('Preview icon or status missing.');
}
if (count(array_unique($shapes)) !== 4) throw new RuntimeException('The four icons must have distinct geometry.');
$empty = $render($template, ['icon' => ''] + $base);
if (str_contains($empty, '<svg') || !str_contains($empty, 'astryx-status') || !str_contains($empty, 'Warning')) throw new RuntimeException('None must retain the status indicator.');
$unsafe = $render($template, ['icon' => '<script>alert(1)</script>'] + $base);
if (str_contains($unsafe, '<script') || !str_contains($unsafe, '<circle')) throw new RuntimeException('Unknown stored icons must safely fall back to Information.');
echo "Notice icon picker, four SVG shapes, preview parity, empty/unknown fallback and escaping passed.\n";

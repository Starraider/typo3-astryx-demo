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
$headings = static function (string $html): array {
    $document = new DOMDocument();
    @$document->loadHTML('<?xml encoding="UTF-8">' . $html);
    return array_map(static fn(DOMNode $node): array => [$node->nodeName, $node->textContent], iterator_to_array((new DOMXPath($document))->query('//article/*[self::h1 or self::h2 or self::h3 or self::h4 or self::h5 or self::h6]')));
};
$expect = static function (string $html, array $expected) use ($headings): void {
    if ($headings($html) !== $expected) throw new RuntimeException('Unexpected Card headings: ' . json_encode($headings($html)));
};
$expect($render('<astryx:card title="{data.title}" />', ['title' => 'Title & <em>text</em>']), [['h3', 'Title & <em>text</em>']]);
$expect($render('<astryx:card title="Title" level="4" />'), [['h4', 'Title']]);
$expect($render('<astryx:card />'), []);
$expect($render('<astryx:card title="Fallback"><f:fragment name="heading"><astryx:heading text="Override" level="2" /></f:fragment></astryx:card>'), [['h2', 'Override']]);
$expect($render('<astryx:card title="Fallback"><f:fragment name="heading" /></astryx:card>'), []);
$items = [];
foreach (['First card', 'Second & <em>card</em>', 'Third card'] as $title) {
    $items[] = ['title' => $title, 'body' => '', 'image' => [], 'badge' => '', 'link' => '', 'label' => ''];
}
$grid = $render(file_get_contents($root . '/ContentBlocks/ContentElements/card-grid/templates/frontend.fluid.html'), ['uid' => 9400, 'header' => '', 'header_layout' => 100, 'columns' => 'three', 'gap' => 'normal', 'items' => $items]);
$expect($grid, array_map(static fn(array $item): array => ['h3', $item['title']], $items));
if (str_contains($grid, '<em>')) throw new RuntimeException('Card title HTML was not escaped.');
$base = ['uid' => 9401, 'header' => '', 'header_layout' => 100, 'bodytext' => '', 'image' => [], 'assets' => [], 'badge' => '', 'variant' => 'outlined'];
$primary = ['cta_link' => 'https://example.org/primary', 'cta_label' => 'Primary & <em>action</em>'];
$secondary = ['secondary_link' => 'https://example.org/secondary _blank secondary-link "Secondary destination"', 'secondary_label' => 'Secondary & <em>action</em>'];
$native = '<astryx:card href="{data.cta_link}" label="{data.cta_label}" secondaryHref="{data.secondary_link}" secondaryLabel="{data.secondary_label}" />';
$partial = '<f:render partial="Astryx/Card" arguments="{href: data.cta_link, label: data.cta_label, secondaryHref: data.secondary_link, secondaryLabel: data.secondary_label}" />';
$block = file_get_contents($root . '/ContentBlocks/ContentElements/card/templates/frontend.fluid.html');
foreach ([$native, $partial, $block] as $source) {
    foreach ([[$primary + $secondary, 2], [$primary, 1], [$secondary, 1], [[], 0], [['secondary_link' => $secondary['secondary_link']], 0], [['secondary_label' => $secondary['secondary_label']], 0]] as [$actions, $count]) {
        $html = $render($source, $base + $actions);
        $document = new DOMDocument(); @$document->loadHTML('<?xml encoding="UTF-8">' . $html);
        $xpath = new DOMXPath($document);
        $buttons = $xpath->query('//article/div[contains(@class,"astryx-cta-group")]/a');
        if ($buttons->length !== $count || $xpath->query('//div[contains(@class,"astryx-cta-group")]')->length !== (int)($count > 0)) throw new RuntimeException('Missing CTA or empty action group.');
        if (str_contains($html, '<em>')) throw new RuntimeException('CTA label was not escaped.');
        $secondaryButton = $xpath->query('//a[@href="https://example.org/secondary"]')->item(0);
        if (isset($actions['secondary_link'], $actions['secondary_label']) && (!$secondaryButton || $secondaryButton->textContent !== $secondary['secondary_label'] || $secondaryButton->getAttribute('target') !== '_blank' || $secondaryButton->getAttribute('title') !== 'Secondary destination')) throw new RuntimeException('Lost secondary label or Typolink options.');
        if ($count === 2 && ($buttons->item(0)->textContent !== $primary['cta_label'] || $buttons->item(1)->textContent !== $secondary['secondary_label'])) throw new RuntimeException('Incorrect CTA order.');
    }
}
$preview = $render(file_get_contents($root . '/ContentBlocks/ContentElements/card/templates/backend-preview.fluid.html'), $base + $primary + $secondary, true);
foreach ([$primary['cta_label'], $secondary['secondary_label']] as $label) {
    if (!str_contains($preview, htmlspecialchars($label))) throw new RuntimeException('Missing CTA label in backend preview.');
}
echo "Cards: titles, escaping, heading slots, primary/secondary CTA combinations, scalar partial, block mapping, Typolink options and backend preview pass.\n";

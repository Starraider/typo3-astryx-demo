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

// Read-only: uses installed TCA, real record transformation and frontend templates.
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
$context = $factory->create([], $request);
$context->getTemplatePaths()->setTemplateSource('<astryx:treeList items="{items}" id="fixture-tree" /><astryx:treeList items="{items}" id="second-tree" /><astryx:treeList id="empty-tree" />');
$view = new TemplateView($context);
$view->assign('items', [
    ['link' => 'https://example.org/parent', 'title' => 'Parent & page', 'active' => true, 'children' => [
        ['link' => 'https://example.org/child', 'title' => 'Child', 'active' => true, 'children' => [
            ['link' => 'https://example.org/grandchild', 'title' => 'Grandchild', 'active' => true, 'children' => [
                ['link' => 'https://example.org/current', 'title' => 'Current page', 'current' => true, 'active' => true],
            ]],
            ['link' => 'https://example.org/sibling', 'title' => 'Sibling'],
        ]],
        ['link' => 'https://example.org/unsafe', 'title' => '<script>unsafe</script> Other', 'target' => '_blank'],
    ]],
    ['link' => 'https://example.org/closed', 'title' => 'Closed branch', 'children' => [
        ['link' => 'https://example.org/hidden', 'title' => 'Hidden descendant'],
    ]],
    ['link' => 'https://example.org/long', 'title' => str_repeat('Long page title ', 12)],
]);
$html = $view->render();
$dom = new DOMDocument();
@$dom->loadHTML('<?xml encoding="UTF-8">' . $html);
$x = new DOMXPath($dom);
$trees = $x->query('//nav[@data-astryx-tree-list]');
if ($trees->length !== 2) throw new RuntimeException('Empty trees must not render a landmark.');
if ($x->query('//nav[1]//a')->length !== 9 || $x->query('//nav[1]//ul/ul')->length) throw new RuntimeException('Nested page lists lost.');
if ($x->query('//a[@id="' . $trees->item(0)->getAttribute('id') . '-0-0-0-0-label"]/ancestor::ul')->length !== 4) throw new RuntimeException('Four-level recursion failed.');
$ids = [];
foreach ($x->query('//*[@id]') as $node) {
    $id = $node->getAttribute('id');
    if (isset($ids[$id])) throw new RuntimeException('Duplicate component/branch identifier.');
    $ids[$id] = $node;
}
foreach ($x->query('//button') as $button) {
    if (!$button->hasAttribute('hidden') || $button->getAttribute('aria-expanded') !== 'true') throw new RuntimeException('No-JavaScript disclosure fallback lost.');
    if (!isset($ids[$button->getAttribute('aria-controls')]) || $ids[$button->getAttribute('aria-controls')]->hasAttribute('hidden')) throw new RuntimeException('Child lists must be available before enhancement.');
    if (!str_contains($button->getAttribute('aria-label'), 'pages for')) throw new RuntimeException('Translated disclosure label missing.');
}
if ($x->query('//a[@aria-current="page"]')->length !== 2) throw new RuntimeException('Current page semantics lost.');
if ($x->query('//a[@target="_blank"]')->item(0)->getAttribute('href') !== 'https://example.org/unsafe') throw new RuntimeException('TYPO3 link target/destination lost.');
if ($x->query('//script')->length || $x->query('//a[@target="_blank"]')->item(0)->textContent !== '<script>unsafe</script> Other') throw new RuntimeException('Page title escaping failed.');
if (in_array('--html', $argv, true)) echo $html;
else echo "Sitemap: recursive native Fluid, multiple/empty trees, branch IDs, translations, current state, targets and escaped titles passed.\n";

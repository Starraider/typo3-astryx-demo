<?php
declare(strict_types=1);

use Symfony\Component\Yaml\Yaml;
use TYPO3\CMS\ContentBlocks\DataProcessing\ContentBlocksDataProcessor;
use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Core\SystemEnvironmentBuilder;
use TYPO3\CMS\Core\Domain\RecordFactory;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\CMS\Core\Http\NormalizedParams;
use TYPO3\CMS\Core\Http\Uri;
use TYPO3\CMS\Core\Site\SiteFinder;
use TYPO3\CMS\Core\TypoScript\FrontendTypoScript;
use TYPO3\CMS\Core\TypoScript\AST\Node\RootNode;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Fluid\Core\Rendering\RenderingContextFactory;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;
use TYPO3Fluid\Fluid\View\TemplateView;

// Read-only: uses installed TCA, real record transformation and frontend templates.
putenv('TYPO3_PATH_APP=' . getcwd());
putenv('TYPO3_PATH_ROOT=' . getcwd() . '/public');
$loader = require getcwd() . '/vendor/autoload.php';
SystemEnvironmentBuilder::run(0, SystemEnvironmentBuilder::REQUESTTYPE_CLI);
Bootstrap::init($loader);
$root = dirname(__DIR__, 2);
$tca = $GLOBALS['TCA']['tt_content'];
$position = $tca['columns']['header_position']['config'];
if ($position['type'] !== 'select' || $position['renderType'] !== 'selectSingle'
    || $position['default'] !== '' || array_column($position['items'], 'value') !== ['', 'left', 'center', 'right']) {
    throw new RuntimeException('Expected the four core alignment choices in editor order.');
}
if ($tca['columns']['header_link']['config']['type'] !== 'link') throw new RuntimeException('Expected the core link browser.');
$types = ['menu_sitemap' => 'Menu', 'menu_subpages' => 'Subpages', 'menu_pages' => 'Subpages', 'shortcut' => 'Shortcut', 'html' => 'Html'];
foreach (glob($root . '/ContentBlocks/ContentElements/*/config.yaml') as $path) {
    $definition = Yaml::parseFile($path);
    $types[$definition['typeName']] = dirname($path) . '/templates/frontend.fluid.html';
}
foreach ($types as $type => $template) {
    $fields = preg_replace_callback('/--palette--;[^,;]*;([^,]+)/', static fn(array $match): string => $tca['palettes'][$match[1]]['showitem'], $tca['types'][$type]['showitem']);
    foreach (['header', 'header_layout', 'header_position', 'header_link'] as $field) {
        if (substr_count(',' . $fields . ',', ',' . $field . ',') !== 1) throw new RuntimeException('Missing or duplicate ' . $field . ' in ' . $type);
    }
}
$factory = GeneralUtility::makeInstance(RenderingContextFactory::class);
$records = GeneralUtility::makeInstance(RecordFactory::class);
$processor = GeneralUtility::makeInstance(ContentBlocksDataProcessor::class);
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
$defaults = array_map(static fn(array $column): mixed => $column['config']['default'] ?? '', $tca['columns']);
$defaults = array_replace($defaults, ['t3ver_wsid' => 0, 't3ver_oid' => 0, 't3ver_state' => 0, 't3ver_stage' => 0, 'crdate' => 0, 'tstamp' => 0, 'deleted' => 0, 'sorting' => 0]);
$uid = 9000;
$render = static function (string $type, string $position, string $link, int $level = 2, string $text = 'Heading & title') use ($types, $root, $factory, $records, $processor, $defaults, $request, &$uid): string {
    $row = array_replace($defaults, ['uid' => ++$uid, 'pid' => 1, 'CType' => $type, 'header' => $text, 'subheader' => 'Supporting text', 'header_layout' => $level, 'header_position' => $position, 'header_link' => $link]);
    $cObj = GeneralUtility::makeInstance(ContentObjectRenderer::class);
    $cObj->setRequest($request);
    $cObj->start($row, 'tt_content');
    $data = str_starts_with($type, 'astryx_') ? $processor->process($cObj, [], [], ['data' => $row])['data'] : $records->createResolvedRecordFromDatabaseRow('tt_content', $row);
    $context = $factory->create([], $request);
    $paths = $context->getTemplatePaths();
    $paths->setTemplatePathAndFilename(str_starts_with($type, 'astryx_') ? $types[$type] : $root . '/Resources/Private/Templates/ContentElements/' . $types[$type] . '.html');
    $paths->setLayoutRootPaths([$root . '/Resources/Private/Layouts/ContentElements']);
    $paths->setPartialRootPaths([$root . '/Resources/Private/Partials']);
    $view = new TemplateView($context);
    $view->assignMultiple(['data' => $data, 'content' => '<p>Body</p>', 'safeHtml' => '<p>HTML</p>', 'shortcuts' => '<p>Shortcut</p>', 'menu' => []]);
    return $view->render();
};
$html = '';
foreach ($types as $type => $template) {
    foreach (['', 'left', 'center', 'right'] as $position) {
        foreach (['', 'https://example.org/heading _blank heading-custom "Heading destination"'] as $link) {
            $rendered = $render($type, $position, $link);
            $document = new DOMDocument();
            @$document->loadHTML('<?xml encoding="UTF-8">' . $rendered);
            $xpath = new DOMXPath($document);
            $heading = $xpath->query('//h2[contains(@class,"astryx-heading")]');
            if ($heading->length !== 1 || $heading->item(0)->textContent !== 'Heading & title') throw new RuntimeException('Missing or duplicated heading: ' . $type);
            $anchors = $xpath->query('//h2/a');
            if ($anchors->length !== (int)(bool)$link) throw new RuntimeException('Incorrect heading link: ' . $type);
            if ($link && ($anchors->item(0)->getAttribute('href') !== 'https://example.org/heading' || $anchors->item(0)->getAttribute('target') !== '_blank' || $anchors->item(0)->getAttribute('title') !== 'Heading destination')) throw new RuntimeException('Lost Typolink options: ' . $type);
            $html .= '<section data-test-type="' . $type . '" data-test-align="' . ($position ?: 'left') . '" data-test-linked="' . (int)(bool)$link . '">' . $rendered . '</section>';
        }
    }
    if (str_contains($render($type, 'right', 'https://example.org', 100), 'astryx-heading ')) throw new RuntimeException('Hidden heading rendered: ' . $type);
    if (str_contains($render($type, '', '', 2, ''), 'astryx-heading ')) throw new RuntimeException('Empty heading rendered: ' . $type);
}
foreach ([1,2,3,4,5,6,0] as $level) {
    $rendered = $render('astryx_heading', 'center', 'mailto:editor@example.org', $level, '<script>alert(1)</script> & title');
    if (!str_contains($rendered, '<h' . ($level ?: 2)) || str_contains($rendered, '<script>') || !str_contains($rendered, 'href="mailto:editor@example.org"')) throw new RuntimeException('Heading level/link/escaping failed.');
}
foreach (['t3://page?uid=1', 't3://url?url=https%3A%2F%2Fexample.org%2Fheading', 'mailto:editor@example.org'] as $link) {
    $rendered = $render('astryx_heading', 'left', $link);
    $document = new DOMDocument();
    @$document->loadHTML($rendered);
    $anchors = (new DOMXPath($document))->query('//h2/a[@href]');
    if ($anchors->length !== 1) throw new RuntimeException('TYPO3 link did not resolve: ' . $link);
}
$renderNative = static function (string $source, array $arguments = []) use ($factory, $root, $request): string {
    $context = $factory->create([], $request);
    $context->getTemplatePaths()->setTemplateSource($source);
    $context->getTemplatePaths()->setPartialRootPaths([$root . '/Resources/Private/Partials']);
    $view = new TemplateView($context);
    $view->assignMultiple($arguments);
    return $view->render();
};
$nativeCases = [
    'default' => ['<astryx:heading />', [], []],
    'empty-text' => ['<astryx:heading text="" />', [], []],
    'whitespace-text' => ['<astryx:heading text="{text}" />', ['text' => " \t\n\r "], []],
    'empty-slot' => ['<astryx:heading><f:fragment /></astryx:heading>', [], []],
    'whitespace-slot' => ["<astryx:heading> \t\n </astryx:heading>", [], []],
    'empty-runtime-slot' => ['<astryx:heading><f:if condition="{show}">Hidden</f:if></astryx:heading>', ['show' => false], []],
    'empty-linked' => ['<astryx:heading link="https://example.org" />', [], []],
    'subtitle-only' => ['<astryx:heading subtitle="Supporting text" />', [], []],
    'escaped-text' => ['<astryx:heading text="{text}" />', ['text' => '<script>alert(1)</script> & title'], [['h2', '<script>alert(1)</script> & title']]],
    'slot-markup' => ['<astryx:heading level="3"><em>Slot &amp; title</em></astryx:heading>', [], [['h3', 'Slot & title']]],
    'combined' => ['<astryx:heading text="Title"><em> and slot</em></astryx:heading>', [], [['h2', 'Title and slot']]],
    'linked-slot' => ['<astryx:heading text="Title" level="5" link="{link}"><em> and slot</em></astryx:heading>', ['link' => 'https://example.org/heading _blank heading-custom "Heading destination"'], [['h5', 'Title and slot']]],
    'text-empty-slot' => ['<astryx:heading text="Title"><f:fragment /></astryx:heading>', [], [['h2', 'Title']]],
    'slot-escaping' => ['<astryx:heading>{text}</astryx:heading>', ['text' => '<script>alert(1)</script> & slot'], [['h2', '<script>alert(1)</script> & slot']]],
    'zero-text' => ['<astryx:heading text="0" />', [], [['h2', '0']]],
    'zero-slot' => ['<astryx:heading>0</astryx:heading>', [], [['h2', '0']]],
    'partial-empty' => ['<f:render partial="Astryx/Heading" />', [], []],
    'partial-whitespace' => ['<f:render partial="Astryx/Heading" arguments="{text: text}" />', ['text' => " \t\n "], []],
    'partial-text' => ['<f:render partial="Astryx/Heading" arguments="{text: text, level: 4}" />', ['text' => 'Bridge & title'], [['h4', 'Bridge & title']]],
];
foreach ([1, 2, 3, 4, 5, 6, 99] as $level) {
    $nativeCases['level-' . $level] = ['<astryx:heading text="Title" level="{level}" />', ['level' => $level], [['h' . ($level === 99 ? 2 : $level), 'Title']]];
    $nativeCases['empty-level-' . $level] = ['<astryx:heading level="{level}" />', ['level' => $level], []];
}
foreach ($nativeCases as $name => [$source, $arguments, $expected]) {
    $rendered = $renderNative($source, $arguments);
    $document = new DOMDocument();
    @$document->loadHTML('<?xml encoding="UTF-8"><main>' . $rendered . '</main>');
    $xpath = new DOMXPath($document);
    $headings = array_map(static fn(DOMNode $node): array => [$node->nodeName, $node->textContent], iterator_to_array($xpath->query('//h1|//h2|//h3|//h4|//h5|//h6')));
    if ($headings !== $expected || $xpath->query('//script')->length !== 0) throw new RuntimeException('Native heading regression: ' . $name);
    if ($expected === [] && $xpath->query('//a')->length !== 0) throw new RuntimeException('Empty heading left a link: ' . $name);
    if ($name === 'subtitle-only' && $xpath->query('//p')->item(0)?->textContent !== 'Supporting text') throw new RuntimeException('Independent subtitle was lost.');
    if (in_array($name, ['slot-markup', 'combined'], true) && $xpath->query('//h2/em|//h3/em')->length !== 1) throw new RuntimeException('Slot markup was escaped or duplicated.');
    if ($name === 'linked-slot') {
        $anchor = $xpath->query('//h5/a')->item(0);
        if (!$anchor instanceof DOMElement || $anchor->getAttribute('href') !== 'https://example.org/heading' || $anchor->getAttribute('target') !== '_blank' || $anchor->getAttribute('title') !== 'Heading destination' || $xpath->query('//h5/a/em')->length !== 1) throw new RuntimeException('Linked slot lost markup or Typolink options.');
    }
    $html .= '<section data-native-heading-case="' . $name . '" data-native-heading-count="' . count($expected) . '">' . $rendered . '</section>';
}
echo in_array('--html', $argv, true) ? $html : 'Headings: ' . count($types) . ' CTypes and ' . count($nativeCases) . " native/partial cases; alignments, links, hidden/empty/whitespace output, slots, levels and escaping pass.\n";

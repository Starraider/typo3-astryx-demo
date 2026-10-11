<?php
declare(strict_types=1);

use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Core\SystemEnvironmentBuilder;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Http\NormalizedParams;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\CMS\Core\Http\Uri;
use TYPO3\CMS\Core\Resource\FileReference;
use TYPO3\CMS\Core\Resource\ResourceFactory;
use TYPO3\CMS\Core\Site\SiteFinder;
use TYPO3\CMS\Core\TypoScript\AST\Node\RootNode;
use TYPO3\CMS\Core\TypoScript\FrontendTypoScript;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Fluid\Core\Rendering\RenderingContextFactory;
use TYPO3Fluid\Fluid\View\TemplateView;

// Read-only real Fluid/FAL fixture. Metadata overrides exist only in memory.
putenv('TYPO3_PATH_APP=' . getcwd());
putenv('TYPO3_PATH_ROOT=' . getcwd() . '/public');
$loader = require getcwd() . '/vendor/autoload.php';
SystemEnvironmentBuilder::run(0, SystemEnvironmentBuilder::REQUESTTYPE_CLI);
Bootstrap::init($loader);
$root = dirname(__DIR__, 2);
$factory = GeneralUtility::makeInstance(RenderingContextFactory::class);
$site = GeneralUtility::makeInstance(SiteFinder::class)->getSiteByPageId(1);
$ts = new FrontendTypoScript(new RootNode(), [], [], []);
$ts->setSetupTree(new RootNode());
// Exercise f:format.html's parseFunc path with the fixture's limited rich-text vocabulary.
$ts->setSetupArray(['lib.' => ['parseFunc_RTE.' => ['allowTags' => 'p,a,small,strong,em,code']]]);
$ts->setConfigArray([]);
$request = (new ServerRequest(new Uri('https://typo3-astryx.ddev.site/')))
    ->withAttribute('applicationType', SystemEnvironmentBuilder::REQUESTTYPE_FE)
    ->withAttribute('site', $site)->withAttribute('language', $site->getDefaultLanguage())
    ->withAttribute('frontend.typoscript', $ts);
$request = $request->withAttribute('normalizedParams', NormalizedParams::createFromRequest($request));
$render = static function (string $source, array $data = []) use ($factory, $root, $request): string {
    $context = $factory->create([], $request);
    $paths = $context->getTemplatePaths();
    $paths->setTemplateSource($source);
    $paths->setLayoutRootPaths([$root . '/Resources/Private/Layouts/ContentElements']);
    $paths->setPartialRootPaths([$root . '/Resources/Private/Partials']);
    $view = new TemplateView($context);
    $view->assign('data', $data);
    return $view->render();
};
$resources = GeneralUtility::makeInstance(ResourceFactory::class);
$pool = GeneralUtility::makeInstance(ConnectionPool::class);
$uid = $pool->getConnectionForTable('sys_file_reference')->fetchOne('SELECT r.uid FROM sys_file_reference r JOIN sys_file f ON f.uid=r.uid_local WHERE r.deleted=0 AND f.missing=0 AND f.type=2 ORDER BY r.uid LIMIT 1');
if (!$uid) throw new RuntimeException('Requires an existing FAL image reference; no records are created.');
$original = $resources->getFileReferenceObject((int)$uid);
$image = new FileReference(array_replace($original->getReferenceProperties(), [
    'alternative' => 'Contrast fixture image',
    'description' => 'Caption & <em>escaped text</em>. ' . str_repeat('A long caption must remain visible below the content. ', 8),
]), $resources);
$html = '<section data-test="buttons">';
foreach (['small', 'medium', 'large'] as $size) {
    foreach (['action', 'link', 'disabled', 'disabled-link'] as $kind) {
        $html .= '<div data-size="' . $size . '" data-kind="' . $kind . '">' . $render(
            '<astryx:button variant="destructive" size="{data.size}" label="Delete" href="{data.href}" disabled="{data.disabled}" />',
            ['size' => $size, 'href' => str_contains($kind, 'link') ? 'https://example.org/delete' : '', 'disabled' => str_starts_with($kind, 'disabled')]
        ) . '</div>';
    }
}
$html .= '</section>';
$source = file_get_contents($root . '/ContentBlocks/ContentElements/hero/templates/frontend.fluid.html');
$base = ['uid' => 9700, 'layout' => 'overlay', 'header' => 'Readable Hero', 'header_layout' => 2,
    'header_link' => 'https://example.org/title', 'subheader' => 'Secondary text on a safe surface', 'heading_size' => 'medium',
    'bodytext' => '<p>Body text with an <a href="https://example.org/inline">inline link</a> and <small>supporting text</small> and <code>inline code</code>.</p>',
    'eyebrow' => 'Feature', 'image' => [$image], 'cta_link' => 'https://example.org/primary', 'cta_label' => 'Explore',
    'secondary_link' => 'https://example.org/secondary', 'secondary_label' => 'Details'];
foreach (['white', 'black', 'busy'] as $photo) {
    foreach (['neutral', 'accent'] as $variant) {
        foreach (['auto', 'wide', 'landscape', 'square'] as $index => $aspect) {
            $data = array_replace($base, ['uid' => ++$base['uid'], 'variant' => $variant, 'aspect_ratio' => $aspect, 'alignment' => ['start','center','end','start'][$index]]);
            $rendered = $render($source, $data);
            $document = new DOMDocument(); @$document->loadHTML('<?xml encoding="UTF-8">' . $rendered);
            $xpath = new DOMXPath($document);
            if ($xpath->query('//figure/img[@srcset and @width and @height and @alt and @loading="eager"]')->length !== 1
                || $xpath->query('//figure/figcaption')->length !== 1
                || $xpath->query('//a')->length !== 4
                || !str_contains($rendered, '&lt;em&gt;escaped text&lt;/em&gt;')
                || !str_contains($rendered, '<small>supporting text</small>')) throw new RuntimeException('Hero lost FAL metadata, escaped caption, rich text or real links.');
            $html .= '<article data-photo="' . $photo . '" data-variant="' . $variant . '" data-aspect="' . $aspect . '">' . $rendered . '</article>';
        }
    }
}
foreach (['split','centered','overlay'] as $layout) {
    $html .= '<article data-no-image="' . $layout . '">' . $render($source, array_replace($base, ['uid' => ++$base['uid'], 'layout' => $layout, 'variant' => 'neutral', 'aspect_ratio' => 'auto', 'image' => []])) . '</article>';
}
echo in_array('--html', $argv, true) ? $html : "Contrast: destructive actions/links/disabled sizes and 24 Hero FAL/rich-text/caption/CTA variants rendered; three no-image layouts pass.\n";

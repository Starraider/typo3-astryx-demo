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
$render = static function (string $source, array $data = [], array $variables = []) use ($factory, $root, $request): string {
    $context = $factory->create([], $request);
    $paths = $context->getTemplatePaths();
    $paths->setTemplateSource($source);
    $paths->setLayoutRootPaths([$root . '/Resources/Private/Layouts/ContentElements']);
    $paths->setPartialRootPaths([$root . '/Resources/Private/Partials']);
    $view = new TemplateView($context);
    $view->assign('data', $data);
    $view->assignMultiple($variables);
    return $view->render();
};
$resources = GeneralUtility::makeInstance(ResourceFactory::class);
$pool = GeneralUtility::makeInstance(ConnectionPool::class);
$uid = $pool->getConnectionForTable('sys_file_reference')->fetchOne('SELECT r.uid FROM sys_file_reference r JOIN sys_file f ON f.uid=r.uid_local JOIN sys_file_metadata m ON m.file=f.uid WHERE r.deleted=0 AND f.missing=0 AND f.type=2 ORDER BY m.width DESC, r.uid LIMIT 1');
if (!$uid) throw new RuntimeException('Requires an existing FAL image reference; no records are created.');
$original = $resources->getFileReferenceObject((int)$uid);
$image = new FileReference(array_replace($original->getReferenceProperties(), [
    'alternative' => 'Responsive fixture image',
    'description' => 'Caption & <em>escaped text</em>.',
]), $resources);
$html = '';
$base = ['uid' => 9850, 'header' => '', 'header_layout' => 100, 'bodytext' => '', 'image' => [$image], 'aspect_ratio' => 'auto'];
$item = ['title' => '', 'body' => '', 'image' => [$image], 'link' => '', 'label' => '', 'badge' => '', 'category' => 'Photo'];
$cases = [];
foreach (['outlined', 'flat', 'elevated'] as $variant) $cases['card-' . $variant] = ['card', ['variant' => $variant]];
foreach (['two', 'three', 'four'] as $columns) {
    foreach (['small', 'normal', 'large'] as $gap) $cases["grid-$columns-$gap"] = ['card-grid', ['columns' => $columns, 'gap' => $gap, 'items' => array_fill(0, 5, $item)]];
}
$cases['grid-single'] = ['card-grid', ['columns' => 'four', 'items' => [$item]]];
$cases['carousel'] = ['carousel', ['items' => array_fill(0, 3, $item), 'navigation' => 0]];
foreach (range(1, 6) as $columns) $cases['gallery-' . $columns] = ['classic-gallery', ['columns' => (string)$columns, 'items' => array_fill(0, 7, $item)]];
foreach (['one', 'two', 'three', 'four', 'five', 'six', 'invalid'] as $columns) $cases['images-' . $columns] = ['image-only', ['columns' => $columns, 'image' => array_fill(0, 6, $image)]];
foreach ([0, 1, 2, 8, 9, 10, 17, 18, 25, 26] as $orientation) {
    $cases['textmedia-' . $orientation] = ['textmedia', ['imageorient' => $orientation]];
}
// Both FAL paths must preserve the sizes argument through the Media adapter.
$cases['textmedia-assets'] = ['textmedia', ['imageorient' => 25, 'image' => [], 'assets' => [$image]]];
foreach ($cases as $id => [$block, $data]) {
    $source = file_get_contents($root . '/ContentBlocks/ContentElements/' . $block . '/templates/frontend.fluid.html');
    $rendered = $render($source, array_replace($base, $data));
    $document = new DOMDocument(); @$document->loadHTML($rendered); $xpath = new DOMXPath($document);
    foreach ($xpath->query('//img[@srcset]') as $img) {
        if (!str_starts_with($img->getAttribute('sizes'), 'auto, ') || str_contains($img->getAttribute('sizes'), '{') || !$img->getAttribute('src')
            || !$img->getAttribute('srcset') || !$img->getAttribute('width') || !$img->getAttribute('height')
            || $img->getAttribute('alt') !== 'Responsive fixture image') throw new RuntimeException('Lost responsive/FAL contract: ' . $id);
    }
    if (!$xpath->query('//img[@srcset]')->length) throw new RuntimeException('Missing image: ' . $id);
    if ($block !== 'classic-gallery' && !str_contains($rendered, '&lt;em&gt;escaped text&lt;/em&gt;')) throw new RuntimeException('Caption escaping lost');
    $html .= '<section data-test="' . $id . '">' . $rendered . '</section>';
}
foreach ([0, 1] as $eager) {
    foreach (['Image', 'Media'] as $partial) {
        foreach (['320px', ''] as $sizes) {
            $rendered = $render('<f:render partial="Media/' . $partial . '" arguments="{file: data.image.0, sizes: data.sizes, eager: data.eager}" />', $base + ['sizes' => $sizes, 'eager' => $eager]);
            $fallbackSizes = $sizes ?: '100vw';
            $expected = $eager ? $fallbackSizes : 'auto, ' . $fallbackSizes;
            if (!str_contains($rendered, 'sizes="' . $expected . '"') || str_contains($rendered, 'sizes="auto, auto')) throw new RuntimeException('Caller sizes/eager propagation failed');
        }
    }
}
$fallback = $render('<f:render partial="Media/Image" arguments="{file: data.image.0}" />', $base);
if (!str_contains($fallback, 'sizes="auto, 100vw"')) throw new RuntimeException('Missing conservative default');
$override = $render(file_get_contents($root . '/ContentBlocks/ContentElements/card/templates/frontend.fluid.html'), $base, ['imageSizes' => '320px']);
if (!str_contains($override, 'sizes="auto, 320px"')) throw new RuntimeException('Block-level override lost through Card slot');
echo in_array('--html', $argv, true) ? $html : count($cases) . " responsive consumers: real FAL, caller overrides, eager/lazy, Media/Card slot propagation and escaped captions passed.\n";

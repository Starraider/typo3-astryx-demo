<?php
declare(strict_types=1);

use TYPO3\CMS\Backend\Form\FormDataCompiler;
use TYPO3\CMS\Backend\Form\FormDataGroup\TcaDatabaseRecord;
use TYPO3\CMS\Core\Authentication\CommandLineUserAuthentication;
use TYPO3\CMS\Core\Http\NormalizedParams;
use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Core\SystemEnvironmentBuilder;
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\CMS\Core\Http\Uri;
use TYPO3\CMS\Core\Site\Entity\SiteLanguage;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Fluid\Core\Rendering\RenderingContextFactory;
use TYPO3Fluid\Fluid\View\TemplateView;

// Read-only checks against installed TCA and real Fluid templates; no CMS records are created.
putenv('TYPO3_PATH_APP=' . getcwd());
putenv('TYPO3_PATH_ROOT=' . getcwd() . '/public');
$loader = require getcwd() . '/vendor/autoload.php';
SystemEnvironmentBuilder::run(0, SystemEnvironmentBuilder::REQUESTTYPE_CLI);
Bootstrap::init($loader);
$GLOBALS['LANG'] = GeneralUtility::makeInstance(LanguageServiceFactory::class)->create('en');
$root = dirname(__DIR__, 2);
$factory = GeneralUtility::makeInstance(RenderingContextFactory::class);
$positions = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];
$config = array_replace_recursive(
    $GLOBALS['TCA']['tt_content']['columns']['astryx_carousel_pagination_position']['config'],
    $GLOBALS['TCA']['tt_content']['types']['astryx_carousel']['columnsOverrides']['astryx_carousel_pagination_position']['config']
);
$values = array_column($config['items'], 'value');
sort($values); $expected = $positions; sort($expected);
if ($values !== $expected || $config['default'] !== 'bottom-center') throw new RuntimeException('Missing carousel position choices or default');
// Compile the editor's actual new-record form, including translated choices/defaults.
Bootstrap::initializeBackendUser(CommandLineUserAuthentication::class);
Bootstrap::initializeBackendAuthentication();
$GLOBALS['BE_USER']->initializeUserSessionManager();
$request = (new ServerRequest('https://typo3-astryx.ddev.site/typo3/'))->withAttribute('applicationType', SystemEnvironmentBuilder::REQUESTTYPE_BE);
$request = $request->withAttribute('normalizedParams', NormalizedParams::createFromRequest($request));
$form = GeneralUtility::makeInstance(FormDataCompiler::class)->compile(['request' => $request, 'command' => 'new', 'tableName' => 'tt_content', 'vanillaUid' => 1, 'defaultValues' => ['tt_content' => ['CType' => 'astryx_carousel']]], GeneralUtility::makeInstance(TcaDatabaseRecord::class));
$field = $form['processedTca']['columns']['astryx_carousel_pagination_position'];
if ($field['label'] !== 'Pagination Position' || count($field['config']['items']) !== 6 || $field['config']['default'] !== 'bottom-center') throw new RuntimeException('Editor position selector not available');
if (array_column($field['config']['items'], 'label') !== ['Bottom center', 'Top left', 'Top center', 'Top right', 'Bottom left', 'Bottom right']) throw new RuntimeException('Editor position labels do not resolve');
$render = static function (array $data, string $locale = 'en', bool $preview = false) use ($factory, $root): string {
    $request = (new ServerRequest())->withAttribute('applicationType', SystemEnvironmentBuilder::REQUESTTYPE_FE)->withAttribute('language', new SiteLanguage(0, $locale, new Uri('/'), ['typo3Language' => $locale]));
    $context = $factory->create([], $request);
    $paths = $context->getTemplatePaths();
    $paths->setTemplatePathAndFilename($root . '/ContentBlocks/ContentElements/carousel/templates/' . ($preview ? 'backend-preview' : 'frontend') . '.fluid.html');
    $paths->setLayoutRootPaths([$root . '/Resources/Private/Layouts/ContentElements']);
    $paths->setPartialRootPaths([$root . '/Resources/Private/Partials']);
    $view = new TemplateView($context);
    $view->assign('data', $data);
    return $preview ? $view->renderSection('Content', ['data' => $data]) : $view->render();
};
$items = [];
for ($i = 1; $i <= 5; $i++) $items[] = ['title' => 'Card ' . $i, 'body' => '', 'image' => [], 'link' => '', 'label' => '', 'badge' => ''];
$base = ['_name' => 'astryx/carousel', 'header' => '', 'header_layout' => 100, 'navigation' => 1, 'edge_fade' => 0, 'items' => $items];
$html = '';
foreach ([...$positions, '', 'invalid'] as $i => $position) {
    $rendered = $render($base + ['uid' => 9200 + $i, 'pagination_position' => $position]);
    $document = new DOMDocument(); @$document->loadHTML('<?xml encoding="UTF-8">' . $rendered);
    $xpath = new DOMXPath($document);
    if ($xpath->query('//nav[@hidden]/div/button[@data-carousel-page]')->length !== 5 || $xpath->query('//button[@aria-label="Go to page 1"]')->length !== 1) throw new RuntimeException('Missing hidden dot controls and accessible labels');
    $navFirst = $xpath->query('//section/*[1]')->item(0)->nodeName === 'nav';
    if ($navFirst !== str_starts_with($position, 'top-')) throw new RuntimeException('Incorrect pagination DOM order: ' . $position);
    $preview = $render($base + ['uid' => 9200 + $i, 'pagination_position' => $position], 'en', true);
    if (in_array($position, $positions, true) && !str_contains($preview, ucfirst(str_replace('-', ' ', $position)))) throw new RuntimeException('Backend preview position missing: ' . $position);
    $html .= '<div data-fixture-position="' . ($position ?: 'default') . '">' . $rendered . '</div>';
}
$html .= '<div data-fixture-position="single">' . $render(array_replace($base, ['uid' => 9290, 'items' => [$items[0]]])) . '</div>';
$html .= '<div data-fixture-position="disabled">' . $render(array_replace($base, ['uid' => 9291, 'navigation' => 0])) . '</div>';
$german = $render($base + ['uid' => 9292, 'pagination_position' => 'bottom-center'], 'de');
if (!str_contains($german, 'Zu Seite 1') || !str_contains($german, 'Seite %d von %d')) throw new RuntimeException('Missing German pagination translations');
if (str_contains($render(array_replace($base, ['uid' => 9293, 'navigation' => 0])), '<nav')) throw new RuntimeException('Disabled navigation still renders controls');
echo in_array('--html', $argv, true) ? $html : "Carousel: six TCA positions, bottom-center default/fallback, editor form/default, backend previews, DOM order, dot controls and English/German labels passed.\n";


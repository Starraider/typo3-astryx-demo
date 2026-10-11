<?php
declare(strict_types=1);

use TYPO3\CMS\Backend\Form\FormDataCompiler;
use TYPO3\CMS\Backend\Form\FormDataGroup\TcaDatabaseRecord;
use TYPO3\CMS\ContentBlocks\DataProcessing\ContentBlocksDataProcessor;
use TYPO3\CMS\Core\Authentication\CommandLineUserAuthentication;
use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Core\SystemEnvironmentBuilder;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Http\NormalizedParams;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\CMS\Core\Http\Uri;
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
use TYPO3\CMS\Core\Resource\ResourceFactory;
use TYPO3\CMS\Core\Resource\FileReference;
use TYPO3\CMS\Core\Site\Entity\SiteLanguage;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Fluid\Core\Rendering\RenderingContextFactory;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;
use TYPO3Fluid\Fluid\View\TemplateView;

// Read-only: installed editor TCA, existing FAL references and actual Fluid templates.
putenv('TYPO3_PATH_APP=' . getcwd());
putenv('TYPO3_PATH_ROOT=' . getcwd() . '/public');
$loader = require getcwd() . '/vendor/autoload.php';
SystemEnvironmentBuilder::run(0, SystemEnvironmentBuilder::REQUESTTYPE_CLI);
Bootstrap::init($loader);
$GLOBALS['LANG'] = GeneralUtility::makeInstance(LanguageServiceFactory::class)->create('en');
$root = dirname(__DIR__, 2);
$factory = GeneralUtility::makeInstance(RenderingContextFactory::class);
Bootstrap::initializeBackendUser(CommandLineUserAuthentication::class);
Bootstrap::initializeBackendAuthentication();
$GLOBALS['BE_USER']->initializeUserSessionManager();
$request = (new ServerRequest('https://typo3-astryx.ddev.site/typo3/'))->withAttribute('applicationType', SystemEnvironmentBuilder::REQUESTTYPE_BE);
$request = $request->withAttribute('normalizedParams', NormalizedParams::createFromRequest($request));
$form = GeneralUtility::makeInstance(FormDataCompiler::class)->compile(['request' => $request, 'command' => 'new', 'tableName' => 'tt_content', 'vanillaUid' => 1, 'defaultValues' => ['tt_content' => ['CType' => 'astryx_image_only']]], GeneralUtility::makeInstance(TcaDatabaseRecord::class));
foreach (['columns' => ['one','two','three','four','five','six'], 'aspect_ratio' => ['auto','landscape','wide','square']] as $field => $values) {
    $config = $form['processedTca']['columns']['astryx_imageonly_' . $field]['config'];
    if (array_column($config['items'], 'value') !== $values || $config['default'] !== ($field === 'columns' ? 'three' : 'auto')) throw new RuntimeException('Missing editor choices/default: ' . $field);
}
if ($form['processedTca']['columns']['astryx_imageonly_columns']['label'] !== 'Number of columns'
    || array_column($form['processedTca']['columns']['astryx_imageonly_columns']['config']['items'], 'label') !== ['1','2','3','4','5','6']
    || array_column($form['processedTca']['columns']['astryx_imageonly_aspect_ratio']['config']['items'], 'label') !== ['Original','4:3','16:9','1:1']) throw new RuntimeException('Editor labels did not resolve');
if ($form['processedTca']['columns']['image']['config']['type'] !== 'file'
    || $form['processedTca']['columns']['image']['config']['maxitems'] !== 100) throw new RuntimeException('Core multiple-image FAL field not reused');
$pool = GeneralUtility::makeInstance(ConnectionPool::class);
$references = $pool->getConnectionForTable('sys_file_reference')->fetchFirstColumn("SELECT r.uid FROM sys_file_reference r JOIN sys_file f ON f.uid=r.uid_local WHERE r.deleted=0 AND f.missing=0 AND f.type=2 ORDER BY (f.identifier LIKE '%/planets/%'), r.uid LIMIT 30");
if (!$references) throw new RuntimeException('Requires existing FAL image references');
$resources = GeneralUtility::makeInstance(ResourceFactory::class);
$images = array_map(static fn($uid) => $resources->getFileReferenceObject((int)$uid), $references);
// Include different source proportions when present in the integration site.
$unique = [];
foreach ($images as $image) $unique[$image->getProperty('width') . ':' . $image->getProperty('height')] ??= $image;
$images = array_values($unique);
$selected = array_map(static fn($i) => $images[$i % count($images)], range(0,5));
// Overlay test metadata only in memory, leaving database/FAL records unchanged.
$caption = 'Caption <script>alert(1)</script> & ' . str_repeat('longcaptionword ', 16);
$selected[1] = new FileReference(array_replace($selected[1]->getReferenceProperties(), ['description' => $caption, 'alternative' => 'Image & alternative']), $resources);
$render = static function (mixed $data, bool $preview = false, string $locale = 'en') use ($factory, $root): string {
    $request = (new ServerRequest())->withAttribute('applicationType', SystemEnvironmentBuilder::REQUESTTYPE_FE)->withAttribute('language', new SiteLanguage(0, $locale, new Uri('/'), ['typo3Language' => $locale]));
    $context = $factory->create([], $request);
    $paths = $context->getTemplatePaths();
    $paths->setTemplatePathAndFilename($root . '/ContentBlocks/ContentElements/image-only/templates/' . ($preview ? 'backend-preview' : 'frontend') . '.fluid.html');
    $paths->setLayoutRootPaths([$root . '/Resources/Private/Layouts/ContentElements']);
    $paths->setPartialRootPaths([$root . '/Resources/Private/Partials']);
    $view = new TemplateView($context); $view->assign('data', $data);
    return $preview ? $view->renderSection('Content', ['data' => $data]) : $view->render();
};
$base = ['_name' => 'astryx/image-only', 'uid' => 9300, 'header' => '', 'header_layout' => 100, 'image' => $selected, 'columns' => 'three', 'aspect_ratio' => 'auto'];
$html = '';
foreach (['one','two','three','four','five','six','','invalid'] as $columns) {
    foreach (['auto','landscape','wide','square','invalid'] as $aspect) {
        $data = array_replace($base, ['columns' => $columns, 'aspect_ratio' => $aspect]);
        $rendered = $render($data);
        $document = new DOMDocument(); @$document->loadHTML($rendered); $xpath = new DOMXPath($document);
        if (str_contains($rendered, '<script>') || !str_contains($rendered, '&lt;script&gt;')) throw new RuntimeException('Caption must remain escaped');
        if ($xpath->query('//figure')->length !== 6 || $xpath->query('//img[@srcset and @width and @height and @alt and @loading="lazy"]')->length !== 6) throw new RuntimeException('Images/metadata/responsive sources lost');
        foreach ($xpath->query('//img') as $i => $image) {
            if ($image->getAttribute('alt') !== (string)$selected[$i]->getProperty('alternative')) throw new RuntimeException('FAL alternative text not preserved');
        }
        $html .= '<section data-test-columns="' . ($columns ?: 'default') . '" data-test-aspect="' . $aspect . '">' . $rendered . '</section>';
    }
}
$preview = $render($base, true);
if (substr_count($preview, '<img') !== 6 || !str_contains($preview, 'Columns: 3') || !str_contains($preview, 'Original')) throw new RuntimeException('Backend preview missing images/settings');
$html .= '<section data-test-preview="true">' . $preview . '</section>';
$german = $render($base, true, 'de');
if (!str_contains($german, 'Spalten: 3') || !str_contains($german, 'Bildseitenverhältnis')) throw new RuntimeException('Missing German preview translations');
$html .= '<section data-test-columns="three" data-test-aspect="square" data-test-incomplete="true">' . $render(array_replace($base, ['image' => array_slice($selected,0,4), 'aspect_ratio' => 'square'])) . '</section>';
if (str_contains($render(array_replace($base, ['image' => []])), '<img')) throw new RuntimeException('Empty image field rendered placeholders');
$headed = $render(array_replace($base, ['header' => 'Images & title', 'header_layout' => 2, 'header_position' => 'center']));
if (!str_contains($headed, 'Images &amp; title') || !str_contains($headed, '<h2')) throw new RuntimeException('Shared heading lost');
// Exercise real Content Blocks processing, including FAL relation resolution, without writes.
$row = $pool->getConnectionForTable('tt_content')->fetchAssociative("SELECT c.* FROM tt_content c JOIN sys_file_reference r ON r.uid_foreign=c.uid AND r.tablenames='tt_content' AND r.fieldname='image' JOIN sys_file f ON f.uid=r.uid_local WHERE c.deleted=0 AND r.deleted=0 AND f.missing=0 AND f.type=2 LIMIT 1");
// A site may use only the assets field; still check generated-field transformation.
$hasCoreImageRelation = (bool)$row;
if (!$row) $row = ['uid' => 9399, 'pid' => 1];
$defaults = array_map(static fn($column) => $column['config']['default'] ?? '', $GLOBALS['TCA']['tt_content']['columns']);
$defaults = array_replace($defaults, ['t3ver_wsid' => 0, 't3ver_oid' => 0, 't3ver_state' => 0, 't3ver_stage' => 0, 'crdate' => 0, 'tstamp' => 0, 'deleted' => 0, 'sorting' => 0]);
$row = array_replace($defaults, $row, ['CType' => 'astryx_image_only', 'astryx_imageonly_columns' => 'three', 'astryx_imageonly_aspect_ratio' => 'landscape']);
$cObj = GeneralUtility::makeInstance(ContentObjectRenderer::class);
$cObj->setRequest((new ServerRequest())->withAttribute('applicationType', SystemEnvironmentBuilder::REQUESTTYPE_FE));
$cObj->start($row, 'tt_content');
$processed = GeneralUtility::makeInstance(ContentBlocksDataProcessor::class)->process($cObj, [], [], ['data' => $row])['data'];
if ($processed->get('columns') !== 'three' || $processed->get('aspect_ratio') !== 'landscape') throw new RuntimeException('Generated fields lost during Content Blocks record processing');
if ($hasCoreImageRelation && (!str_contains($render($processed), '<img') || !str_contains($render($processed), 'data-aspect="landscape"'))) throw new RuntimeException('Real FAL/Content Blocks record did not render');
echo in_array('--html', $argv, true) ? $html : "Image Only: editor choices/defaults, core FAL field, 40 grid/ratio combinations, source metadata, real record processing, headings, empty state and English/German preview passed.\n";

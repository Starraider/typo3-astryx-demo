<?php
declare(strict_types=1);

// Read-only editor form checks against TYPO3's installed, processed TCA.
use TYPO3\CMS\Backend\Form\FormDataCompiler;
use TYPO3\CMS\Backend\Form\FormDataGroup\TcaDatabaseRecord;
use TYPO3\CMS\Core\Authentication\CommandLineUserAuthentication;
use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Core\SystemEnvironmentBuilder;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Http\NormalizedParams;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\CMS\Core\Http\Uri;
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
use TYPO3\CMS\Core\Resource\ResourceFactory;
use TYPO3\CMS\Core\Site\Entity\SiteLanguage;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Fluid\Core\Rendering\RenderingContextFactory;
use TYPO3Fluid\Fluid\View\TemplateView;

putenv('TYPO3_PATH_APP=' . getcwd());
putenv('TYPO3_PATH_ROOT=' . getcwd() . '/public');
$loader = require getcwd() . '/vendor/autoload.php';
SystemEnvironmentBuilder::run(0, SystemEnvironmentBuilder::REQUESTTYPE_CLI);
Bootstrap::init($loader);
Bootstrap::initializeBackendUser(CommandLineUserAuthentication::class);
Bootstrap::initializeBackendAuthentication();
$GLOBALS['BE_USER']->initializeUserSessionManager();
$request = (new ServerRequest('https://typo3-astryx.ddev.site/typo3/'))->withAttribute('applicationType', SystemEnvironmentBuilder::REQUESTTYPE_BE);
$request = $request->withAttribute('normalizedParams', NormalizedParams::createFromRequest($request));
$type = 'astryx_container_single_col';
$grid = $GLOBALS['TCA']['tt_content']['containerConfiguration'][$type]['grid'][0];
if (array_column($grid, 'colPos') !== [201]) throw new RuntimeException('Single editable column missing');
foreach (['en', 'de'] as $language) {
    $GLOBALS['LANG'] = GeneralUtility::makeInstance(LanguageServiceFactory::class)->create($language);
    $form = GeneralUtility::makeInstance(FormDataCompiler::class)->compile([
        'request' => $request, 'command' => 'new', 'tableName' => 'tt_content', 'vanillaUid' => 1,
        'defaultValues' => ['tt_content' => ['CType' => $type]],
    ], GeneralUtility::makeInstance(TcaDatabaseRecord::class));
    $columns = $form['processedTca']['columns'];
    foreach (['background' => ['light', 'dark'], 'width' => ['constrained', 'full-bleed']] as $field => $choices) {
        $matches = array_filter($columns, static fn(array $column): bool => array_column($column['config']['items'] ?? [], 'value') === $choices);
        if (count($matches) !== 1) throw new RuntimeException('Missing editor choices: ' . $field);
        $column = array_values($matches)[0];
        if ($column['config']['default'] !== $choices[0]) throw new RuntimeException('Incorrect default: ' . $field);
        $expected = $field === 'background'
            ? ($language === 'en' ? ['Lighter', 'Darker'] : ['Heller', 'Dunkler'])
            : ($language === 'en' ? ['Content width', 'Full viewport width'] : ['Inhaltsbreite', 'Volle Fensterbreite']);
        if (array_column($column['config']['items'], 'label') !== $expected) throw new RuntimeException('Unresolved labels: ' . $language . '/' . $field);
    }
    if ($columns['image']['config']['type'] !== 'file' || $columns['image']['config']['maxitems'] !== 1
        || $columns['image']['label'] !== ($language === 'en' ? 'Background image' : 'Hintergrundbild')) throw new RuntimeException('Single-image FAL picker/label missing');
    if ($GLOBALS['LANG']->sL($grid[0]['name']) !== ($language === 'en' ? 'Column 1' : 'Spalte 1')) throw new RuntimeException('Column label missing');
    foreach (['header_position', 'header_link', 'space_before_class', 'space_after_class'] as $field) {
        if (!isset($columns[$field])) throw new RuntimeException('Shared editor feature lost: ' . $field);
    }
}
$root = dirname(__DIR__, 2);
$pool = GeneralUtility::makeInstance(ConnectionPool::class);
$reference = (int)$pool->getConnectionForTable('sys_file_reference')->fetchOne('SELECT r.uid FROM sys_file_reference r JOIN sys_file f ON f.uid=r.uid_local WHERE r.deleted=0 AND f.missing=0 AND f.type=2 LIMIT 1');
if (!$reference) throw new RuntimeException('Requires an existing FAL image reference');
$image = GeneralUtility::makeInstance(ResourceFactory::class)->getFileReferenceObject($reference);
foreach (['en', 'de'] as $locale) foreach ([[], [$image]] as $images) foreach (['light', 'dark', 'invalid'] as $background) {
    $request = (new ServerRequest())->withAttribute('applicationType', SystemEnvironmentBuilder::REQUESTTYPE_FE)
        ->withAttribute('language', new SiteLanguage(0, $locale, new Uri('/'), ['typo3Language' => $locale]));
    $context = GeneralUtility::makeInstance(RenderingContextFactory::class)->create([], $request);
    $context->getTemplatePaths()->setTemplatePathAndFilename($root . '/ContentBlocks/ContentElements/container-single-col/templates/backend-preview.fluid.html');
    $context->getTemplatePaths()->setPartialRootPaths([$root . '/Resources/Private/Partials']);
    $view = new TemplateView($context);
    $data = ['_name' => 'astryx/container-single-col', 'background' => $background, 'width' => 'full-bleed', 'image' => $images];
    $preview = $view->renderSection('Content', ['data' => $data]);
    $mode = $background === 'dark' ? 'dark' : 'light';
    $paletteLabel = $locale === 'en' ? ($mode === 'dark' ? 'Darker' : 'Lighter') : ($mode === 'dark' ? 'Dunkler' : 'Heller');
    if (!str_contains($preview, $paletteLabel) || !str_contains($preview, $locale === 'en' ? 'Full viewport width' : 'Volle Fensterbreite')
        || !str_contains($preview, 'data-astryx-background="' . $mode . '"') || str_contains($preview, 'data-astryx-mode') || substr_count($preview, '<img') !== count($images)) throw new RuntimeException('Preview settings/image/fallback missing');
}
echo "Single column: one child area, English/German forms and previews, defaults, single-image FAL picker, heading/link and spacing fields passed.\n";

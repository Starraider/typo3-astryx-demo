<?php
declare(strict_types=1);

// Read-only: compile the actual editor form, including the core page relation picker.
use TYPO3\CMS\Backend\Form\FormDataCompiler;
use TYPO3\CMS\Backend\Form\FormDataGroup\TcaDatabaseRecord;
use TYPO3\CMS\Core\Authentication\CommandLineUserAuthentication;
use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Core\SystemEnvironmentBuilder;
use TYPO3\CMS\Core\Http\NormalizedParams;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\CMS\Core\Imaging\IconFactory;
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;

putenv('TYPO3_PATH_APP=' . getcwd());
putenv('TYPO3_PATH_ROOT=' . getcwd() . '/public');
$loader = require getcwd() . '/vendor/autoload.php';
SystemEnvironmentBuilder::run(0, SystemEnvironmentBuilder::REQUESTTYPE_CLI);
Bootstrap::init($loader);
Bootstrap::initializeBackendUser(CommandLineUserAuthentication::class);
Bootstrap::initializeBackendAuthentication();
$GLOBALS['BE_USER']->initializeUserSessionManager();
$request = (new ServerRequest('https://typo3-astryx.ddev.site/typo3/'))
    ->withAttribute('applicationType', SystemEnvironmentBuilder::REQUESTTYPE_BE);
$request = $request->withAttribute('normalizedParams', NormalizedParams::createFromRequest($request));
foreach (['en' => 'Selected pages', 'de' => 'Ausgewählte Seiten'] as $language => $label) {
    $GLOBALS['LANG'] = GeneralUtility::makeInstance(LanguageServiceFactory::class)->create($language);
    $result = GeneralUtility::makeInstance(FormDataCompiler::class)->compile([
        'request' => $request, 'command' => 'new', 'tableName' => 'tt_content', 'vanillaUid' => 1,
        'defaultValues' => ['tt_content' => ['CType' => 'menu_pages']],
    ], GeneralUtility::makeInstance(TcaDatabaseRecord::class));
    $column = $result['processedTca']['columns']['pages'] ?? [];
    $config = $column['config'] ?? [];
    if (($config['type'] ?? '') !== 'group' || ($config['allowed'] ?? '') !== 'pages'
        || ($config['maxitems'] ?? 0) !== 50 || ($config['size'] ?? 0) < 2
        || ($config['fieldControl']['elementBrowser']['disabled'] ?? false)) {
        throw new RuntimeException('Missing ordered multi-page picker or page browser.');
    }
    if (($column['label'] ?? '') !== $label || empty($column['description'])) {
        throw new RuntimeException('Missing translated page selection instructions.');
    }
    if (!str_contains($result['processedTca']['types']['menu_pages']['showitem'], 'pages')) {
        throw new RuntimeException('The selected-pages picker is absent from the editor form.');
    }
}
$icon = GeneralUtility::makeInstance(IconFactory::class)->getIconForRecord('tt_content', ['CType' => 'menu_pages'])->render();
if (!str_contains($icon, 'menu-pages.svg')) throw new RuntimeException('The selected-pages icon is not registered.');
echo "Selected pages: ordered multi-page backend picker, page browser, English/German instructions and registered icon pass.\n";

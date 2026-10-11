<?php
declare(strict_types=1);

// Read-only: compile actual backend forms without creating content records or a login.
use Symfony\Component\Yaml\Yaml;
use TYPO3\CMS\Backend\Form\FormDataCompiler;
use TYPO3\CMS\Backend\Form\FormDataGroup\TcaDatabaseRecord;
use TYPO3\CMS\Core\Authentication\CommandLineUserAuthentication;
use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Core\SystemEnvironmentBuilder;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\CMS\Core\Http\NormalizedParams;
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
$GLOBALS['LANG'] = GeneralUtility::makeInstance(LanguageServiceFactory::class)->create('en');
$request = (new ServerRequest('https://typo3-astryx.ddev.site/typo3/'))->withAttribute('applicationType', SystemEnvironmentBuilder::REQUESTTYPE_BE);
$request = $request->withAttribute('normalizedParams', NormalizedParams::createFromRequest($request));
$compiler = GeneralUtility::makeInstance(FormDataCompiler::class);
$root = dirname(__DIR__, 2);
$types = ['menu_sitemap','menu_subpages','menu_pages','shortcut','html'];
foreach (glob($root . '/ContentBlocks/ContentElements/*/config.yaml') as $path) $types[] = Yaml::parseFile($path)['typeName'];
foreach ($types as $type) {
    $result = $compiler->compile(['request'=>$request,'command'=>'new','tableName'=>'tt_content','vanillaUid'=>1,'defaultValues'=>['tt_content'=>['CType'=>$type]]], GeneralUtility::makeInstance(TcaDatabaseRecord::class));
    $columns = $result['processedTca']['columns'];
    if (!isset($columns['header_position'], $columns['header_link'])) throw new RuntimeException('Form fields hidden in ' . $type);
    $items = $columns['header_position']['config']['items'];
    if (array_column($items, 'value') !== ['', 'left', 'center', 'right'] || array_column($items, 'label') !== ['Default', 'Left', 'Center', 'Right']) throw new RuntimeException('Wrong form alignment items: ' . json_encode($items));
    if ($columns['header_position']['label'] !== 'Alignment' || $columns['header_link']['label'] !== 'Link') throw new RuntimeException('Wrong translated labels: ' . $type);
    if ($type === 'astryx_hero' && isset($columns['astryx_hero_alignment'])) throw new RuntimeException('Duplicate Hero alignment control remains visible.');
}
echo "Backend forms: " . count($types) . " content types expose Alignment and Link with the expected labels/options; Hero shows one alignment control.\n";

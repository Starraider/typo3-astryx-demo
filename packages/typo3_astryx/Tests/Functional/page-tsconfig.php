<?php
declare(strict_types=1);

use TYPO3\CMS\Backend\Utility\BackendUtility;
use TYPO3\CMS\Core\Authentication\CommandLineUserAuthentication;
use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Core\SystemEnvironmentBuilder;
use Psr\Log\NullLogger;
use TYPO3\CMS\Core\Configuration\Loader\YamlFileLoader;

putenv('TYPO3_PATH_APP=' . getcwd());
putenv('TYPO3_PATH_ROOT=' . getcwd() . '/public');
$loader = require getcwd() . '/vendor/autoload.php';
SystemEnvironmentBuilder::run(1, SystemEnvironmentBuilder::REQUESTTYPE_CLI);
Bootstrap::init($loader);
Bootstrap::initializeBackendUser(CommandLineUserAuthentication::class);
Bootstrap::initializeBackendAuthentication();
$config = BackendUtility::getPagesTSconfig((int)($argv[1] ?? 1));
$layouts = $config['mod.']['web_layout.']['BackendLayouts.'] ?? [];
foreach (['default.' => [1, 0], 'astryx_sidebar.' => [1, 0, 2], 'astryx_app_shell.' => [1, 3, 0, 2]] as $name => $expected) {
    $columns = [];
    foreach ($layouts[$name]['config.']['backend_layout.']['rows.'] ?? [] as $row) {
        foreach ($row['columns.'] ?? [] as $column) {
            $columns[] = (int)$column['colPos'];
        }
    }
    if ($columns !== $expected) {
        throw new RuntimeException($name . ': incorrect resolved column positions: ' . json_encode($columns));
    }
}
if (($config['RTE.']['default.']['preset'] ?? null) !== 'astryx') {
    throw new RuntimeException('Astryx RTE preset is not active.');
}
$rte = (new YamlFileLoader(new NullLogger()))->load($GLOBALS['TYPO3_CONF_VARS']['RTE']['Presets']['astryx']);
$editorConfig = $rte['editor']['config'] ?? [];
$models = array_column($editorConfig['heading']['options'] ?? [], 'model');
if (count($models) !== count(array_unique($models))) {
    throw new RuntimeException('Duplicate heading models prevent CKEditor from initializing.');
}
if ($models !== ['paragraph', 'heading2', 'heading3', 'heading4']) {
    throw new RuntimeException('Astryx RTE heading options are missing or incorrect.');
}
if (!in_array('EXT:typo3_astryx/Resources/Public/Css/rte-tokens.css', $editorConfig['contentsCss'] ?? [], true)) {
    throw new RuntimeException('Astryx RTE stylesheet is missing.');
}
echo "Resolved Default/Sidebar/AppShell columns and RTE preset passed\n";

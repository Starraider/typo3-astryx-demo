<?php
declare(strict_types=1);

// Add an isolated test subtree; never run against the development or production site.
use TYPO3\CMS\Core\Authentication\CommandLineUserAuthentication;
use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Core\SystemEnvironmentBuilder;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\DataHandling\DataHandler;
use TYPO3\CMS\Core\Utility\GeneralUtility;

if (!preg_match('/^name: astryx-fixture$/m', file_get_contents(getcwd() . '/.ddev/config.yaml'))) {
    throw new RuntimeException('Use only the isolated astryx-fixture project.');
}
putenv('TYPO3_PATH_APP=' . getcwd());
putenv('TYPO3_PATH_ROOT=' . getcwd() . '/public');
$loader = require getcwd() . '/vendor/autoload.php';
SystemEnvironmentBuilder::run(1, SystemEnvironmentBuilder::REQUESTTYPE_CLI);
Bootstrap::init($loader);
Bootstrap::initializeBackendUser(CommandLineUserAuthentication::class);
Bootstrap::initializeBackendAuthentication();
$pool = GeneralUtility::makeInstance(ConnectionPool::class);
$pages = $pool->getConnectionForTable('pages');
$save = static function (string $table, int|string $id, array $data): int {
    $handler = GeneralUtility::makeInstance(DataHandler::class);
    $handler->start([$table => [$id => $data]], []);
    $handler->process_datamap();
    if ($handler->errorLog) throw new RuntimeException(json_encode($handler->errorLog));
    return is_int($id) ? $id : (int)$handler->substNEWwithIDs[$id];
};
$parent = (int)$pages->fetchOne('SELECT uid FROM pages WHERE slug=? AND deleted=0 AND sys_language_uid=0', ['/astryx-selected-pages-check']);
$parent = $save('pages', $parent ?: 'NEWparent', [
    'pid' => 1, 'title' => 'Selected pages check', 'slug' => '/astryx-selected-pages-check',
    'hidden' => 0, 'nav_hide' => 0, 'backend_layout' => 'pagets__default',
]);
$ids = [];
foreach ([
    'first' => ['title' => 'First & selected', 'sorting' => 100],
    'second' => ['title' => 'Second selected', 'sorting' => 200, 'target' => '_blank'],
    'third' => ['title' => str_repeat('Long selected page title ', 7), 'sorting' => 300],
    'hidden' => ['title' => 'Disabled selection', 'hidden' => 1],
    'menu-hidden' => ['title' => 'Menu-hidden selection', 'nav_hide' => 1],
    'restricted' => ['title' => 'Restricted selection', 'fe_group' => '1'],
] as $key => $data) {
    $slug = '/astryx-selected-pages-check/' . $key;
    $id = (int)$pages->fetchOne('SELECT uid FROM pages WHERE slug=? AND deleted=0 AND sys_language_uid=0', [$slug]);
    $ids[$key] = $save('pages', $id ?: 'NEW' . $key, $data + ['pid' => $parent, 'slug' => $slug, 'hidden' => 0, 'nav_hide' => 0]);
}
$translation = (int)$pages->fetchOne('SELECT uid FROM pages WHERE l10n_parent=? AND sys_language_uid=1 AND deleted=0', [$ids['first']]);
$save('pages', $translation ?: 'NEWtranslation', [
    'pid' => $parent, 'title' => 'Erste ausgewählte Seite', 'slug' => '/astryx-selected-pages-check/first',
    'sys_language_uid' => 1, 'l10n_parent' => $ids['first'], 'hidden' => 0,
]);
$content = $pool->getConnectionForTable('tt_content');
$records = [];
foreach ([
    'selected' => ['CType' => 'menu_pages', 'pages' => implode(',', [$ids['third'], $ids['first'], $ids['second'], $parent, $ids['hidden'], $ids['menu-hidden'], $ids['restricted'], 2147483647])],
    'subpages' => ['CType' => 'menu_subpages', 'pages' => (string)$parent],
    'empty' => ['CType' => 'menu_pages', 'pages' => ''],
] as $key => $data) {
    $header = 'Menu check: ' . $key;
    $id = (int)$content->fetchOne('SELECT uid FROM tt_content WHERE pid=? AND header=? AND deleted=0', [$parent, $header]);
    $records[$key] = $save('tt_content', $id ?: 'NEW' . $key, $data + [
        'pid' => $parent, 'header' => $header, 'header_layout' => 2, 'colPos' => 0,
        'space_before_class' => 'small', 'space_after_class' => 'large', 'hidden' => 0,
    ]);
}
$path = getcwd() . '/var/selected-pages-fixture.json';
file_put_contents($path, json_encode(['page' => $parent, 'pages' => $ids, 'records' => $records], JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR) . "\n");
chmod($path, 0600);
echo "Selected-pages fixture ready; private record IDs saved to var/selected-pages-fixture.json.\n";

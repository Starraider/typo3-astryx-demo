<?php
declare(strict_types=1);

// Dedicated test page only; never run in the development or production database.
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
$save = static function (string $table, int|string $id, array $data): int {
    $handler = GeneralUtility::makeInstance(DataHandler::class);
    $handler->start([$table => [$id => $data]], []);
    $handler->process_datamap();
    if ($handler->errorLog) throw new RuntimeException(json_encode($handler->errorLog));
    return is_int($id) ? $id : (int)$handler->substNEWwithIDs[$id];
};
$pages = $pool->getConnectionForTable('pages');
$page = (int)$pages->fetchOne('SELECT uid FROM pages WHERE slug=? AND deleted=0 AND sys_language_uid=0', ['/astryx-containers-check']);
$page = $save('pages', $page ?: 'NEWpage', [
    'pid' => 1, 'title' => 'Container checks', 'slug' => '/astryx-containers-check',
    'hidden' => 0, 'nav_hide' => 1, 'backend_layout' => 'pagets__default',
]);
$content = $pool->getConnectionForTable('tt_content');
$record = static function (string $key, array $data) use ($save, $content, $page): int {
    $header = 'Container check: ' . $key;
    $id = (int)$content->fetchOne('SELECT uid FROM tt_content WHERE pid=? AND header=? AND deleted=0', [$page, $header]);
    return $save('tt_content', $id ?: 'NEW' . str_replace('-', '', $key), $data + [
        'pid' => $page, 'header' => $header, 'header_layout' => 100, 'colPos' => 0, 'hidden' => 0,
    ]);
};
$records = [];
$sorting = 100;
foreach ([
    '50-50' => ['astryx_container_two_col', ['left', 'right']],
    '25-75' => ['astryx_container_two_col_25_75', ['left', 'right']],
    '75-25' => ['astryx_container_two_col_75_25', ['left', 'right']],
    'three' => ['astryx_container_three_col', ['column-1', 'column-2', 'column-3']],
    'four' => ['astryx_container_four_col', ['column-1', 'column-2', 'column-3', 'column-4']],
] as $ratio => [$type, $sides]) {
    // Field names are defined by the installed Content Block TCA.
    $gapField = array_values(array_filter(array_keys($GLOBALS['TCA']['tt_content']['columns']), static fn(string $field): bool => str_ends_with($field, '_gap') && str_contains($GLOBALS['TCA']['tt_content']['types'][$type]['showitem'], $field)))[0];
    foreach (['normal', 'small', 'large'] as $gap) {
        $key = $ratio . '-' . $gap;
        $uid = $record($key, ['CType' => $type, $gapField => $gap, 'sorting' => $sorting]);
        foreach ($sides as $index => $side) {
            $record($key . '-' . $side, ['CType' => 'astryx_text', 'tx_container_parent' => $uid, 'colPos' => 201 + $index,
                'bodytext' => '<p>' . $key . ' ' . $side . ' child <a href="https://example.com/">Link ' . $side . '</a></p>']);
        }
        $records[$key] = ['uid' => $uid, 'ratio' => $ratio, 'gap' => $gap, 'sides' => $sides];
        $sorting += 100;
    }
}
// A nested 75/25 container in the wide column must use its own available width.
$nested = $record('nested', ['CType' => 'astryx_container_two_col_75_25', 'tx_container_parent' => $records['25-75-normal']['uid'], 'colPos' => 202]);
foreach ([201 => 'left', 202 => 'right'] as $column => $side) {
    $record('nested-' . $side, ['CType' => 'astryx_text', 'tx_container_parent' => $nested, 'colPos' => $column, 'bodytext' => '<p>Nested ' . $side . ' child</p>']);
}
$records['nested'] = ['uid' => $nested, 'ratio' => '75-25', 'gap' => 'normal'];
// All three columns of a nested container must stack inside the narrow fourth column.
$nested = $record('nested-three', ['CType' => 'astryx_container_three_col', 'tx_container_parent' => $records['four-normal']['uid'], 'colPos' => 204]);
foreach ([201, 202, 203] as $column) {
    $record('nested-three-' . $column, ['CType' => 'astryx_text', 'tx_container_parent' => $nested, 'colPos' => $column, 'bodytext' => '<p>Nested third-grid child ' . $column . '</p>']);
}
$records['nested-three'] = ['uid' => $nested, 'ratio' => 'three', 'gap' => 'normal'];
foreach (['66-33', '33-66'] as $ratio) {
    $uid = $record($ratio, ['CType' => 'astryx_container_two_col', 'astryx_containertwocol_ratio' => $ratio, 'sorting' => $sorting]);
    foreach ([201 => 'left', 202 => 'right'] as $column => $side) {
        $record($ratio . '-' . $side, ['CType' => 'astryx_text', 'tx_container_parent' => $uid, 'colPos' => $column, 'bodytext' => '<p>Legacy ' . $side . ' child</p>']);
    }
    $records[$ratio] = ['uid' => $uid, 'ratio' => $ratio, 'gap' => 'normal'];
    $sorting += 100;
}
$file = getcwd() . '/var/containers-fixture.json';
file_put_contents($file, json_encode(['page' => $page, 'records' => $records], JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR) . "\n");
chmod($file, 0600);
echo "Container fixture ready; private record IDs saved to var/containers-fixture.json.\n";

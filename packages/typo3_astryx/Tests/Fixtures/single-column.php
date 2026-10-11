<?php
declare(strict_types=1);

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
$page = (int)$pages->fetchOne('SELECT uid FROM pages WHERE slug=? AND deleted=0 AND sys_language_uid=0', ['/astryx-single-column-check']);
$page = $save('pages', $page ?: 'NEWpage', [
    'pid' => 1, 'title' => 'Single-column checks', 'slug' => '/astryx-single-column-check',
    'hidden' => 0, 'nav_hide' => 1, 'backend_layout' => 'pagets__default',
]);
$content = $pool->getConnectionForTable('tt_content');
$record = static function (string $key, array $data) use ($save, $content, $page): int {
    $header = 'Single column: ' . $key;
    $id = (int)$content->fetchOne('SELECT uid FROM tt_content WHERE pid=? AND header=? AND deleted=0', [$page, $header]);
    return $save('tt_content', $id ?: 'NEW' . str_replace('-', '', $key), $data + [
        'pid' => $page, 'header' => $header, 'header_layout' => 2, 'colPos' => 0, 'hidden' => 0,
        'space_before_class' => 'small', 'space_after_class' => 'small',
    ]);
};
$type = 'astryx_container_single_col';
$fields = [];
foreach (['background', 'width'] as $identifier) {
    $fields[$identifier] = array_values(array_filter(array_keys($GLOBALS['TCA']['tt_content']['columns']), static fn(string $field): bool => str_ends_with($field, '_' . $identifier) && str_contains($GLOBALS['TCA']['tt_content']['types'][$type]['showitem'], $field)))[0];
}
$file = (int)$pool->getConnectionForTable('sys_file')->fetchOne("SELECT uid FROM sys_file WHERE missing=0 AND type=2 AND extension IN ('jpg','jpeg','png','webp') LIMIT 1");
if (!$file) throw new RuntimeException('Requires an existing fixture FAL image');
$records = [];
$sorting = 100;
foreach (['light', 'dark'] as $background) foreach (['constrained', 'full-bleed'] as $width) foreach ([false, true] as $image) {
    $key = $background . '-' . $width . ($image ? '-image' : '');
    $uid = $record($key, ['CType' => $type, $fields['background'] => $background, $fields['width'] => $width, 'sorting' => $sorting]);
    if ($image && !$content->fetchOne('SELECT image FROM tt_content WHERE uid=?', [$uid])) {
        $ref = $save('sys_file_reference', 'NEWimage', ['pid' => $page, 'uid_local' => $file, 'uid_foreign' => $uid,
            'tablenames' => 'tt_content', 'fieldname' => 'image', 'table_local' => 'sys_file', 'alternative' => 'Decorative image metadata', 'description' => 'Do not render this caption']);
        $save('tt_content', $uid, ['image' => (string)$ref]);
    }
    $child = $record($key . '-child', ['CType' => 'astryx_text', 'header_layout' => 100, 'tx_container_parent' => $uid, 'colPos' => 201,
        'bodytext' => '<p>Child ' . $key . ' <a href="https://example.com/">Link ' . $key . '</a></p><p>' . str_repeat('Container content grows naturally. ', 5) . '</p>']);
    $records[$key] = ['uid' => $uid, 'child' => $child, 'background' => $background, 'width' => $width, 'image' => $image];
    $sorting += 100;
}
// In-memory invalid choices are not normalized by an editor save.
$invalid = $record('invalid', ['CType' => $type, 'sorting' => $sorting]);
$content->update('tt_content', [$fields['background'] => 'invalid', $fields['width'] => 'invalid'], ['uid' => $invalid]);
$records['invalid'] = ['uid' => $invalid, 'background' => 'light', 'width' => 'constrained', 'image' => false];
$parent = $record('nested-parent', ['CType' => 'astryx_container_two_col_25_75', 'sorting' => $sorting + 100, 'header_layout' => 100]);
$uid = $record('nested', ['CType' => $type, 'tx_container_parent' => $parent, 'colPos' => 201, $fields['background'] => 'dark', $fields['width'] => 'full-bleed']);
$record('nested-child', ['CType' => 'astryx_text', 'header_layout' => 100, 'tx_container_parent' => $uid, 'colPos' => 201, 'bodytext' => '<p>Nested full-bleed child</p>']);
$records['nested'] = ['uid' => $uid, 'background' => 'dark', 'width' => 'full-bleed', 'image' => false];
$path = getcwd() . '/var/single-column-fixture.json';
file_put_contents($path, json_encode(['page' => $page, 'records' => $records], JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR) . "\n");
chmod($path, 0600);
echo "Single-column fixture ready; private IDs saved to var/single-column-fixture.json.\n";

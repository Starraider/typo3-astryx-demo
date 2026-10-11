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
$page = (int)$pages->fetchOne('SELECT uid FROM pages WHERE slug=? AND deleted=0', ['/astryx-identifiers-check']);
$page = $save('pages', $page ?: 'NEWpage', ['pid' => 1, 'title' => 'Occurrence identifiers',
    'slug' => '/astryx-identifiers-check', 'hidden' => 0, 'nav_hide' => 1, 'backend_layout' => 'pagets__default']);
$templates = $pool->getConnectionForTable('sys_template');
$template = (int)$templates->fetchOne('SELECT uid FROM sys_template WHERE pid=? AND title=? AND deleted=0', [$page, 'Occurrence fixture']);
$save('sys_template', $template ?: 'NEWtemplate', ['pid' => $page, 'title' => 'Occurrence fixture', 'root' => 0, 'clear' => 0,
    'config' => "page.10.paths.999 = EXT:typo3_astryx/Tests/Fixtures/IdentifierPageView/\nconfig.no_cache = 0\n"]);
$db = $pool->getConnectionForTable('tt_content');
$record = static function (string $key, array $data) use ($page, $db, $save): int {
    $header = 'Identifiers: ' . $key;
    $id = (int)$db->fetchOne('SELECT uid FROM tt_content WHERE pid=? AND header=? AND deleted=0', [$page, $header]);
    return $save('tt_content', $id ?: 'NEW' . str_replace('-', '', $key), $data + [
        'pid' => $page, 'header' => $header, 'header_layout' => 2, 'colPos' => 0, 'hidden' => 0,
        'space_before_class' => 'small', 'space_after_class' => 'small']);
};
$field = static function (string $type, string $suffix): string {
    foreach ($GLOBALS['TCA']['tt_content']['columns'] as $name => $column) {
        if (str_ends_with($name, '_' . $suffix) && str_contains($GLOBALS['TCA']['tt_content']['types'][$type]['showitem'], $name)) return $name;
    }
    throw new RuntimeException('Missing field ' . $type . '/' . $suffix);
};
$originals = [];
$originals['accordion'] = $record('accordion', ['CType' => 'astryx_accordion', $field('astryx_accordion', 'mode') => 'single', 'sorting' => 100]);
$originals['carousel'] = $record('carousel', ['CType' => 'astryx_carousel', 'sorting' => 200]);
$originals['gallery'] = $record('gallery', ['CType' => 'astryx_classic_gallery', 'sorting' => 300]);
foreach (['accordion' => 2, 'carousel' => 5, 'classic_gallery' => 1] as $kind => $count) {
    $table = 'tx_astryx_' . $kind . '_item';
    $parent = $originals[$kind === 'classic_gallery' ? 'gallery' : $kind];
    $relation = $field('astryx_' . $kind, 'items');
    $config = $GLOBALS['TCA']['tt_content']['columns'][$relation]['config'];
    $children = [];
    for ($i = 0; $i < $count; $i++) {
        $title = $kind . ' item ' . $i;
        $id = (int)$pool->getConnectionForTable($table)->fetchOne('SELECT uid FROM ' . $table . ' WHERE ' . $config['foreign_field'] . '=? AND title=? AND deleted=0', [$parent, $title]);
        $row = ['pid' => $page, $config['foreign_field'] => $parent, 'title' => $title, 'sorting' => ($i + 1) * 100];
        if ($kind === 'accordion') $row += ['body' => '<p>Independent disclosure content</p>', 'open' => 0];
        if ($kind === 'classic_gallery') $row['category'] = 'Fixture';
        $child = $save($table, $id ?: 'NEWitem', $row);
        $children[] = $child;
        if ($kind === 'classic_gallery' && !$id) {
            $file = (int)$pool->getConnectionForTable('sys_file')->fetchOne("SELECT uid FROM sys_file WHERE missing=0 AND type=2 AND extension IN ('jpg','jpeg','png','webp') LIMIT 1");
            if (!$file) throw new RuntimeException('Requires an existing fixture FAL image.');
            $imageField = array_keys(array_filter($GLOBALS['TCA'][$table]['columns'], static fn(array $c): bool => ($c['config']['type'] ?? '') === 'file'))[0];
            $reference = $save('sys_file_reference', 'NEWimage', ['pid' => $page, 'uid_local' => $file, 'uid_foreign' => $child,
                'tablenames' => $table, 'fieldname' => $imageField, 'alternative' => 'Fixture photograph']);
            $save($table, $child, [$imageField => (string)$reference]);
        }
    }
    $save('tt_content', $parent, [$relation => implode(',', $children)]);
}
$originals['sitemap'] = $record('sitemap', ['CType' => 'menu_sitemap', 'sorting' => 400]);
$originals['html'] = $record('html', ['CType' => 'html', 'bodytext' => '<p>Sanitized repeated HTML</p>', 'sorting' => 500]);
$originals['text'] = $record('text', ['CType' => 'astryx_text', 'bodytext' => '<p>Repeated content record</p>', 'sorting' => 600]);
$source = implode(',', $originals);
$record('shortcut', ['CType' => 'shortcut', 'records' => $source, 'sorting' => 700]);
$containers = [];
foreach (['single_col', 'two_col', 'two_col_25_75', 'two_col_75_25', 'three_col', 'four_col'] as $index => $variant) {
    $parent = $record($variant, ['CType' => 'astryx_container_' . $variant, 'sorting' => 800 + $index * 200]);
    $containers[$variant] = $parent;
    $nested = $record($variant . '-nested', ['CType' => 'astryx_container_single_col', 'tx_container_parent' => $parent, 'colPos' => 201]);
    $record($variant . '-nested-shortcut', ['CType' => 'shortcut', 'records' => $source, 'tx_container_parent' => $nested, 'colPos' => 201]);
    $record($variant . '-repeat', ['CType' => 'shortcut', 'records' => (string)$parent, 'sorting' => 900 + $index * 200]);
}
$path = getcwd() . '/var/identifiers-fixture.json';
file_put_contents($path, json_encode(['page' => $page, 'originals' => $originals, 'containers' => $containers], JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR) . "\n");
chmod($path, 0600);
echo "Occurrence fixture ready; private IDs saved to var/identifiers-fixture.json.\n";

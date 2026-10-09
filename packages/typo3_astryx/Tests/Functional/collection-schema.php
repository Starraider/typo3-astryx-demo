<?php
declare(strict_types=1);

use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Core\SystemEnvironmentBuilder;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Database\Schema\Parser\Lexer;
use TYPO3\CMS\Core\Database\Schema\Parser\Parser;
use TYPO3\CMS\Core\Database\Schema\SchemaMigrator;
use TYPO3\CMS\Core\Database\Schema\SqlReader;
use TYPO3\CMS\Core\Utility\GeneralUtility;

putenv('TYPO3_PATH_APP=' . getcwd());
putenv('TYPO3_PATH_ROOT=' . getcwd() . '/public');
$loader = require getcwd() . '/vendor/autoload.php';
SystemEnvironmentBuilder::run(1, SystemEnvironmentBuilder::REQUESTTYPE_CLI);
Bootstrap::init($loader);
$source = $argv[1] ?? dirname(__DIR__, 2) . '/ext_tables.sql';
$reader = GeneralUtility::makeInstance(SqlReader::class);
$parser = new Parser(new Lexer());
$connection = GeneralUtility::makeInstance(ConnectionPool::class)->getConnectionByName('Default');
$tested = [];
foreach ($reader->getCreateTableStatementArray(file_get_contents($source)) as $statement) {
    $table = $parser->parse($statement)[0];
    $name = trim($table->getName(), '`');
    if (!str_starts_with($name, 'tx_astryx_')) {
        continue;
    }
    $primaryColumns = array_map(static fn(string $name): string => trim($name, '`'), $table->getPrimaryKey()?->getColumns() ?? []);
    if (!$table->hasColumn('uid') || !$table->getColumn('uid')->getAutoincrement()
        || $primaryColumns !== ['uid']) {
        throw new RuntimeException($name . ': identity must be defined before generated TCA is available');
    }
    // A connection-local temporary table shadows the real table. Nothing is
    // changed in persistent tables, and explicit DROP TEMPORARY is safe.
    $sql = $connection->getDatabasePlatform()->getCreateTableSQL($table)[0];
    $connection->executeStatement(preg_replace('/^CREATE TABLE /', 'CREATE TEMPORARY TABLE ', $sql, 1));
    try {
        $connection->insert($name, ['foreign_table_parent_uid' => 11]);
        $first = (int)$connection->lastInsertId();
        $connection->insert($name, ['foreign_table_parent_uid' => 12]);
        $second = (int)$connection->lastInsertId();
        if ($first < 1 || $second <= $first) {
            throw new RuntimeException($name . ': fresh identity allocation failed');
        }
        $tested[] = $name;
    } finally {
        $connection->executeStatement('DROP TEMPORARY TABLE ' . $connection->quoteIdentifier($name));
    }
}
if (count($tested) !== 7) {
    throw new RuntimeException('Expected seven collection schemas');
}
echo 'Fresh collection schemas and auto-increment inserts passed for ' . count($tested) . " tables\n";

$statements = $reader->getCreateTableStatementArray($reader->getTablesDefinitionString());
$suggestions = GeneralUtility::makeInstance(SchemaMigrator::class)->getUpdateSuggestions($statements);
$pending = [];
foreach ($suggestions as $groups) {
    foreach (['create_table', 'add', 'change'] as $operation) {
        foreach ($groups[$operation] ?? [] as $statement) {
            if (str_contains($statement, 'astryx_')) {
                $pending[] = $statement;
            }
        }
    }
}
if ($pending !== []) {
    throw new RuntimeException('Pending Astryx schema updates: ' . json_encode($pending));
}
echo "TYPO3 database comparison has no pending Astryx additions or changes\n";

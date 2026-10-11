<?php
declare(strict_types=1);
use TYPO3\CMS\Core\Core\SystemEnvironmentBuilder;
use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Authentication\CommandLineUserAuthentication;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\DataHandling\DataHandler;
use TYPO3\CMS\Core\Utility\GeneralUtility;
if (!preg_match('/^name: astryx-fixture$/m', file_get_contents(getcwd() . '/.ddev/config.yaml'))) throw new RuntimeException('Use only the disposable astryx-fixture project.');
putenv('TYPO3_PATH_APP=' . getcwd());putenv('TYPO3_PATH_ROOT=' . getcwd() . '/public');
$loader=require getcwd().'/vendor/autoload.php';SystemEnvironmentBuilder::run(1,SystemEnvironmentBuilder::REQUESTTYPE_CLI);Bootstrap::init($loader);
Bootstrap::initializeBackendUser(CommandLineUserAuthentication::class);Bootstrap::initializeBackendAuthentication();
$GLOBALS['LANG']=GeneralUtility::makeInstance(\TYPO3\CMS\Core\Localization\LanguageServiceFactory::class)->create('en');
$pool=GeneralUtility::makeInstance(ConnectionPool::class);$db=$pool->getConnectionForTable('tt_content');
function executeMap(array $data=[],array $commands=[]): DataHandler {
 $handler=GeneralUtility::makeInstance(DataHandler::class);$handler->start($data,$commands);$handler->process_datamap();$handler->process_cmdmap();
 if($handler->errorLog)throw new RuntimeException(json_encode($handler->errorLog));return $handler;
}
function check(bool $condition,string $message): void { if(!$condition)throw new RuntimeException($message); }
$source=(int)$db->select(['uid'],'tt_content',['pid'=>12,'CType'=>'astryx_container_two_col','deleted'=>0],[],[],1)->fetchOne();
$sources = [$source => 2];
if (in_array('--all-variants', $argv, true)) {
    $fixture = json_decode(file_get_contents(getcwd() . '/var/containers-fixture.json'), true, flags: JSON_THROW_ON_ERROR);
    $sources = [];
    foreach (['50-50-normal', '25-75-small', '75-25-normal', 'three-normal', 'four-small'] as $key) {
        $record = $fixture['records'][$key];
        $sources[(int)$record['uid']] = count($record['sides']);
    }
}
if (in_array('--single-column', $argv, true)) {
    $fixture = json_decode(file_get_contents(getcwd() . '/var/single-column-fixture.json'), true, flags: JSON_THROW_ON_ERROR);
    $sources = [(int)$fixture['records']['dark-full-bleed-image']['uid'] => 1];
}
foreach ($sources as $source => $columnCount) {
check($source > 0, 'Missing container fixture');
$copy=executeMap([],['tt_content'=>[$source=>['copy'=>['action'=>'paste','target'=>13,'update'=>['tx_container_parent'=>0,'colPos'=>0]]]]]);$new=(int)$copy->copyMappingArray_merged['tt_content'][$source];
$children=$db->fetchAllAssociative('SELECT uid,colPos FROM tt_content WHERE tx_container_parent=? AND deleted=0',[$new]);
check(count($children)===$columnCount,'Copy must include every child: '.json_encode(['source'=>$source,'copy'=>$new,'children'=>$children,'mapping'=>$copy->copyMappingArray_merged]));check(count(array_unique(array_column($children,'colPos')))===$columnCount,'Copied children must retain every column');
$left=(int)$children[0]['uid'];$lastColumn=200+$columnCount;executeMap(['tt_content'=>[$left=>['colPos'=>$lastColumn]]]);
check((int)$db->fetchOne('SELECT colPos FROM tt_content WHERE uid=?',[$left])===$lastColumn,'Column move failed');
executeMap([],['tt_content'=>[$new=>['move'=>14]]]);
foreach(array_merge([$new],array_column($children,'uid')) as $id)check((int)$db->fetchOne('SELECT pid FROM tt_content WHERE uid=?',[$id])===14,'Moving container must move its children');
executeMap([],['tt_content'=>[$new=>['delete'=>1]]]);
foreach(array_merge([$new],array_column($children,'uid')) as $id)check((int)$db->fetchOne('SELECT deleted FROM tt_content WHERE uid=?',[$id])===1,'Deletion must include children');
$restore=[];foreach(array_merge([$new],array_column($children,'uid')) as $id)$restore[$id]=['undelete'=>1];
executeMap([],['tt_content'=>$restore]);
foreach(array_merge([$new],array_column($children,'uid')) as $id)check((int)$db->fetchOne('SELECT deleted FROM tt_content WHERE uid=?',[$id])===0,'Restoring must restore children');
executeMap([],['tt_content'=>[$new=>['delete'=>1]]]);
}
echo "Container copy, column move, page move, delete and restore passed for " . count($sources) . " variant(s)\n";

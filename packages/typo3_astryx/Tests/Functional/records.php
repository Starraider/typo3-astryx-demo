<?php
declare(strict_types=1);
use TYPO3\CMS\Core\Core\SystemEnvironmentBuilder;
use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Authentication\CommandLineUserAuthentication;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\DataHandling\DataHandler;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\Context\WorkspaceAspect;
if (!preg_match('/^name: astryx-fixture$/m', file_get_contents(getcwd() . '/.ddev/config.yaml'))) throw new RuntimeException('Use only the disposable astryx-fixture project.');
putenv('TYPO3_PATH_APP='.getcwd());putenv('TYPO3_PATH_ROOT='.getcwd().'/public');$loader=require getcwd().'/vendor/autoload.php';
SystemEnvironmentBuilder::run(1,SystemEnvironmentBuilder::REQUESTTYPE_CLI);Bootstrap::init($loader);
Bootstrap::initializeBackendUser(CommandLineUserAuthentication::class);Bootstrap::initializeBackendAuthentication();
$GLOBALS['LANG']=GeneralUtility::makeInstance(\TYPO3\CMS\Core\Localization\LanguageServiceFactory::class)->create('en');
$pool=GeneralUtility::makeInstance(ConnectionPool::class);$db=$pool->getConnectionForTable('tt_content');
function change(array $data=[],array $commands=[]): DataHandler {
 $h=GeneralUtility::makeInstance(DataHandler::class);$h->start($data,$commands);$h->process_datamap();$h->process_cmdmap();if($h->errorLog)throw new RuntimeException(json_encode($h->errorLog));return $h;
}
function verify(bool $ok,string $message): void {if(!$ok)throw new RuntimeException($message);}
if(in_array('--workspace',$argv,true)) {
 $workspace=$pool->getConnectionForTable('sys_workspace');$id=$workspace->fetchOne("SELECT uid FROM sys_workspace WHERE title='Astryx test workspace' AND deleted=0");
 if(!$id)$id=change(['sys_workspace'=>['NEWws'=>['pid'=>0,'title'=>'Astryx test workspace']]])->substNEWwithIDs['NEWws'];
 verify($GLOBALS['BE_USER']->setTemporaryWorkspace((int)$id),'Workspace unavailable');
 GeneralUtility::makeInstance(Context::class)->setAspect('workspace',new WorkspaceAspect((int)$id));
 $row=$db->fetchAssociative("SELECT uid,header FROM tt_content WHERE pid=12 AND CType='astryx_text' AND sys_language_uid=0 AND t3ver_wsid=0 AND deleted=0 LIMIT 1");
 change(['tt_content'=>[$row['uid']=>['header'=>'Astryx draft header']]]);
 verify($db->fetchOne('SELECT header FROM tt_content WHERE uid=?',[$row['uid']])===$row['header'],'Draft edit changed live data');
 verify((int)$db->fetchOne('SELECT COUNT(*) FROM tt_content WHERE t3ver_oid=? AND t3ver_wsid=? AND header=?',[$row['uid'],$id,'Astryx draft header'])===1,'Missing draft version');
 $table='tx_astryx_accordion_item';$items=$pool->getConnectionForTable($table);$item=$items->fetchAssociative("SELECT uid,title FROM $table WHERE sys_language_uid=0 AND t3ver_wsid=0 AND deleted=0 LIMIT 1");
 change([$table=>[$item['uid']=>['title'=>'Astryx draft disclosure']]]);
 verify($items->fetchOne("SELECT title FROM $table WHERE uid=?",[$item['uid']])===$item['title'],'Draft collection edit changed live data');
 verify((int)$items->fetchOne("SELECT COUNT(*) FROM $table WHERE t3ver_oid=? AND t3ver_wsid=?",[$item['uid'],$id])===1,'Missing collection draft');
 echo "Workspace drafts preserve live content and collection values\n";exit;
}
foreach([1,12] as $page)if(!$pool->getConnectionForTable('pages')->fetchOne('SELECT uid FROM pages WHERE l10n_parent=? AND sys_language_uid=1 AND deleted=0',[$page]))change([],['pages'=>[$page=>['localize'=>1]]]);
foreach(['astryx_accordion','astryx_card_grid','astryx_container_two_col'] as $type) {
 $source=(int)$db->fetchOne('SELECT uid FROM tt_content WHERE pid=12 AND CType=? AND sys_language_uid=0 AND deleted=0 LIMIT 1',[$type]);
 if(!$db->fetchOne('SELECT uid FROM tt_content WHERE l18n_parent=? AND sys_language_uid=1 AND deleted=0',[$source]))change([],['tt_content'=>[$source=>['localize'=>1]]]);
 $translated=(int)$db->fetchOne('SELECT uid FROM tt_content WHERE l18n_parent=? AND sys_language_uid=1 AND deleted=0',[$source]);verify($translated>0,'Missing translation for '.$type);
 if($type==='astryx_container_two_col')verify((int)$db->fetchOne('SELECT COUNT(*) FROM tt_content WHERE tx_container_parent=? AND sys_language_uid=1 AND deleted=0',[$source])===2,'Container children were not localized');
 else {
  $table=$type==='astryx_accordion'?'tx_astryx_accordion_item':'tx_astryx_card_grid_item';
  verify((int)$pool->getConnectionForTable($table)->fetchOne("SELECT COUNT(*) FROM $table WHERE foreign_table_parent_uid=? AND sys_language_uid=1 AND deleted=0",[$translated])===3,'Collection translation missing for '.$type);
 }
}
echo "Page, accordion/card-grid collections and container children localize through DataHandler\n";

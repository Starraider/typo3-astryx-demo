<?php
declare(strict_types=1);
use TYPO3\CMS\Core\Core\SystemEnvironmentBuilder;
use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Authentication\CommandLineUserAuthentication;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\DataHandling\DataHandler;
use TYPO3\CMS\Core\Utility\GeneralUtility;
if (!preg_match('/^name: astryx-fixture$/m', file_get_contents(getcwd() . '/.ddev/config.yaml'))) throw new RuntimeException('Use only the disposable astryx-fixture project.');
putenv('TYPO3_PATH_APP='.getcwd());putenv('TYPO3_PATH_ROOT='.getcwd().'/public');$loader=require getcwd().'/vendor/autoload.php';SystemEnvironmentBuilder::run(1,SystemEnvironmentBuilder::REQUESTTYPE_CLI);Bootstrap::init($loader);
Bootstrap::initializeBackendUser(CommandLineUserAuthentication::class);Bootstrap::initializeBackendAuthentication();
$GLOBALS['LANG']=GeneralUtility::makeInstance(\TYPO3\CMS\Core\Localization\LanguageServiceFactory::class)->create('en');
$pool=GeneralUtility::makeInstance(ConnectionPool::class);
function save(array $data,?BackendUserAuthentication $user=null): DataHandler {
 $h=GeneralUtility::makeInstance(DataHandler::class);$h->start($data,[],$user);$h->process_datamap();return $h;
}
$tables=array_keys(array_filter($GLOBALS['TCA'],fn($tca,$table)=>str_starts_with($table,'tx_astryx_'),ARRAY_FILTER_USE_BOTH));$tables=array_merge(['pages','tt_content'],$tables);$fields=[];
foreach($tables as $table)foreach($GLOBALS['TCA'][$table]['columns'] as $field=>$tca)if($tca['exclude']??false)$fields[]=$table.':'.$field;
$groups=$pool->getConnectionForTable('be_groups');$id=$groups->fetchOne("SELECT uid FROM be_groups WHERE title='Astryx fixture editors' AND deleted=0");
if(!$id)$id=save(['be_groups'=>['NEWgroup'=>['pid'=>0,'title'=>'Astryx fixture editors','db_mountpoints'=>'12','tables_select'=>implode(',',$tables),'tables_modify'=>implode(',',$tables),'non_exclude_fields'=>implode(',',$fields),'pagetypes_select'=>'1','allowed_languages'=>'0,1']]])->substNEWwithIDs['NEWgroup'];
save(['be_groups'=>[$id=>['explicit_allowdeny'=>'tt_content:CType:astryx_text','workspace_perms'=>1]]]);
$users=$pool->getConnectionForTable('be_users');$uid=$users->fetchOne("SELECT uid FROM be_users WHERE username='astryx_fixture_editor' AND deleted=0");
if(!$uid)$uid=save(['be_users'=>['NEWuser'=>['pid'=>0,'username'=>'astryx_fixture_editor','password'=>'Aa!1'.bin2hex(random_bytes(24)),'usergroup'=>(string)$id,'admin'=>0]]])->substNEWwithIDs['NEWuser'];
save(['pages'=>[12=>['perms_groupid'=>(int)$id,'perms_group'=>31]]]);
$user=GeneralUtility::makeInstance(BackendUserAuthentication::class);$user->user=$users->fetchAssociative('SELECT * FROM be_users WHERE uid=?',[$uid]);$user->fetchGroupData();$user->setTemporaryWorkspace(0);
$db=$pool->getConnectionForTable('tt_content');$record=$db->fetchAssociative("SELECT uid,header FROM tt_content WHERE pid=12 AND CType='astryx_text' AND sys_language_uid=0 AND deleted=0 LIMIT 1");
$accepted=save(['tt_content'=>[$record['uid']=>['header'=>'Restricted editor saved']]],$user);
if($accepted->errorLog||$db->fetchOne('SELECT header FROM tt_content WHERE uid=?',[$record['uid']])!=='Restricted editor saved')throw new RuntimeException('Permitted edit failed: '.json_encode($accepted->errorLog));
$outside=$db->fetchAssociative("SELECT uid,header FROM tt_content WHERE pid=13 AND sys_language_uid=0 AND deleted=0 LIMIT 1");
$denied=save(['tt_content'=>[$outside['uid']=>['header'=>'Forbidden edit']]],$user);
if(!$denied->errorLog||$db->fetchOne('SELECT header FROM tt_content WHERE uid=?',[$outside['uid']])!==$outside['header'])throw new RuntimeException('Edit outside mount was permitted');
save(['tt_content'=>[$record['uid']=>['header'=>$record['header']]]]);
echo "Restricted editor can save permitted Astryx content; edits outside its page mount are denied\n";

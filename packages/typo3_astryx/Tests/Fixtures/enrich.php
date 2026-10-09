<?php
declare(strict_types=1);
use TYPO3\CMS\Core\Core\SystemEnvironmentBuilder;
use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Authentication\CommandLineUserAuthentication;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\DataHandling\DataHandler;
use TYPO3\CMS\Core\Utility\GeneralUtility;
if (!preg_match('/^name: astryx-fixture$/m', file_get_contents(getcwd() . '/.ddev/config.yaml'))) throw new RuntimeException('Use only the disposable astryx-fixture project.');
putenv('TYPO3_PATH_APP=' . getcwd()); putenv('TYPO3_PATH_ROOT=' . getcwd() . '/public');
$loader=require getcwd().'/vendor/autoload.php';SystemEnvironmentBuilder::run(1,SystemEnvironmentBuilder::REQUESTTYPE_CLI);Bootstrap::init($loader);
Bootstrap::initializeBackendUser(CommandLineUserAuthentication::class);Bootstrap::initializeBackendAuthentication();
$GLOBALS['LANG'] = GeneralUtility::makeInstance(\TYPO3\CMS\Core\Localization\LanguageServiceFactory::class)->create('en');
$pool=GeneralUtility::makeInstance(ConnectionPool::class);
function save(array $data, array $commands=[]): array {
 $h=GeneralUtility::makeInstance(DataHandler::class);$h->start($data,$commands);$h->process_datamap();$h->process_cmdmap();
 if($h->errorLog)throw new RuntimeException(json_encode($h->errorLog));return $h->substNEWwithIDs;
}
$db=$pool->getConnectionForTable('tt_content');
$records=$db->select(['uid','pid','CType'],'tt_content',['pid'=>12])->fetchAllAssociative();
$ids=array_column($records,'uid','CType');$grid=$ids['astryx_card_grid'];
$children=$pool->getConnectionForTable('tx_astryx_card_grid_item');
$rows=$children->select(['uid'],'tx_astryx_card_grid_item',[],[],['uid'=>'ASC'])->fetchFirstColumn();
foreach($rows as $id)save(['tx_astryx_card_grid_item'=>[$id=>['foreign_table_parent_uid'=>$grid]]]);
save(['tt_content'=>[$grid=>['astryx_cardgrid_items'=>implode(',',$rows)]]]);
$file=$pool->getConnectionForTable('sys_file')->select(['uid'],'sys_file',[],[],[],1)->fetchOne();
if($file) {
 $references=$pool->getConnectionForTable('sys_file_reference');
 foreach([['astryx_downloads','media'],['astryx_textmedia','assets']] as [$type,$field]) {
  $id=$ids[$type];if($references->count('*','sys_file_reference',['uid_foreign'=>$id,'tablenames'=>'tt_content','fieldname'=>$field,'deleted'=>0]))continue;
  save(['sys_file_reference'=>['NEWfile'=>['pid'=>12,'uid_local'=>$file,'uid_foreign'=>$id,'tablenames'=>'tt_content','fieldname'=>$field,'alternative'=>'Astryx fixture media','description'=>'A preserved FAL caption','sorting_foreign'=>1]],'tt_content'=>[$id=>[$field=>'NEWfile']]]);
 }
}
if(!$db->count('*','tt_content',['CType'=>'form_formframework','pid'=>12])) {
 $xml='<?xml version="1.0"?><T3FlexForms><data><sheet index="sDEF"><language index="lDEF"><field index="settings.persistenceIdentifier"><value index="vDEF">EXT:typo3_astryx/Tests/Fixtures/contact.form.yaml</value></field></language></sheet></data></T3FlexForms>';
 save(['tt_content'=>['NEWform'=>['pid'=>12,'CType'=>'form_formframework','header'=>'Form fixture','pi_flexform'=>$xml,'colPos'=>0,'sorting'=>8192]]]);
}
if(!$pool->getConnectionForTable('sys_template')->count('*','sys_template',['title'=>'Disposable form fixture','deleted'=>0])) {
 save(['sys_template'=>['NEWsettings'=>['pid'=>1,'title'=>'Disposable form fixture','root'=>0,'clear'=>0,'config'=>"plugin.tx_form.settings.yamlConfigurations.999 = EXT:typo3_astryx/Tests/Fixtures/form-config.yaml\n"]]]);
}
echo "Populated card grid, FAL media/download and dedicated form plugin\n";

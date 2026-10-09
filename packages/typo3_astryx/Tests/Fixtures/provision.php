<?php
declare(strict_types=1);
// Run only in the disposable fixture: vendor/bin/typo3 equivalent bootstrap.
use TYPO3\CMS\Core\Core\SystemEnvironmentBuilder;
use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Authentication\CommandLineUserAuthentication;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\DataHandling\DataHandler;
use TYPO3\CMS\Core\Utility\GeneralUtility;
putenv('TYPO3_PATH_APP=' . getcwd());
putenv('TYPO3_PATH_ROOT=' . getcwd() . '/public');
if (!preg_match('/^name: astryx-fixture$/m', file_get_contents(getcwd() . '/.ddev/config.yaml'))) throw new RuntimeException('Use only the disposable astryx-fixture project.');
$classLoader = require getcwd() . '/vendor/autoload.php';
SystemEnvironmentBuilder::run(0, SystemEnvironmentBuilder::REQUESTTYPE_CLI);
Bootstrap::init($classLoader);
Bootstrap::initializeBackendUser(CommandLineUserAuthentication::class);
Bootstrap::initializeBackendAuthentication();
$GLOBALS['LANG'] = GeneralUtility::makeInstance(\TYPO3\CMS\Core\Localization\LanguageServiceFactory::class)->create('en');
$connections = GeneralUtility::makeInstance(ConnectionPool::class);
if (($connections->getConnectionForTable('pages')->count('*','pages',['slug'=>'/astryx-showcase'])) > 0) { echo "Fixture already provisioned\n"; exit(0); }
function run(array $data): array {
    $handler = GeneralUtility::makeInstance(DataHandler::class); $handler->start($data, []); $handler->process_datamap();
    if ($handler->errorLog !== []) { throw new RuntimeException(implode("\n", $handler->errorLog)); }
    return $handler->substNEWwithIDs;
}
$map = run(['pages'=>[
    'NEWshowcase'=>['pid'=>1,'title'=>'Astryx showcase','slug'=>'/astryx-showcase','backend_layout'=>'pagets__default','hidden'=>0],
    'NEWsidebar'=>['pid'=>1,'title'=>'Astryx sidebar','slug'=>'/astryx-sidebar','backend_layout'=>'pagets__astryx_sidebar','hidden'=>0],
    'NEWapp'=>['pid'=>1,'title'=>'Astryx AppShell','slug'=>'/astryx-app','backend_layout'=>'pagets__astryx_app_shell','hidden'=>0],
]]);
$pid = $map['NEWshowcase'];
$data = [];
$types = ['heading','text','textmedia','card','list','table','divider','downloads','hero','card_grid','notice','accordion','carousel','container_two_col'];
foreach ($types as $i=>$type) {
    $row = ['pid'=>$pid,'CType'=>'astryx_'.$type,'header'=>str_replace('_',' ',ucfirst($type)),'header_layout'=>2,'bodytext'=>'<p>Editorial content with <strong>emphasis</strong>, <a href="t3://page?uid=1">TYPO3 links</a> and semantic markup.</p>','colPos'=>0,'sorting'=>($i+1)*256,'hidden'=>0];
    $prefix='astryx_'.str_replace('_','',$type).'_';
    if ($type==='hero') { $row['header_layout']=1; $row[$prefix.'eyebrow']='TYPO3 Astryx'; $row[$prefix.'cta_link']='t3://page?uid=1'; $row[$prefix.'cta_label']='Return home'; }
    if ($type==='accordion') $row[$prefix.'mode']='single';
    if ($type==='carousel') $row[$prefix.'navigation']=1;
    if ($type==='notice') $row[$prefix.'status']='warning';
    if ($type==='container_two_col') $row[$prefix.'ratio']='66-33';
    $data['NEW'.$type]=$row;
}
$items=run(['tt_content'=>$data]);
$parents=['list','card_grid','accordion','carousel','table'];
foreach ($parents as $type) {
    $table='tx_astryx_'.$type.'_item';
    $field=$type==='table' ? 'rows' : 'items';
    $inline=$GLOBALS['TCA']['tt_content']['columns']['astryx_'.str_replace('_','',$type).'_'.$field]['config'];
    $children=[];
    for($i=0;$i<($type==='carousel'?5:3);$i++) {
        $row=['pid'=>$pid,$inline['foreign_field']=>$items['NEW'.$type],'sorting'=>($i+1)*256];
        if(isset($inline['foreign_table_field']))$row[$inline['foreign_table_field']]='tt_content';
        if(isset($inline['foreign_match_fields']))$row=array_merge($row,$inline['foreign_match_fields']);
        foreach($GLOBALS['TCA'][$table]['columns'] as $key=>$config) {
            if(str_ends_with($key,'title'))$row[$key]='Item '.($i+1);
            if(str_ends_with($key,'body'))$row[$key]='<p>Answer '.($i+1).' with <a href="t3://page?uid=1">a link</a>.</p>';
            if(str_ends_with($key,'text'))$row[$key]='List item '.($i+1);
            if(str_ends_with($key,'open'))$row[$key]=1;
        }
        $children['NEWitem'.$i]=$row;
    }
    $childIds=run([$table=>$children]);
    run(['tt_content'=>[$items['NEW'.$type]=>['astryx_'.str_replace('_','',$type).'_'.$field=>implode(',',array_values($childIds))]]]);
    if($type==='table') {
        $cellTable='tx_astryx_table_cell';$column=$GLOBALS['TCA'][$table]['columns'];
        $cellKey=array_key_first(array_filter($column,fn($cfg)=>($cfg['config']['foreign_table']??'')===$cellTable));
        $cellConfig=$column[$cellKey]['config'];$cells=[];
        foreach(array_values($childIds) as $index=>$parent) for($c=0;$c<2;$c++) {
            $row=['pid'=>$pid,$cellConfig['foreign_field']=>$parent,'sorting'=>($c+1)*256];
            if(isset($cellConfig['foreign_table_field']))$row[$cellConfig['foreign_table_field']]=$table;
            $row=array_merge($row,$cellConfig['foreign_match_fields']??[]);
            foreach($GLOBALS['TCA'][$cellTable]['columns'] as $key=>$cfg)if(str_ends_with($key,'value'))$row[$key]='Cell '.($index+1).'.'.($c+1);
            $cells['NEWcell'.$index.'_'.$c]=$row;
        }
        $cellIds=run([$cellTable=>$cells]);
        foreach(array_values($childIds) as $index=>$parent) {
            run([$table=>[$parent=>[$cellKey=>implode(',',[$cellIds['NEWcell'.$index.'_0'],$cellIds['NEWcell'.$index.'_1']])]]]);
        }
    }
}
run(['tt_content'=>[
 'NEWleft'=>['pid'=>$pid,'CType'=>'astryx_text','header'=>'Left child','bodytext'=>'<p>Only inside the left column.</p>','colPos'=>201,'tx_container_parent'=>$items['NEWcontainer_two_col']],
 'NEWright'=>['pid'=>$pid,'CType'=>'astryx_text','header'=>'Right child','bodytext'=>'<p>Only inside the right column.</p>','colPos'=>202,'tx_container_parent'=>$items['NEWcontainer_two_col']],
 'NEWlogin'=>['pid'=>$pid,'CType'=>'felogin_login','header'=>'Login fixture','colPos'=>0,'sorting'=>4096],
 'NEWsideMain'=>['pid'=>$map['NEWsidebar'],'CType'=>'astryx_text','header'=>'Sidebar main','bodytext'=>'<p>Main region content.</p>','colPos'=>0],
 'NEWsideDetail'=>['pid'=>$map['NEWsidebar'],'CType'=>'astryx_text','header'=>'Sidebar detail','bodytext'=>'<p>Detail remains accessible on mobile.</p>','colPos'=>2],
 'NEWappNav'=>['pid'=>$map['NEWapp'],'CType'=>'astryx_text','header'=>'App navigation','bodytext'=>'<p>Editorial side navigation.</p>','colPos'=>3],
 'NEWappMain'=>['pid'=>$map['NEWapp'],'CType'=>'astryx_text','header'=>'App main','bodytext'=>'<p>Main application content.</p>','colPos'=>0],
 'NEWappDetail'=>['pid'=>$map['NEWapp'],'CType'=>'astryx_text','header'=>'App detail','bodytext'=>'<p>Optional detail panel.</p>','colPos'=>2],
]]);
// Attach a real FAL image from the restored starter, retaining metadata/crop support.
$fileId=$connections->getConnectionForTable('sys_file')->select(['uid'],'sys_file',[],[],[],1)->fetchOne();
if($fileId) {
    run(['sys_file_reference'=>['NEWheroFile'=>['pid'=>$pid,'uid_local'=>$fileId,'uid_foreign'=>$items['NEWhero'],'tablenames'=>'tt_content','fieldname'=>'astryx_hero_image','alternative'=>'Fixture photograph','sorting_foreign'=>1]],'tt_content'=>[$items['NEWhero']=>['astryx_hero_image'=>'NEWheroFile']]]);
}
echo json_encode(['pages'=>$map,'content'=>$items],JSON_PRETTY_PRINT)."\n";

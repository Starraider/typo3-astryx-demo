<?php
declare(strict_types=1);
use TYPO3\CMS\Core\Core\SystemEnvironmentBuilder;
use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Authentication\CommandLineUserAuthentication;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\DataHandling\DataHandler;
use TYPO3\CMS\Core\Utility\GeneralUtility;
if (!preg_match('/^name: astryx-fixture$/m', file_get_contents(getcwd() . '/.ddev/config.yaml'))) throw new RuntimeException('Use only the disposable astryx-fixture project.');
putenv('TYPO3_PATH_APP='.getcwd());putenv('TYPO3_PATH_ROOT='.getcwd().'/public');$loader=require getcwd().'/vendor/autoload.php';SystemEnvironmentBuilder::run(1,SystemEnvironmentBuilder::REQUESTTYPE_CLI);Bootstrap::init($loader);
Bootstrap::initializeBackendUser(CommandLineUserAuthentication::class);Bootstrap::initializeBackendAuthentication();
$GLOBALS['LANG']=GeneralUtility::makeInstance(\TYPO3\CMS\Core\Localization\LanguageServiceFactory::class)->create('en');
$db=GeneralUtility::makeInstance(ConnectionPool::class)->getConnectionForTable('be_users');$username='astryx_fixture_admin';$password='Aa!1'.bin2hex(random_bytes(24));
$id=$db->fetchOne('SELECT uid FROM be_users WHERE username=? AND deleted=0',[$username]);
$h=GeneralUtility::makeInstance(DataHandler::class);$h->start(['be_users'=>[$id?:'NEWuser'=>['pid'=>0,'username'=>$username,'password'=>$password,'admin'=>1,'disable'=>0]]],[]);$h->process_datamap();
if($h->errorLog)throw new RuntimeException(json_encode($h->errorLog));
file_put_contents(getcwd().'/var/backend-fixture.json',json_encode(['username'=>$username,'password'=>$password]));chmod(getcwd().'/var/backend-fixture.json',0600);
echo "Private backend test login provisioned\n";

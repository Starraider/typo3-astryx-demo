<?php
declare(strict_types=1);
use TYPO3\CMS\Core\Core\SystemEnvironmentBuilder;
use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Fluid\Core\Rendering\RenderingContextFactory;
putenv('TYPO3_PATH_APP=' . getcwd());
putenv('TYPO3_PATH_ROOT=' . getcwd() . '/public');
$classLoader = require getcwd() . '/vendor/autoload.php';
SystemEnvironmentBuilder::run(0, SystemEnvironmentBuilder::REQUESTTYPE_CLI);
Bootstrap::init($classLoader);
$factory=GeneralUtility::makeInstance(RenderingContextFactory::class);
$root=dirname(__DIR__,2);$count=0;$failures=[];
foreach (['Resources/Private', 'ContentBlocks'] as $directory) {
foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root . '/' . $directory)) as $file) {
    if (!$file->isFile() || !str_ends_with($file->getFilename(),'.html'))continue;
    try { $context=$factory->create();$context->getTemplateParser()->parse(file_get_contents($file->getPathname()));$count++; }
    catch(Throwable $error) { $failures[]=['file'=>$file->getPathname(),'message'=>$error->getMessage()]; }
}
}
echo json_encode(['parsed'=>$count,'failures'=>$failures],JSON_PRETTY_PRINT)."\n";
exit($failures === [] ? 0 : 1);

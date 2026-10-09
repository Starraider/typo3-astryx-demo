<?php
declare(strict_types=1);

use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Core\SystemEnvironmentBuilder;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Fluid\Core\Rendering\RenderingContextFactory;
use TYPO3Fluid\Fluid\View\TemplateView;

putenv('TYPO3_PATH_APP=' . getcwd());
putenv('TYPO3_PATH_ROOT=' . getcwd() . '/public');
$classLoader = require getcwd() . '/vendor/autoload.php';
SystemEnvironmentBuilder::run(0, SystemEnvironmentBuilder::REQUESTTYPE_CLI);
Bootstrap::init($classLoader);

$root = dirname(__DIR__, 2);
$factory = GeneralUtility::makeInstance(RenderingContextFactory::class);
// Expected positions come from the core tt_content.imageorient selector.
$cases = [
    0 => ['above', 'center', 'false'],
    1 => ['above', 'right', 'false'],
    2 => ['above', 'left', 'false'],
    8 => ['below', 'center', 'false'],
    9 => ['below', 'right', 'false'],
    10 => ['below', 'left', 'false'],
    17 => ['intext', 'right', 'false'],
    18 => ['intext', 'left', 'false'],
    25 => ['intext', 'right', 'true'],
    26 => ['intext', 'left', 'true'],
    99 => ['above', 'center', 'false'],
];
$html = '';
foreach ($cases as $value => $expected) {
    $context = $factory->create();
    $paths = $context->getTemplatePaths();
    $paths->setTemplatePathAndFilename($root . '/ContentBlocks/ContentElements/textmedia/templates/frontend.fluid.html');
    $paths->setLayoutRootPaths([$root . '/Resources/Private/Layouts/ContentElements']);
    $paths->setPartialRootPaths([$root . '/Resources/Private/Partials']);
    $view = new TemplateView($context);
    $view->assign('data', ['uid' => $value, 'imageorient' => $value, 'header' => '', 'bodytext' => '', 'assets' => [], 'image' => []]);
    $rendered = $view->render();
    $document = new DOMDocument();
    $document->loadHTML($rendered);
    $xpath = new DOMXPath($document);
    $elements = $xpath->query('//div[@class="astryx-textmedia"]');
    if ($elements->length !== 1) {
        throw new RuntimeException('Textmedia must render exactly once for ' . $value);
    }
    $element = $elements->item(0);
    if ($xpath->query('//div[@class="astryx-media"]')->length !== 0) {
        throw new RuntimeException('Text-only content must not render an empty media slot: ' . $value);
    }
    $actual = array_map($element->getAttribute(...), ['data-orientation', 'data-alignment', 'data-nowrap']);
    if ($actual !== $expected) {
        throw new RuntimeException('Incorrect position for ' . $value . ': ' . json_encode($actual));
    }
    $html .= $rendered;
}
echo in_array('--html', $argv, true) ? $html : "Textmedia: all 10 TYPO3 orientations and the fallback render correctly.\n";

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
$html = '';
foreach (['single', 'multiple'] as $mode) {
    $context = $factory->create();
    $paths = $context->getTemplatePaths();
    $paths->setTemplatePathAndFilename($root . '/ContentBlocks/ContentElements/accordion/templates/frontend.fluid.html');
    $paths->setLayoutRootPaths([$root . '/Resources/Private/Layouts/ContentElements']);
    $paths->setPartialRootPaths([$root . '/Resources/Private/Partials']);
    $view = new TemplateView($context);
    $uid = $mode === 'single' ? 1 : 2;
    $view->assign('data', ['uid' => $uid, 'header' => '', 'mode' => $mode, 'items' => [
        ['title' => 'First <item>', 'body' => '', 'open' => true],
        ['title' => 'Second item', 'body' => '', 'open' => true],
        ['title' => 'Third item', 'body' => '', 'open' => false],
    ]]);
    $rendered = $view->render();
    $document = new DOMDocument();
    $document->loadHTML($rendered);
    $xpath = new DOMXPath($document);
    $items = $xpath->query('//details');
    if ($items->length !== 3 || $xpath->query('//details[@open]')->length !== 2) {
        throw new RuntimeException('Stored default-open flags must render in ' . $mode . ' mode');
    }
    $namespace = $xpath->query('//*[@data-astryx-occurrence]')->item(0)->getAttribute('data-astryx-occurrence');
    foreach ($items as $index => $item) {
        $expectedName = $mode === 'single' ? $namespace . '-accordion' : '';
        $trigger = $item->getElementsByTagName('summary')->item(0);
        if ($item->getAttribute('name') !== $expectedName || $trigger->getAttribute('aria-controls') !== $item->getAttribute('id') . '-content') {
            throw new RuntimeException('Incorrect native grouping or trigger association in ' . $mode . ' mode');
        }
        if ($xpath->query('//*[@id="' . $trigger->getAttribute('aria-controls') . '"]')->length !== 1) {
            throw new RuntimeException('Missing or ambiguous Accordion content target.');
        }
    }
    if ($xpath->query('//summary//item')->length !== 0 || !str_contains($rendered, 'First &lt;item&gt;')) {
        throw new RuntimeException('Accordion labels must keep Fluid escaping');
    }
    $html .= $rendered;
}
echo in_array('--html', $argv, true) ? $html : "Accordion: native grouping, stored defaults, trigger associations and label escaping pass.\n";

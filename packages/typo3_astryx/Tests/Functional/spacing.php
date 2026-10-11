<?php
declare(strict_types=1);

use Symfony\Component\Yaml\Yaml;
use TYPO3\CMS\ContentBlocks\DataProcessing\ContentBlocksDataProcessor;
use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Core\SystemEnvironmentBuilder;
use TYPO3\CMS\Core\Domain\RecordFactory;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Fluid\Core\Rendering\RenderingContextFactory;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;
use TYPO3Fluid\Fluid\View\TemplateView;

// Read-only: exercise the installed TCA and the frontend's actual record objects.
putenv('TYPO3_PATH_APP=' . getcwd());
putenv('TYPO3_PATH_ROOT=' . getcwd() . '/public');
$loader = require getcwd() . '/vendor/autoload.php';
SystemEnvironmentBuilder::run(0, SystemEnvironmentBuilder::REQUESTTYPE_CLI);
Bootstrap::init($loader);
$root = dirname(__DIR__, 2);
$values = ['', 'extra-small', 'small', 'medium', 'large', 'extra-large'];
$tca = $GLOBALS['TCA']['tt_content'];
foreach (['space_before_class', 'space_after_class'] as $field) {
    $config = $tca['columns'][$field]['config'];
    if ($config['type'] !== 'select' || $config['renderType'] !== 'selectSingle'
        || $config['default'] !== '' || array_column($config['items'], 'value') !== $values) {
        throw new RuntimeException('Incorrect spacing selector: ' . $field);
    }
}
$types = ['menu_sitemap', 'menu_subpages', 'menu_pages', 'shortcut', 'html'];
foreach (glob($root . '/ContentBlocks/ContentElements/*/config.yaml') as $path) {
    $definition = Yaml::parseFile($path);
    $types[] = $definition['typeName'];
}
foreach ($types as $type) {
    $showitem = $tca['types'][$type]['showitem'];
    if (substr_count($showitem, '--div--;core.form.tabs:appearance') !== 1) {
        throw new RuntimeException('Expected exactly one Appearance tab: ' . $type);
    }
    $appearance = explode('--div--;', explode('--div--;core.form.tabs:appearance,', $showitem, 2)[1], 2)[0];
    $appearance = preg_replace_callback('/--palette--;[^,;]*;([^,]+)/', static function (array $match) use ($tca): string {
        return $tca['palettes'][$match[1]]['showitem'];
    }, $appearance);
    if (array_values(array_filter(explode(',', trim($appearance, ',')))) !== ['space_before_class', 'space_after_class']) {
        throw new RuntimeException('Appearance must contain only the two spacing fields: ' . $type . ' (' . $appearance . ')');
    }
}
$factory = GeneralUtility::makeInstance(RenderingContextFactory::class);
$records = GeneralUtility::makeInstance(RecordFactory::class);
$processor = GeneralUtility::makeInstance(ContentBlocksDataProcessor::class);
$uid = 9000;
$defaults = array_map(static fn(array $column): mixed => $column['config']['default'] ?? '', $tca['columns']);
$defaults = array_replace($defaults, [
    't3ver_wsid' => 0, 't3ver_oid' => 0, 't3ver_state' => 0, 't3ver_stage' => 0,
    'crdate' => 0, 'tstamp' => 0, 'deleted' => 0, 'sorting' => 0,
]);
$render = static function (string $type, string $before, string $after) use ($root, $factory, $records, $processor, $defaults, &$uid): string {
    $row = array_replace($defaults, ['uid' => ++$uid, 'pid' => 1, 'CType' => $type, 'header' => '', 'space_before_class' => $before, 'space_after_class' => $after]);
    $cObj = GeneralUtility::makeInstance(ContentObjectRenderer::class);
    $cObj->setRequest((new ServerRequest())->withAttribute('applicationType', SystemEnvironmentBuilder::REQUESTTYPE_FE));
    $cObj->start($row, 'tt_content');
    $data = str_starts_with($type, 'astryx_')
        ? $processor->process($cObj, [], [], ['data' => $row])['data']
        : $records->createResolvedRecordFromDatabaseRow('tt_content', $row);
    $context = $factory->create();
    $paths = $context->getTemplatePaths();
    $paths->setTemplatePathAndFilename($root . '/Resources/Private/Templates/ContentElements/Generic.html');
    $paths->setLayoutRootPaths([$root . '/Resources/Private/Layouts/ContentElements']);
    $paths->setPartialRootPaths([$root . '/Resources/Private/Partials']);
    $view = new TemplateView($context);
    $view->assignMultiple(['data' => $data, 'content' => '<p>Spacing fixture</p>']);
    $html = $view->render();
    $expected = 'class="astryx-element frame-space-before-' . ($before ?: 'medium') . ' frame-space-after-' . ($after ?: 'medium') . '"';
    if (!str_contains($html, $expected) || substr_count($html, 'id="c' . $uid . '"') !== 1) {
        throw new RuntimeException('Spacing values lost during record transformation/rendering: ' . $type . ' ' . $before . '/' . $after);
    }
    return $html;
};
foreach ($types as $type) {
    $render($type, 'extra-small', 'extra-large');
}
$html = '';
foreach ($values as $before) {
    foreach ($values as $after) {
        $html .= $render('astryx_text', $before, $after);
    }
}
echo in_array('--html', $argv, true) ? $html : 'Spacing: ' . count($types) . " CTypes expose the core selectors; real record transformation and all 36 spacing combinations pass.\n";

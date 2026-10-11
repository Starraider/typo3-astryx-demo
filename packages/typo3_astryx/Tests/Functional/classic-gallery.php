<?php
declare(strict_types=1);

use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Core\SystemEnvironmentBuilder;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
use TYPO3\CMS\Core\Resource\ResourceFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Fluid\Core\Rendering\RenderingContextFactory;
use TYPO3Fluid\Fluid\View\TemplateView;

// Read-only rendering test. Uses existing FAL images; creates no content records.
putenv('TYPO3_PATH_APP=' . getcwd());
putenv('TYPO3_PATH_ROOT=' . getcwd() . '/public');
$loader = require getcwd() . '/vendor/autoload.php';
SystemEnvironmentBuilder::run(0, SystemEnvironmentBuilder::REQUESTTYPE_CLI);
Bootstrap::init($loader);
$GLOBALS['LANG'] = GeneralUtility::makeInstance(LanguageServiceFactory::class)->create('en');
$root = dirname(__DIR__, 2);
$factory = GeneralUtility::makeInstance(RenderingContextFactory::class);
$columns = array_replace_recursive(
    $GLOBALS['TCA']['tt_content']['columns']['astryx_classicgallery_columns']['config'],
    $GLOBALS['TCA']['tt_content']['types']['astryx_classic_gallery']['columnsOverrides']['astryx_classicgallery_columns']['config'] ?? []
);
if ((int)$columns['default'] !== 4 || count($columns['items']) !== 6) {
    throw new RuntimeException('Gallery must default to four and offer one to six columns');
}
$itemsConfig = $GLOBALS['TCA']['tt_content']['columns']['astryx_classicgallery_items']['config'];
if ($itemsConfig['foreign_table'] !== 'tx_astryx_classic_gallery_item') {
    throw new RuntimeException('Missing gallery collection relation');
}
$references = GeneralUtility::makeInstance(ConnectionPool::class)
    ->getConnectionForTable('sys_file_reference')
    ->fetchFirstColumn("SELECT r.uid FROM sys_file_reference r JOIN sys_file f ON f.uid=r.uid_local WHERE r.deleted=0 AND f.missing=0 AND f.type=2 ORDER BY (f.identifier LIKE '%/planets/%'), r.uid LIMIT 3");
if ($references === []) throw new RuntimeException('Rendering fixture requires an existing FAL image reference');
$resources = GeneralUtility::makeInstance(ResourceFactory::class);
$images = array_map(static fn($uid) => $resources->getFileReferenceObject((int)$uid), $references);
$items = [];
foreach (['Scenery', 'Lifestyle', 'Home', 'Scenery', 'Lifestyle', ' Lifestyle ', 'Scenery', 'Home', 'Single', '', 'Scenery'] as $index => $category) {
    $items[] = ['title' => 'Image ' . ($index + 1), 'category' => $category, 'image' => [$images[$index % count($images)]]];
}
$render = static function(array $data, string $template = 'frontend', string $section = '') use ($factory, $root): string {
    $context = $factory->create();
    $paths = $context->getTemplatePaths();
    $paths->setTemplatePathAndFilename($root . '/ContentBlocks/ContentElements/classic-gallery/templates/' . $template . '.fluid.html');
    $paths->setLayoutRootPaths([$root . '/Resources/Private/Layouts/ContentElements']);
    $paths->setPartialRootPaths([$root . '/Resources/Private/Partials']);
    $view = new TemplateView($context);
    $view->assign('data', $data);
    return $section ? $view->renderSection($section, ['data' => $data]) : $view->render();
};
$data = ['uid' => 9001, 'header' => 'Classic Gallery', 'header_layout' => 2, 'heading_size' => 'small', 'subheader' => 'A centered introduction with categories and equal-width image rows.', 'columns' => 4, 'items' => $items];
$html = $render($data);
$document = new DOMDocument();
$document->loadHTML($html);
$xpath = new DOMXPath($document);
if ($xpath->query('//li[@data-gallery-category]')->length !== 11 || $xpath->query('//img[@srcset]')->length !== 11) {
    throw new RuntimeException('Gallery must render all eleven images with responsive sources');
}
$listId = $xpath->query('//ul[contains(@class, "astryx-classic-gallery-tiles")]')->item(0)->getAttribute('id');
if ($xpath->query('//button[@aria-controls="' . $listId . '" and @aria-pressed="true"]')->length !== 1) {
    throw new RuntimeException('Missing accessible All filter');
}
$links = $xpath->query('//a[@data-gallery-open]');
if ($links->length !== 11 || $xpath->query('//dialog[@data-gallery-lightbox and @id]')->length !== 1) {
    throw new RuntimeException('Each image must have an original-image link and a gallery-specific dialog');
}
foreach ($links as $index => $link) {
    $original = $images[$index % count($images)]->getOriginalFile()->getPublicUrl();
    if (ltrim($link->getAttribute('href'), '/') !== ltrim($original, '/')) {
        throw new RuntimeException('Lightbox must link to the uncropped original file, including without JavaScript');
    }
}
foreach (['close', 'previous', 'next'] as $control) {
    if ($xpath->query('//dialog//button[@data-lightbox-' . $control . ' and @aria-label]')->length !== 1) {
        throw new RuntimeException('Missing accessible lightbox control: ' . $control);
    }
}
$empty = $render(array_replace($data, ['uid' => 9010, 'header' => '', 'subheader' => '', 'items' => []]));
if (str_contains($empty, '<li') || str_contains($empty, 'data-gallery-open')) throw new RuntimeException('Empty gallery rendered image placeholders');
$hiddenHeading = $render(array_replace($data, ['header_layout' => 100]));
if (str_contains($hiddenHeading, '<h2')) throw new RuntimeException('Hidden heading must be respected');
$preview = $render($data, 'backend-preview', 'Content');
if (substr_count($preview, '<img') !== 11 || !str_contains($preview, 'Lifestyle')) {
    throw new RuntimeException('Backend preview must render thumbnails and categories');
}
if (in_array('--html', $argv, true)) {
    echo $html;
    foreach ([1,2,3,5,6] as $limit) {
        echo $render(array_replace($data, ['uid' => 9001 + $limit, 'header' => 'Maximum ' . $limit, 'columns' => $limit]));
    }
    echo $render(array_replace($data, ['uid' => 9020, 'header' => 'Two images', 'items' => array_slice($items, 0, 2)]));
    echo $render(array_replace($data, ['uid' => 9021, 'header' => 'No categories', 'items' => [['title' => 'Uncategorized', 'category' => '', 'image' => [$images[0]]]]]));
    echo $empty;
} else {
    echo "Classic Gallery: TCA defaults, FAL images, responsive sources, original-image lightbox links, dialog controls, hidden heading, empty state and backend preview passed.\n";
}

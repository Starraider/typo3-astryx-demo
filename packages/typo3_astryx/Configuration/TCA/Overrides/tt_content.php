<?php
declare(strict_types=1);
defined('TYPO3') or die();
use B13\Container\Tca\ContainerConfiguration;
$grid = new ContainerConfiguration('astryx_container_two_col', '', '', [[
    ['name' => 'LLL:EXT:typo3_astryx/Resources/Private/Language/locallang.xlf:left', 'colPos' => 201],
    ['name' => 'LLL:EXT:typo3_astryx/Resources/Private/Language/locallang.xlf:right', 'colPos' => 202],
]]);
$GLOBALS['TCA']['tt_content']['containerConfiguration'][$grid->getCType()] = $grid->toArray();

foreach (['menu_sitemap','menu_subpages','shortcut','html'] as $type) {
    \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addPlugin(['label' => 'Astryx ' . $type, 'value' => $type], 'CType');
    $GLOBALS['TCA']['tt_content']['types'][$type]['showitem'] = 'header,header_layout,header_position,header_link,' . match ($type) {
        'menu_subpages' => 'pages', 'shortcut' => 'records', 'html' => 'bodytext', default => '',
    } . ',--div--;core.form.tabs:appearance,--palette--;;astryx_spacing,--div--;Access,hidden,starttime,endtime';
}

// Keep TYPO3's translated choices and link browser; order alignment like the editor guide.
$alignmentItems = array_column($GLOBALS['TCA']['tt_content']['columns']['header_position']['config']['items'], null, 'value');
$GLOBALS['TCA']['tt_content']['columns']['header_position']['config']['items'] = array_values(
    array_replace(array_fill_keys(['', 'left', 'center', 'right'], []), $alignmentItems),
);

// Reuse the core selectors (including their translated labels and six options).
$GLOBALS['TCA']['tt_content']['palettes']['astryx_spacing'] = [
    'label' => 'core.form.palettes:content_layout',
    'showitem' => 'space_before_class,space_after_class',
];

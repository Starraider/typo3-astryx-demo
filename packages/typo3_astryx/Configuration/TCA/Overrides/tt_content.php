<?php
declare(strict_types=1);
defined('TYPO3') or die();
use B13\Container\Tca\ContainerConfiguration;
foreach ([
    'astryx_container_single_col' => [1],
    'astryx_container_two_col' => [1, 1],
    'astryx_container_two_col_25_75' => [1, 3],
    'astryx_container_two_col_75_25' => [3, 1],
    'astryx_container_three_col' => [1, 1, 1],
    'astryx_container_four_col' => [1, 1, 1, 1],
] as $type => $spans) {
    $columns = [];
    foreach ($spans as $index => $span) {
        $label = count($spans) === 2 ? ['left', 'right'][$index] : 'column.' . ($index + 1);
        $columns[] = [
            'name' => 'LLL:EXT:typo3_astryx/Resources/Private/Language/locallang.xlf:' . $label,
            'colPos' => 201 + $index,
            'colspan' => $span,
        ];
    }
    $grid = new ContainerConfiguration($type, '', '', [$columns]);
    $GLOBALS['TCA']['tt_content']['containerConfiguration'][$grid->getCType()] = $grid->toArray();
}

foreach (['menu_sitemap','menu_subpages','menu_pages','shortcut','html'] as $type) {
    $item = [
        'label' => 'Astryx ' . $type,
        'value' => $type,
        'icon' => 'astryx-' . str_replace('_', '-', $type),
    ];
    // Use core categories in both the wizard and the CType selector.
    $item['group'] = match ($type) {
        'menu_sitemap', 'menu_subpages', 'menu_pages' => 'menu',
        'shortcut', 'html' => 'special',
    };
    $GLOBALS['TCA']['tt_content']['ctrl']['typeicon_classes'][$type] = $item['icon'];
    if ($type === 'menu_sitemap') {
        $item['label'] = 'LLL:EXT:typo3_astryx/Resources/Private/Language/locallang.xlf:menuSitemap';
    }
    if ($type === 'menu_subpages') {
        $item['label'] = 'LLL:EXT:typo3_astryx/Resources/Private/Language/locallang.xlf:menuSubpages';
    }
    if ($type === 'menu_pages') {
        $item['label'] = 'LLL:EXT:typo3_astryx/Resources/Private/Language/locallang.xlf:menuPages';
        // Keep the core ordered, multi-page relation picker and page browser.
        $GLOBALS['TCA']['tt_content']['types'][$type]['columnsOverrides']['pages'] = [
            'label' => 'LLL:EXT:typo3_astryx/Resources/Private/Language/locallang.xlf:menuPages.pages',
            'description' => 'LLL:EXT:typo3_astryx/Resources/Private/Language/locallang.xlf:menuPages.pages.description',
        ];
    }
    // TYPO3 14 registers CType items directly; the second argument is a FlexForm.
    \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addPlugin($item);
    $GLOBALS['TCA']['tt_content']['types'][$type]['showitem'] = 'header,--palette--;;astryx_heading_controls,header_link,' . match ($type) {
        'menu_subpages', 'menu_pages' => 'pages', 'shortcut' => 'records', 'html' => 'bodytext', default => '',
    } . ',--div--;core.form.tabs:appearance,--palette--;;astryx_spacing,--div--;Access,hidden,starttime,endtime';
}

// Name the semantic heading levels while preserving core values, Default and Hidden.
foreach ($GLOBALS['TCA']['tt_content']['columns']['header_layout']['config']['items'] as &$item) {
    if (in_array((string)$item['value'], ['1', '2', '3', '4', '5'], true)) {
        $item['label'] = 'LLL:EXT:typo3_astryx/Resources/Private/Language/locallang.xlf:header_layout.' . $item['value'];
    }
}
unset($item);

// Keep TYPO3's translated choices and link browser; order alignment like the editor guide.
$alignmentItems = array_column($GLOBALS['TCA']['tt_content']['columns']['header_position']['config']['items'], null, 'value');
$GLOBALS['TCA']['tt_content']['columns']['header_position']['config']['items'] = array_values(
    array_replace(array_fill_keys(['', 'left', 'center', 'right'], []), $alignmentItems),
);

// Reuse the core selectors (including their translated labels and six options).
$GLOBALS['TCA']['tt_content']['palettes']['astryx_heading_controls'] = [
    'showitem' => 'header_layout,header_position',
];

$GLOBALS['TCA']['tt_content']['palettes']['astryx_spacing'] = [
    'label' => 'core.form.palettes:content_layout',
    'showitem' => 'space_before_class,space_after_class',
];

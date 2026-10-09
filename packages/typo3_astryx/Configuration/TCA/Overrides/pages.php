<?php
declare(strict_types=1);
defined('TYPO3') or die();
use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;
ExtensionManagementUtility::addTCAcolumns('pages', [
    'tx_astryx_theme' => ['label' => 'LLL:EXT:typo3_astryx/Resources/Private/Language/locallang.xlf:theme',
        'config' => ['type' => 'select', 'renderType' => 'selectSingle', 'items' => [
            ['label' => 'Inherit', 'value' => ''], ['label' => 'Neutral', 'value' => 'neutral'],
            ['label' => 'Stone', 'value' => 'stone'], ['label' => 'Ocean', 'value' => 'ocean']]]],
    'tx_astryx_mode' => ['label' => 'LLL:EXT:typo3_astryx/Resources/Private/Language/locallang.xlf:mode',
        'config' => ['type' => 'select', 'renderType' => 'selectSingle', 'items' => [
            ['label' => 'Inherit', 'value' => ''], ['label' => 'System', 'value' => 'system'],
            ['label' => 'Light', 'value' => 'light'], ['label' => 'Dark', 'value' => 'dark']]]],
]);
ExtensionManagementUtility::addToAllTCAtypes('pages', 'tx_astryx_theme,tx_astryx_mode', '', 'after:backend_layout');

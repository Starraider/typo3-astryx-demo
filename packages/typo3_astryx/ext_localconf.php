<?php
declare(strict_types=1);
defined('TYPO3') or die();
\Vendor\StylexConnector\Configuration\StylexRegistry::registerManifest(
    'typo3_astryx', 'EXT:typo3_astryx/Resources/Public/StylexManifest/stylex-manifest.json'
);
$GLOBALS['TYPO3_CONF_VARS']['RTE']['Presets']['astryx'] = 'EXT:typo3_astryx/Configuration/RTE/Default.yaml';


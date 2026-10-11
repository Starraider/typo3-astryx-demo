<?php
$EM_CONF[$_EXTKEY] = [
    'title' => 'TYPO3 Astryx',
    'description' => 'Native Astryx editorial components and page layouts',
    'category' => 'fe',
    'state' => 'beta',
    'author' => 'Sven Kalbhenn',
    'author_email' => 'sven@skom.de',
    'version' => '0.1.0',
    'constraints' => [
        'depends' => [
            'typo3' => '14.3.0-14.3.99',
            'php' => '8.3.0-8.4.99',
            'content_blocks' => '2.4.10-2.99.99',
            'container' => '4.1.0-4.99.99',
            'stylex_connector' => '1.0.0-2.99.99',
            'vite_asset_collector' => '1.18.0-1.99.99',
        ],
        'conflicts' => [
            'fluid_styled_content' => '',
        ],
        'suggests' => [
            'seo' => '',
        ],
    ],
];

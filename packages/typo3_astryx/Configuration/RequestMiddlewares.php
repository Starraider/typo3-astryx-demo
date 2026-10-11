<?php
declare(strict_types=1);

return [
    'frontend' => [
        'skom/typo3-astryx/occurrence-identifiers' => [
            'target' => \Skom\Typo3Astryx\Middleware\OccurrenceIdentifiers::class,
            'after' => ['typo3/cms-frontend/site'],
            'before' => ['typo3/cms-frontend/page-resolver'],
        ],
    ],
];

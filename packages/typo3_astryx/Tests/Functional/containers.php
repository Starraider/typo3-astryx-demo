<?php
declare(strict_types=1);

// Read-only: check installed container grids, labels, icons and actual editor forms.
use TYPO3\CMS\Backend\Form\FormDataCompiler;
use TYPO3\CMS\Backend\Form\FormDataGroup\TcaDatabaseRecord;
use TYPO3\CMS\Core\Authentication\CommandLineUserAuthentication;
use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Core\SystemEnvironmentBuilder;
use TYPO3\CMS\Core\Http\NormalizedParams;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\CMS\Core\Imaging\IconFactory;
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;

putenv('TYPO3_PATH_APP=' . getcwd());
putenv('TYPO3_PATH_ROOT=' . getcwd() . '/public');
$loader = require getcwd() . '/vendor/autoload.php';
SystemEnvironmentBuilder::run(0, SystemEnvironmentBuilder::REQUESTTYPE_CLI);
Bootstrap::init($loader);
Bootstrap::initializeBackendUser(CommandLineUserAuthentication::class);
Bootstrap::initializeBackendAuthentication();
$GLOBALS['BE_USER']->initializeUserSessionManager();
$GLOBALS['LANG'] = GeneralUtility::makeInstance(LanguageServiceFactory::class)->create('en');
$request = (new ServerRequest('https://typo3-astryx.ddev.site/typo3/'))->withAttribute('applicationType', SystemEnvironmentBuilder::REQUESTTYPE_BE);
$request = $request->withAttribute('normalizedParams', NormalizedParams::createFromRequest($request));
foreach ([
    'astryx_container_two_col' => [[1, 1], 'Container 2-col 50/50'],
    'astryx_container_two_col_25_75' => [[1, 3], 'Container 2-col 25/75'],
    'astryx_container_two_col_75_25' => [[3, 1], 'Container 2-col 75/25'],
    'astryx_container_three_col' => [[1, 1, 1], 'Container 3-col'],
    'astryx_container_four_col' => [[1, 1, 1, 1], 'Container 4-col'],
] as $type => [$spans, $label]) {
    $grid = $GLOBALS['TCA']['tt_content']['containerConfiguration'][$type]['grid'][0];
    if (array_column($grid, 'colPos') !== range(201, 200 + count($spans)) || array_column($grid, 'colspan') !== $spans) throw new RuntimeException('Incorrect grid for ' . $type);
    foreach (['en', 'de'] as $language) {
        $service = GeneralUtility::makeInstance(LanguageServiceFactory::class)->create($language);
        foreach ($grid as $index => $column) {
            $expected = count($spans) === 2
                ? ($language === 'en' ? ['Left column', 'Right column'] : ['Linke Spalte', 'Rechte Spalte'])[$index]
                : ($language === 'en' ? 'Column ' : 'Spalte ') . ($index + 1);
            if ($service->sL($column['name']) !== $expected) throw new RuntimeException('Unresolved grid column label');
        }
    }
    $form = GeneralUtility::makeInstance(FormDataCompiler::class)->compile([
        'request' => $request, 'command' => 'new', 'tableName' => 'tt_content', 'vanillaUid' => 1,
        'defaultValues' => ['tt_content' => ['CType' => $type]],
    ], GeneralUtility::makeInstance(TcaDatabaseRecord::class));
    $item = array_values(array_filter($form['processedTca']['columns']['CType']['config']['items'], static fn(array $item): bool => $item['value'] === $type))[0];
    if ($item['label'] !== $label) throw new RuntimeException('Unresolved container label: ' . $item['label']);
    $showitem = $form['processedTca']['types'][$type]['showitem'];
    if (str_contains($showitem, '_ratio') !== ($type === 'astryx_container_two_col')) throw new RuntimeException('Incorrect fixed-ratio form');
    $gap = array_values(array_filter($form['processedTca']['columns'], static fn(array $column): bool => ($column['config']['type'] ?? '') === 'select' && array_column($column['config']['items'] ?? [], 'value') === ['normal', 'small', 'large']));
    if (count($gap) !== 1 || $gap[0]['config']['default'] !== 'normal') throw new RuntimeException('Missing gap choices/default');
    $icon = GeneralUtility::makeInstance(IconFactory::class)->getIconForRecord('tt_content', ['CType' => $type])->render();
    if (!str_contains($icon, 'icon.svg')) throw new RuntimeException('Missing container icon');
}
echo "Containers: five editor labels/forms/icons, English/German column labels, column positions, backend spans and gap defaults passed.\n";

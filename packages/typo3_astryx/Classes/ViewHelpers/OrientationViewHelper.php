<?php
declare(strict_types=1);
namespace Skom\Typo3Astryx\ViewHelpers;

use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;

final class OrientationViewHelper extends AbstractViewHelper
{
    public function initializeArguments(): void
    {
        $this->registerArgument('value', 'int', 'TYPO3 media orientation', false, 0);
    }

    /** @return array{vertical: string, horizontal: string, noWrap: bool} */
    public function render(): array
    {
        $value = (int)$this->arguments['value'];

        // Match the positions of TYPO3's existing imageorient field and GalleryProcessor.
        return [
            'vertical' => match ($value) {
                8, 9, 10 => 'below',
                17, 18, 25, 26 => 'intext',
                default => 'above',
            },
            'horizontal' => match ($value) {
                1, 9, 17, 25 => 'right',
                2, 10, 18, 26 => 'left',
                default => 'center',
            },
            'noWrap' => in_array($value, [25, 26], true),
        ];
    }
}

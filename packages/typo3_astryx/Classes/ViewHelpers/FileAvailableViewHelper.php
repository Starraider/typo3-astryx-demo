<?php
declare(strict_types=1);
namespace Skom\Typo3Astryx\ViewHelpers;
use TYPO3\CMS\Core\Resource\FileReference;
use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;
final class FileAvailableViewHelper extends AbstractViewHelper
{
    public function initializeArguments(): void { $this->registerArgument('file', FileReference::class, 'Resolved FAL reference', true); }
    public function render(): bool { try { return !$this->arguments['file']->getOriginalFile()->isMissing(); } catch (\TYPO3\CMS\Core\Resource\Exception\FileDoesNotExistException) { return false; } }
}

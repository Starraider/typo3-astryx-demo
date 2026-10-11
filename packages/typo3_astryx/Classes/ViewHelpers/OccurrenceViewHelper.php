<?php
declare(strict_types=1);

namespace Skom\Typo3Astryx\ViewHelpers;

use Psr\Http\Message\ServerRequestInterface;
use Skom\Typo3Astryx\Rendering\OccurrenceIdentifiers;
use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;

/** Allocate once at a rendering boundary; pass the result to all descendants. */
final class OccurrenceViewHelper extends AbstractViewHelper
{
    /** @var \WeakMap<object, OccurrenceIdentifiers>|null Standalone Fluid/CLI contexts only. */
    private static ?\WeakMap $standalone = null;

    public function initializeArguments(): void
    {
        $this->registerArgument('prefix', 'string', 'Readable component namespace', false, 'component');
        $this->registerArgument('recordUid', 'int', 'Rendered record UID for its canonical anchor', false, 0);
    }

    public function render(): array
    {
        $request = $this->renderingContext->hasAttribute(ServerRequestInterface::class)
            ? $this->renderingContext->getAttribute(ServerRequestInterface::class) : null;
        $identifiers = $request?->getAttribute(OccurrenceIdentifiers::class);
        if (!$identifiers instanceof OccurrenceIdentifiers) {
            self::$standalone ??= new \WeakMap();
            $key = $request ?? $this->renderingContext;
            $identifiers = self::$standalone[$key] ??= new OccurrenceIdentifiers();
        }
        return $identifiers->allocate($this->arguments['prefix'], $this->arguments['recordUid']);
    }
}

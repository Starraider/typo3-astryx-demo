<?php
declare(strict_types=1);
namespace Skom\Typo3Astryx\ViewHelpers;

use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;

/** Conservative fallback bounds for shipped styles; lazy auto-sizes uses the real slot. */
final class ImageSizesViewHelper extends AbstractViewHelper
{
    public function initializeArguments(): void
    {
        $this->registerArgument('profile', 'string', 'Image consumer', false, 'default');
        $this->registerArgument('columns', 'string', 'Configured column count', false, 'three');
    }

    public function render(): string
    {
        // Bounds assume the standard 72rem host. Custom CSS callers can pass sizes directly.
        // 24px is twice the smallest shipped Card padding (Stone/compact), so other themes
        // cannot be undersized. Actual padding, borders and nested widths are covered by auto.
        return match ($this->arguments['profile']) {
            'card' => 'max(1px, min(calc(100vw - 24px), calc(72rem - 24px)))',
            'carousel' => 'max(1px, calc(min(85vw, 22rem) - 24px))',
            'image-only' => $this->fixedGrid(),
            'card-grid' => $this->cardGrid(),
            // Flex rows (including filtered/incomplete rows) can expand to one full-width tile.
            'gallery' => 'min(100vw, 72rem)',
            'textmedia' => 'min(100vw, 36rem)',
            default => '100vw',
        };
    }

    private function fixedGrid(): string
    {
        $columns = match ($this->arguments['columns']) {
            'one' => 1, 'two' => 2, 'four' => 4, 'five' => 5, 'six' => 6, default => 3,
        };
        $gaps = ($columns - 1) * 16;
        return "max(1px, calc((min(100vw, 72rem) - {$gaps}px) / {$columns}))";
    }

    private function cardGrid(): string
    {
        // Before the explicit container breakpoint, auto-fit may leave one occupied track.
        // Viewport-based column division would undersize images in nested hosts.
        $limit = match ($this->arguments['columns']) {
            'two' => 40, 'three' => 54, 'four' => 68, default => 72,
        };
        return "max(1px, calc(min(100vw, {$limit}rem) - 24px))";
    }
}

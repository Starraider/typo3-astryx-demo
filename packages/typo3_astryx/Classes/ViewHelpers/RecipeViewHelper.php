<?php
declare(strict_types=1);
namespace Skom\Typo3Astryx\ViewHelpers;
use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;
use Vendor\StylexConnector\Service\StylexManifestService;
/** Finite keys avoid accidental dynamic recipes or silent missing styles. */
final class RecipeViewHelper extends AbstractViewHelper
{
    private const RECIPES = [
        'Button' => ['variant' => ['primary', 'secondary', 'ghost', 'destructive'], 'size' => ['small', 'medium', 'large']],
        'Badge' => ['variant' => ['neutral', 'accent', 'success', 'warning', 'error']],
        'StatusDot' => ['variant' => ['neutral', 'accent', 'success', 'warning', 'error']],
        'Heading' => ['size' => ['medium', 'small', 'large', 'display'], 'align' => ['start', 'center', 'end', 'left', 'right']],
        'Text' => ['width' => ['prose', 'full'], 'density' => ['normal', 'compact']],
        'Divider' => ['variant' => ['subtle', 'strong']],
        'Card' => ['variant' => ['outlined', 'elevated', 'flat'], 'padding' => ['normal', 'compact']],
        'Grid' => ['ratio' => ['50-50', '66-33', '33-66', '25-75', '75-25'], 'gap' => ['normal', 'small', 'large'], 'columns' => ['auto', 'two', 'three', 'four']],
        'SingleColumn' => ['background' => ['light', 'dark'], 'width' => ['constrained', 'full-bleed']],
        'Notice' => ['variant' => ['neutral', 'accent', 'success', 'warning', 'error']],
        'CarouselPagination' => ['position' => ['bottom-center', 'top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-right']],
        'CarouselControl' => ['kind' => ['dot', 'arrow']],
        'CarouselIndicator' => [],
        'ImageOnly' => ['columns' => ['three', 'one', 'two', 'four', 'five', 'six']],
        'Icon' => ['size' => ['small', 'medium', 'large']],
        'SideNav' => ['part' => ['list', 'item']],
        'Dropdown' => ['part' => ['panel', 'row', 'link', 'toggle']],
        'TreeList' => ['part' => ['list', 'group', 'row', 'link', 'toggle']]
    ];
    public function __construct(private readonly StylexManifestService $manifest) {}
    public function initializeArguments(): void
    {
        $this->registerArgument('name', 'string', 'Recipe name', true);
        $this->registerArgument('options', 'array', 'Allowlisted recipe dimensions', false, []);
    }
    public function render(): string
    {
        $name = $this->arguments['name'];
        if (!isset(self::RECIPES[$name])) { throw new \InvalidArgumentException('Unknown Astryx recipe: ' . $name); }
        $keys = ['Astryx' . $name . '.root'];
        foreach (self::RECIPES[$name] as $dimension => $values) {
            $value = $this->arguments['options'][$dimension] ?? $values[0];
            $value = in_array($value, $values, true) ? $value : $values[0];
            $keys[] = 'Astryx' . $name . '.' . $dimension . '_' . str_replace('-', '_', $value);
        }
        return $this->manifest->getClasses(...$keys);
    }
}

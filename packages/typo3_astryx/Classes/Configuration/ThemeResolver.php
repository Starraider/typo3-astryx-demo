<?php
declare(strict_types=1);
namespace Skom\Typo3Astryx\Configuration;
final class ThemeResolver
{
    public const THEMES = ['neutral', 'stone', 'ocean'];
    public const MODES = ['system', 'light', 'dark'];
    /** Rootline is ordered from the current page towards the site root. */
    public function resolve(array $rootline, array $settings): array
    {
        $theme = in_array($settings['Astryx.theme'] ?? '', self::THEMES, true) ? $settings['Astryx.theme'] : 'neutral';
        $mode = in_array($settings['Astryx.mode'] ?? '', self::MODES, true) ? $settings['Astryx.mode'] : 'system';
        foreach (array_reverse($rootline) as $page) {
            if (in_array($page['tx_astryx_theme'] ?? '', self::THEMES, true)) { $theme = $page['tx_astryx_theme']; }
            if (in_array($page['tx_astryx_mode'] ?? '', self::MODES, true)) { $mode = $page['tx_astryx_mode']; }
        }
        return ['theme' => $theme, 'mode' => $mode,
            'allowUserMode' => (bool)($settings['Astryx.allowUserMode'] ?? true)];
    }
}

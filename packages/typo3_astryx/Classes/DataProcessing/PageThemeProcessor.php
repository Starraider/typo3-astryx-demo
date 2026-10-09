<?php
declare(strict_types=1);
namespace Skom\Typo3Astryx\DataProcessing;
use Skom\Typo3Astryx\Configuration\ThemeResolver;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;
use TYPO3\CMS\Frontend\ContentObject\DataProcessorInterface;
final readonly class PageThemeProcessor implements DataProcessorInterface
{
    public function __construct(private ThemeResolver $resolver) {}
    public function process(ContentObjectRenderer $cObj, array $contentObjectConfiguration, array $processorConfiguration, array $processedData): array
    {
        $request = $cObj->getRequest();
        $information = $request->getAttribute('frontend.page.information');
        $settings = $request->getAttribute('site')->getSettings()->getAllFlat();
        foreach ($information->getRootLine() as $page) {
            $request->getAttribute('frontend.cache.collector')?->addCacheTags(new \TYPO3\CMS\Core\Cache\CacheTag('pages_' . $page['uid']));
        }
        $processedData['astryx'] = $this->resolver->resolve($information->getRootLine(), $settings);
        $width = (string)($settings['Astryx.contentWidth'] ?? '72rem');
        $processedData['astryx']['contentWidth'] = preg_match('/^[1-9][0-9]*(?:\.[0-9]+)?(?:rem|em|px)$/D', $width) ? $width : '72rem';
        return $processedData;
    }
}

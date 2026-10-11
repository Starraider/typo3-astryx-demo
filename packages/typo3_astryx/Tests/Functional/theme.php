<?php
declare(strict_types=1);

use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Core\SystemEnvironmentBuilder;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\CMS\Core\Http\NormalizedParams;
use TYPO3\CMS\Core\Http\Uri;
use TYPO3\CMS\Core\Site\SiteFinder;
use TYPO3\CMS\Core\TypoScript\FrontendTypoScript;
use TYPO3\CMS\Core\TypoScript\AST\Node\RootNode;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Fluid\Core\Rendering\RenderingContextFactory;
use TYPO3Fluid\Fluid\View\TemplateView;

// Read-only typography/semantic component fixture, rendered by real Fluid components.
putenv('TYPO3_PATH_APP=' . getcwd());
putenv('TYPO3_PATH_ROOT=' . getcwd() . '/public');
$loader = require getcwd() . '/vendor/autoload.php';
SystemEnvironmentBuilder::run(0, SystemEnvironmentBuilder::REQUESTTYPE_CLI);
Bootstrap::init($loader);
$root = dirname(__DIR__, 2);
$factory = GeneralUtility::makeInstance(RenderingContextFactory::class);
$site = GeneralUtility::makeInstance(SiteFinder::class)->getSiteByPageId(1);
$typoScript = new FrontendTypoScript(new RootNode(), [], [], []);
$typoScript->setSetupTree(new RootNode());
$typoScript->setSetupArray([]);
$typoScript->setConfigArray([]);
$request = (new ServerRequest(new Uri('https://typo3-astryx.ddev.site/')))
    ->withAttribute('applicationType', SystemEnvironmentBuilder::REQUESTTYPE_FE)
    ->withAttribute('site', $site)->withAttribute('language', $site->getDefaultLanguage())
    ->withAttribute('frontend.typoscript', $typoScript);
$request = $request->withAttribute('normalizedParams', NormalizedParams::createFromRequest($request));
$render = static function (string $source, array $data = [], bool $preview = false) use ($factory, $root, $request): string {
    $context = $factory->create([], $request);
    $paths = $context->getTemplatePaths();
    $paths->setTemplateSource($source);
    $paths->setLayoutRootPaths([$root . '/Resources/Private/Layouts/ContentElements']);
    $paths->setPartialRootPaths([$root . '/Resources/Private/Partials']);
    $view = new TemplateView($context);
    $view->assign('data', $data);
    return $preview ? $view->renderSection('Content', ['data' => $data]) : $view->render();
};
$source = '<section class="theme-example">';
foreach (range(1, 6) as $level) $source .= '<astryx:heading level="' . $level . '" text="Heading ' . $level . ' — Stone typography" />';
$source .= '<div data-test="display"><astryx:heading size="display" text="Stone" /></div><astryx:text text="Body text — Figtree, 14 pixels. ÄÖÜ äöü ß." /><p class="astryx-lead">Secondary text uses the Stone palette.</p><div class="astryx-prose"><small>Supporting text</small><p><code>const theme = "stone";</code></p></div><div class="example-row">';
foreach (['neutral', 'accent', 'success', 'warning', 'error'] as $variant) $source .= '<span data-badge="' . $variant . '"><astryx:badge text="' . ucfirst($variant) . '" variant="' . $variant . '" /></span>';
$source .= '</div><div class="example-row">';
foreach (['primary', 'secondary', 'destructive'] as $variant) $source .= '<span data-button="' . $variant . '"><astryx:button label="' . ucfirst($variant) . '" variant="' . $variant . '" /></span>';
$source .= '</div><astryx:card title="Stone card" variant="outlined"><p>A quiet, neutral card surface.</p></astryx:card>';
foreach (['accent', 'success', 'warning', 'error'] as $variant) $source .= '<aside data-notice="' . $variant . '" class="{ax:recipe(name: \'Notice\', options: {variant: \'' . $variant . '\'})}"><astryx:heading text="' . ucfirst($variant) . ' notice" level="4" /><astryx:text text="Stone status colors apply to the heading and body." /></aside>';
$source .= '<pre class="astryx-code-block"><code><span class="hljs-keyword">const</span> <span class="hljs-variable">theme</span> = <span class="hljs-string">"stone"</span>; <span class="hljs-comment">// syntax palette</span></code></pre></section>';
$html = $render($source);
if (!str_contains($html, 'astryx-heading') || str_contains($html, 'ax:recipe')) throw new RuntimeException('Theme components did not render.');
file_put_contents(getenv('ASTRYX_THEME_HTML') ?: '/tmp/astryx-theme-fixtures.html', $html);
echo "Theme fixture: six semantic headings, display, body/supporting/code, five badges, three buttons, card and four notice variants rendered.\n";

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

// Read-only: uses installed TCA, real record transformation and frontend templates.
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
$context = $factory->create([], $request);
$context->getTemplatePaths()->setTemplateSource('<astryx:sideNav items="{items}" />');
$view = new TemplateView($context);
$view->assign('items', [
    ['link' => 'https://example.org/current', 'title' => 'Current & page', 'current' => true, 'active' => true, 'target' => ''],
    ['link' => 'https://example.org/ancestor', 'title' => 'Active ancestor', 'current' => false, 'active' => true, 'target' => ''],
    ['link' => 'https://example.org/other', 'title' => '<script>unsafe</script> Other', 'current' => false, 'active' => false, 'target' => '_blank'],
    ['link' => 'https://example.org/long', 'title' => str_repeat('Long page title ', 12), 'current' => false, 'active' => false, 'target' => ''],
]);
$html = $view->render();
$dom = new DOMDocument();
@$dom->loadHTML('<?xml encoding="UTF-8">' . $html);
$x = new DOMXPath($dom);
$links = $x->query('//ul/li/a');
if ($links->length !== 4 || $x->query('//a[@aria-current="page"]')->length !== 1 || $x->query('//a[@data-active="true"]')->length !== 2) throw new RuntimeException('Current/active semantics lost.');
if ($links->item(2)->getAttribute('target') !== '_blank' || $links->item(0)->getAttribute('href') !== 'https://example.org/current') throw new RuntimeException('Typolink destination/target lost.');
if ($x->query('//script|//img|//svg')->length || $links->item(2)->textContent !== '<script>unsafe</script> Other') throw new RuntimeException('Page title escaping failed.');
if (in_array('--html', $argv, true)) echo $html;
else echo "SideNav: current/active semantics, link targets and escaping passed.\n";

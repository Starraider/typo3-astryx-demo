<?php
declare(strict_types=1);

use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Core\SystemEnvironmentBuilder;
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\CMS\Core\Http\Uri;
use TYPO3\CMS\Core\Site\Entity\SiteLanguage;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Fluid\Core\Rendering\RenderingContextFactory;
use TYPO3Fluid\Fluid\View\TemplateView;

// Read-only test of the installed TCA and the actual Fluid templates.
putenv('TYPO3_PATH_APP=' . getcwd());
putenv('TYPO3_PATH_ROOT=' . getcwd() . '/public');
$loader = require getcwd() . '/vendor/autoload.php';
SystemEnvironmentBuilder::run(0, SystemEnvironmentBuilder::REQUESTTYPE_CLI);
Bootstrap::init($loader);
$GLOBALS['LANG'] = GeneralUtility::makeInstance(LanguageServiceFactory::class)->create('en');
$root = dirname(__DIR__, 2);
$factory = GeneralUtility::makeInstance(RenderingContextFactory::class);
$fields = $GLOBALS['TCA']['tt_content']['columns'];
$codeConfig = $fields['astryx_codeblock_code']['config'];
if ($codeConfig['type'] !== 'text' || ($codeConfig['enableRichtext'] ?? false) || str_contains($codeConfig['eval'] ?? '', 'trim')) {
    throw new RuntimeException('Code must be plain text with no whitespace trimming');
}
if (count($fields['astryx_codeblock_language']['config']['items']) !== 11 || (int)$fields['astryx_codeblock_line_numbers']['config']['default'] !== 0) {
    throw new RuntimeException('Missing languages or incorrect line-number default');
}
$render = static function (array $data, string $template = 'frontend', string $section = '', string $locale = 'en') use ($factory, $root): string {
    $request = (new ServerRequest())->withAttribute('applicationType', SystemEnvironmentBuilder::REQUESTTYPE_FE)->withAttribute('language', new SiteLanguage(0, $locale, new Uri('/'), ['typo3Language' => $locale]));
    $context = $factory->create([], $request);
    $paths = $context->getTemplatePaths();
    $paths->setTemplatePathAndFilename($root . '/ContentBlocks/ContentElements/code-block/templates/' . $template . '.fluid.html');
    $paths->setLayoutRootPaths([$root . '/Resources/Private/Layouts/ContentElements']);
    $paths->setPartialRootPaths([$root . '/Resources/Private/Partials']);
    $view = new TemplateView($context);
    $view->assign('data', $data);
    return $section ? $view->renderSection($section, ['data' => $data]) : $view->render();
};
$samples = [
    'javascript' => "// Preserve indentation and trailing newline\nexport function greet(name) {\n\treturn `Hello, \${name}!`;\n}\n",
    'typescript' => "interface User { name: string; }\nconst user: User = {name: 'Ada'};",
    'css' => ".example {\n  color: #6639ba;\n}",
    'html' => '<script>window.codeWasExecuted = true;</script>' . "\n" . '<div class="example">Hello & goodbye</div>',
    'php' => "<?php\nfunction greet(string \$name): string {\n    return 'Hello ' . \$name;\n}",
    'python' => "def greet(name):\n    return f'Hello, {name}!'",
    'rust' => "fn main() {\n    println!(\"Hello, world!\");\n}",
    'bash' => "#!/usr/bin/env bash\n# Installation\nnpm install highlight.js",
    'json' => "{\n  \"name\": \"astryx\",\n  \"enabled\": true\n}",
    'yaml' => "name: astryx\nfeatures:\n  - code-block",
    'plaintext' => "  <untrusted> & {curly braces}\n\tText stays exactly as entered.\n\n",
];
$html = '';
$uid = 9000;
foreach ($samples as $index => $code) {
    $data = ['uid' => ++$uid, 'language' => $index, 'filename' => $index === 'javascript' ? 'greet.js' : '', 'line_numbers' => (int)in_array($index, ['javascript', 'html', 'python', 'plaintext'], true), 'code' => $code];
    $rendered = $render($data);
    $document = new DOMDocument();
    @$document->loadHTML('<?xml encoding="UTF-8">' . $rendered);
    $xpath = new DOMXPath($document);
    if ($xpath->query('//pre/code')->item(0)->textContent !== $code || $xpath->query('//script')->length !== 0) {
        throw new RuntimeException('Snippet must preserve whitespace and escape markup: ' . $index);
    }
    if ($xpath->query('//button[@data-code-copy and @hidden and @aria-label="Copy code"]')->length !== 1) {
        throw new RuntimeException('Missing translated progressive copy control');
    }
    if ($index !== 'javascript' && str_contains($rendered, 'astryx-code-block-filename')) {
        throw new RuntimeException('Optional filename rendered an empty label');
    }
    $preview = $render($data, 'backend-preview', 'Content');
    if (!str_contains($preview, 'astryx-code-preview') || str_contains($preview, '<script>')) {
        throw new RuntimeException('Backend preview must escape code');
    }
    $html .= $rendered;
}
$hostile = $render(['uid' => 9099, 'language' => 'html', 'filename' => '<img src=x onerror=alert(1)>', 'line_numbers' => 0, 'code' => '</code></pre><script>alert(1)</script>']);
if (str_contains($hostile, '<script>') || str_contains($hostile, '<img src=x')) throw new RuntimeException('Code and filename escaping failed');
$translated = $render(['uid' => 9100, 'language' => 'plaintext', 'filename' => '', 'line_numbers' => 0, 'code' => ''], 'frontend', '', 'de');
if (!str_contains($translated, 'Code kopieren') || !str_contains($translated, 'Klartext')) {
    throw new RuntimeException('German copy and language labels must resolve');
}
echo in_array('--html', $argv, true) ? $html : "Code Block: TCA, eleven languages, exact whitespace, escaped code/filename, copy labels, optional filename and backend preview passed.\n";

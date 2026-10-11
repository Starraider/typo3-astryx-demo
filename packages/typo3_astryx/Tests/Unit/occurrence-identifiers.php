<?php
declare(strict_types=1);

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Skom\Typo3Astryx\Middleware\OccurrenceIdentifiers as Middleware;
use Skom\Typo3Astryx\Rendering\OccurrenceIdentifiers;
use TYPO3\CMS\Core\Http\Response;
use TYPO3\CMS\Core\Http\ServerRequest;

require getcwd() . '/vendor/autoload.php';
$handler = new class implements RequestHandlerInterface {
    public array $allocations = [];
    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $state = $request->getAttribute(OccurrenceIdentifiers::class);
        $clone = $request->withAttribute('currentContentObject', new stdClass());
        if ($clone->getAttribute(OccurrenceIdentifiers::class) !== $state) throw new RuntimeException('State lost in request clone.');
        $this->allocations[] = [$state->allocate('content', 42), $clone->getAttribute(OccurrenceIdentifiers::class)->allocate('content', 42)];
        return new Response();
    }
};
$middleware = new Middleware();
$middleware->process(new ServerRequest(), $handler);
$middleware->process(new ServerRequest(), $handler);
foreach ($handler->allocations as [$first, $second]) {
    if ($first['id'] !== 'c42' || $second['id'] === 'c42' || $first['canonicalId'] !== $second['canonicalId'] || $first['namespace'] === $second['namespace']) {
        throw new RuntimeException('Canonical/repeated anchors failed.');
    }
}
if ($handler->allocations[0][0]['namespace'] === $handler->allocations[1][0]['namespace']) throw new RuntimeException('Cached and fresh generations collide.');
$state = new OccurrenceIdentifiers();
foreach (['', '42 unsafe / <script>', 'component', 'component'] as $prefix) {
    if (!preg_match('/^astryx-[a-zA-Z0-9_-]+$/', $state->allocate($prefix)['id'])) throw new RuntimeException('Unsafe identifier.');
}
echo "Occurrence identifiers: cloned requests share state; requests reset canonical anchors; generations, repeated IDs and unsafe prefixes pass.\n";

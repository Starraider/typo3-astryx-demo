<?php
declare(strict_types=1);

namespace Skom\Typo3Astryx\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Skom\Typo3Astryx\Rendering\OccurrenceIdentifiers as Identifiers;

final class OccurrenceIdentifiers implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        return $handler->handle($request->withAttribute(Identifiers::class, new Identifiers()));
    }
}

<?php
declare(strict_types=1);

namespace Skom\Typo3Astryx\Rendering;

/** Mutable state carried by request clones, never shared between HTTP requests. */
final class OccurrenceIdentifiers
{
    private int $sequence = 0;
    private array $records = [];
    private readonly string $generation;

    public function __construct()
    {
        // Cached and uncached rendering can be combined in one response.
        $this->generation = bin2hex(random_bytes(8));
    }

    /** @return array{namespace: string, id: string, canonicalId: string} */
    public function allocate(string $prefix = 'component', int $recordUid = 0): array
    {
        $prefix = trim(preg_replace('/[^a-zA-Z0-9_-]+/', '-', $prefix), '-') ?: 'component';
        $namespace = 'astryx-' . $prefix . '-' . $this->generation . '-' . ++$this->sequence;
        $canonicalId = $recordUid > 0 ? 'c' . $recordUid : '';
        $id = $namespace;
        if ($canonicalId !== '') {
            $id = isset($this->records[$recordUid]) ? $canonicalId . '-' . $namespace : $canonicalId;
            $this->records[$recordUid] = true;
        }
        return ['namespace' => $namespace, 'id' => $id, 'canonicalId' => $canonicalId];
    }
}

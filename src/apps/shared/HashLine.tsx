import { useEffect, useState } from 'react';
import { hashCheck, type HashCheck } from '../../engine/hash';
import type { Evidence } from '../../engine/types';
import { Badge } from '../../ui/StatusBadge';
import s from './shared.module.css';

/**
 * Chain of custody: the SHA-256 hash recorded when the item was collected, checked against
 * the item now. A mismatch means it changed after collection.
 */
export function HashLine({ item }: { item: Evidence }) {
  const [check, setCheck] = useState<HashCheck | null>(null);

  useEffect(() => {
    let live = true;
    hashCheck(item)
      .then((r) => live && setCheck(r))
      .catch(() => live && setCheck(null));
    return () => {
      live = false;
    };
  }, [item]);

  return (
    <div className={s.hash}>
      <span className={s.hashLabel}>SHA-256</span>
      <code className={s.hashValue} title={check?.recorded}>
        {check ? check.recorded : 'calculating…'}
      </code>
      {check &&
        (check.match ? (
          <Badge tone="supports" icon="check">
            Matches collection record
          </Badge>
        ) : (
          <Badge tone="contradicts" icon="alert">
            Hash mismatch: changed after collection
          </Badge>
        ))}
    </div>
  );
}

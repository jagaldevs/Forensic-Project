import { useEffect, useState } from 'react';
import { hashCheck, type HashCheck } from '../../engine/hash';
import type { Evidence } from '../../engine/types';

/** The hash check for an item, worked out once it is shown (SHA-256 is async in browsers). */
export function useHashCheck(item: Evidence): HashCheck | null {
  const [check, setCheck] = useState<{ id: string; result: HashCheck } | null>(null);

  useEffect(() => {
    let live = true;
    hashCheck(item)
      .then((result) => live && setCheck({ id: item.id, result }))
      .catch(() => live && setCheck(null));
    return () => {
      live = false;
    };
  }, [item]);

  return check?.id === item.id ? check.result : null;
}

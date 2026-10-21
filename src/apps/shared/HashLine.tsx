import type { HashCheck } from '../../engine/hash';
import type { Evidence } from '../../engine/types';
import { Icon } from '../../ui/Icon';
import { Badge } from '../../ui/StatusBadge';
import s from './shared.module.css';
import { useHashCheck } from './useHashCheck';

/**
 * Chain of custody: the SHA-256 hash recorded when the item was collected, checked against
 * the item now. A mismatch means it changed after collection, and gets a prominent warning.
 */
export function HashLine({ item }: { item: Evidence }) {
  const check = useHashCheck(item);

  return (
    <>
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
      {check && !check.match && <TamperWarning check={check} />}
    </>
  );
}

function TamperWarning({ check }: { check: HashCheck }) {
  return (
    <div className={s.tamper}>
      <Icon name="alert" size={28} />
      <div>
        <p className={s.tamperTitle}>Tamper warning</p>
        <p>
          This item is <strong>not the same</strong> as when it was collected. Its hash now does not
          match the hash recorded at collection, so something changed it afterwards.
        </p>
        <dl className={s.tamperHashes}>
          <dt>At collection</dt>
          <dd>{check.recorded}</dd>
          <dt>Now</dt>
          <dd>{check.current}</dd>
        </dl>
        <p className={s.tamperAdvice}>
          Treat it with caution. If you use it, explain the mismatch in your judgement.
        </p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { accessWording } from '../../engine/accessWording';
import { requestsFor } from '../../engine/availability';
import type { Evidence } from '../../engine/types';
import { Button } from '../../ui/Button';
import { Icon } from '../../ui/Icon';
import { useCaseState } from './hooks';
import { WarrantDialog } from './WarrantDialog';
import s from './shared.module.css';

/** Shown in place of an item that needs a warrant. */
export function LockedNotice({ item }: { item: Evidence }) {
  const { c, progress } = useCaseState();
  const [open, setOpen] = useState(false);
  const w = accessWording(c);
  const request = requestsFor(c, item.id)[0];
  const refused =
    request && progress.warrants.find((w) => w.requestId === request.id && !w.granted);

  return (
    <div className={s.locked}>
      <Icon name="lock" size={40} />
      <h3>{item.title}</h3>
      <p>
        This data is private. Investigators need <strong>{w.need}</strong> to access it.
      </p>
      {request && (
        <>
          <p className={s.lockedScope}>
            <strong>Request:</strong> {request.scope}
          </p>
          {refused ? (
            <>
              <p className={s.lockedRefused}>
                <Icon name="contradicts" size={16} /> Your application was refused.
              </p>
              <Button icon="info" onClick={() => setOpen(true)}>
                {w.readReasons}
              </Button>
            </>
          ) : (
            <Button variant="primary" icon="warrant" onClick={() => setOpen(true)}>
              {w.apply}
            </Button>
          )}
        </>
      )}
      {open && request && <WarrantDialog request={request} onClose={() => setOpen(false)} />}
    </div>
  );
}

import { useEffect } from 'react';
import { usableEvidence } from '../../engine/availability';
import type { EvidenceOfType } from '../../engine/types';
import { useDesktop } from '../../stores/desktopStore';
import { useProgress } from '../../stores/progressStore';
import { Icon } from '../../ui/Icon';
import type { AppProps } from '../registry';
import { EvidenceHeader } from '../shared/EvidenceHeader';
import { useCaseState } from '../shared/hooks';
import s from '../shared/shared.module.css';
import m from './messages.module.css';

type Thread = EvidenceOfType<'messageThread'>;

const clock = (recorded: string) => recorded.slice(11, 16);

/** Message threads, with read receipts and deleted-message placeholders. */
export default function MessagesApp({ params }: AppProps) {
  const { c, progress, caseId } = useCaseState();
  const threads = usableEvidence(c, progress).filter(
    (e): e is Thread => e.type === 'messageThread',
  );
  const selected = threads.find((t) => t.id === params.selected) ?? threads[0] ?? null;

  useEffect(() => {
    if (selected) useProgress.getState().markViewed(caseId, selected.id);
  }, [selected, caseId]);

  if (!selected)
    return (
      <div className={s.empty}>
        <Icon name="chat" size={40} />
        <p>No message threads collected yet.</p>
      </div>
    );

  const device = c.devices.find((d) => d.id === selected.deviceId);
  const owner = c.people.find((p) => p.id === device?.ownerId);
  const me = owner?.name.split(' ')[0];

  return (
    <div className={s.app}>
      <div className={s.split}>
        <nav className={s.sidebar} aria-label="Threads">
          <ul className={s.list}>
            {threads.map((t) => {
              const last = t.messages.at(-1)!;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    className={s.listItem}
                    aria-current={t.id === selected.id}
                    onClick={() => useDesktop.getState().setParams('messages', { selected: t.id })}
                  >
                    <Icon name="chat" size={18} />
                    <span className={s.listItemText}>
                      <span>{t.title}</span>
                      <span className={s.listItemSub}>
                        {clock(last.at)} ·{' '}
                        {last.deleted ? 'Message deleted' : last.body.slice(0, 32)}
                      </span>
                    </span>
                    {!progress.viewed[t.id] && <span className={s.newDot}>NEW</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className={s.main}>
          <EvidenceHeader item={selected} />
          <p className={m.deviceNote}>
            <Icon name="clock" size={14} className="inline-icon" /> Times are shown exactly as they
            appeared on {device?.name ?? 'the device'} ({selected.service}).
          </p>
          <ol className={m.thread} aria-label={`Messages in ${selected.title}`}>
            {selected.messages.map((msg, i) => {
              const mine = msg.from === me;
              const showDate =
                i === 0 || selected.messages[i - 1]!.at.slice(0, 10) !== msg.at.slice(0, 10);
              return (
                <li key={i} className={mine ? m.mine : m.theirs}>
                  {showDate && <div className={m.date}>{msg.at.slice(0, 10)}</div>}
                  {!mine && <span className={m.sender}>{msg.from}</span>}
                  <div className={`${m.bubble} ${msg.deleted ? m.deleted : ''}`}>
                    {msg.deleted ? (
                      <>
                        <Icon name="trash" size={14} className="inline-icon" /> This message was
                        deleted
                      </>
                    ) : (
                      msg.body
                    )}
                  </div>
                  <span className={m.meta}>
                    {clock(msg.at)}
                    {mine && msg.status && (
                      <>
                        {' · '}
                        {msg.status === 'read' && msg.readAt
                          ? `Read ${clock(msg.readAt)}`
                          : msg.status === 'read'
                            ? 'Read'
                            : msg.status === 'delivered'
                              ? 'Delivered'
                              : 'Sent'}
                      </>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
          <p className={s.prompt}>
            <strong>Think:</strong> “Delivered” means it reached the phone; “Read” means it was
            opened. What does it mean when a message is delivered but never read?
          </p>
        </div>
      </div>
    </div>
  );
}

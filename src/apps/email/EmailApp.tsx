import { useEffect, useState } from 'react';
import { usableEvidence } from '../../engine/availability';
import { formatShortDate, formatTime12 } from '../../engine/format';
import type { EvidenceOfType } from '../../engine/types';
import { useDesktop } from '../../stores/desktopStore';
import { useProgress } from '../../stores/progressStore';
import { Button } from '../../ui/Button';
import { Icon } from '../../ui/Icon';
import { Badge } from '../../ui/StatusBadge';
import type { AppProps } from '../registry';
import { EvidenceHeader } from '../shared/EvidenceHeader';
import { useCaseState } from '../shared/hooks';
import s from '../shared/shared.module.css';
import { headerChecks } from './headerCheck';
import { formatMailbox, rawSource } from './rawSource';
import m from './email.module.css';

type Email = EvidenceOfType<'email'>;

/** An inbox, with "Show original" for the full headers and a plain-English header check. */
export default function EmailApp({ params }: AppProps) {
  const { c, progress, caseId } = useCaseState();
  const emails = usableEvidence(c, progress).filter((e): e is Email => e.type === 'email');
  const selected = emails.find((e) => e.id === params.selected) ?? emails[0] ?? null;

  useEffect(() => {
    if (selected) useProgress.getState().markViewed(caseId, selected.id);
  }, [selected, caseId]);

  if (!selected)
    return (
      <div className={s.empty}>
        <Icon name="mail" size={40} />
        <p>No emails have been collected yet.</p>
      </div>
    );

  const offset = c.timeZone.utcOffset;
  const inboxes = [...new Set(emails.map((e) => e.inbox))];

  return (
    <div className={s.app}>
      <div className={s.split}>
        <nav className={s.sidebar} aria-label="Emails">
          {inboxes.map((inbox) => (
            <section key={inbox} className={m.inbox} aria-label={inbox}>
              <h3 className={m.inboxTitle}>
                <Icon name="mail" size={14} /> {inbox}
              </h3>
              <ul className={s.list}>
                {emails
                  .filter((e) => e.inbox === inbox)
                  .map((e) => (
                    <li key={e.id}>
                      <button
                        type="button"
                        className={s.listItem}
                        aria-current={e.id === selected.id}
                        onClick={() => useDesktop.getState().setParams('email', { selected: e.id })}
                      >
                        <Icon name="mail" size={18} />
                        <span className={s.listItemText}>
                          <span className={m.rowFrom}>{e.from.name || e.from.address}</span>
                          <span>{e.subject}</span>
                          <span className={s.listItemSub}>
                            {formatShortDate(e.sentAt, offset)}, {formatTime12(e.sentAt, offset)}
                          </span>
                        </span>
                        {!progress.viewed[e.id] && <span className={s.newDot}>NEW</span>}
                      </button>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </nav>
        <div className={s.main}>
          <EmailView key={selected.id} email={selected} offset={offset} zone={c.timeZone.label} />
        </div>
      </div>
    </div>
  );
}

function EmailView({ email, offset, zone }: { email: Email; offset: string; zone: string }) {
  const [original, setOriginal] = useState(false);

  return (
    <article>
      <EvidenceHeader item={email}>
        <Button
          size="small"
          icon="file"
          aria-pressed={original}
          onClick={() => setOriginal((v) => !v)}
        >
          {original ? 'Hide original' : 'Show original'}
        </Button>
      </EvidenceHeader>

      <section className={m.message} aria-label="Message">
        <h3 className={m.subject}>{email.subject}</h3>
        <dl className={m.fields}>
          <dt>From</dt>
          <dd className={m.address}>{formatMailbox(email.from)}</dd>
          {email.replyTo && (
            <>
              <dt>Reply to</dt>
              <dd className={m.address}>{formatMailbox(email.replyTo)}</dd>
            </>
          )}
          <dt>To</dt>
          <dd className={m.address}>{email.to.map(formatMailbox).join(', ')}</dd>
          <dt>Date</dt>
          <dd>
            {formatShortDate(email.sentAt, offset)}, {formatTime12(email.sentAt, offset)}{' '}
            <span className={m.zone}>({zone})</span>
          </dd>
        </dl>
        {email.attachments?.length ? (
          <ul className={m.attachments} aria-label="Attachments">
            {email.attachments.map((a) => (
              <li key={a} className={m.attachment}>
                <Icon name="file" size={14} /> {a}
              </li>
            ))}
          </ul>
        ) : null}
        <div className={m.body}>{email.body}</div>
      </section>

      {original && (
        <div className={m.originalWrap}>
          <section className={m.original} aria-label="Original message source">
            <h4 className={m.panelTitle}>
              <Icon name="file" size={16} /> Original message
            </h4>
            <pre className={m.raw} tabIndex={0}>
              {rawSource(email)}
            </pre>
          </section>
          <HeaderCheckPanel email={email} />
        </div>
      )}

      <p className={s.prompt}>
        <strong>Think:</strong> the From line is typed by the sender and can say anything. Compare
        this email with others from the same sender: who it went to, where replies go, and whether
        it fits the rules. What does it <em>not</em> show (who was typing)?
      </p>
    </article>
  );
}

function HeaderCheckPanel({ email }: { email: Email }) {
  return (
    <section className={m.checks} aria-labelledby={`checks-${email.id}`}>
      <h4 id={`checks-${email.id}`} className={m.panelTitle}>
        <Icon name="shield" size={16} /> Header check
      </h4>
      <ul className={m.checkList}>
        {headerChecks(email).map((check) => (
          <li key={check.id} className={m.check}>
            <Badge tone={check.tone} icon={check.icon}>
              {check.label}
            </Badge>
            <p>{check.text}</p>
          </li>
        ))}
      </ul>
      <p className={m.checkNote}>
        These checks show which servers handled the email. They cannot show which person wrote it.
      </p>
    </section>
  );
}

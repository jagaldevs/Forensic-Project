import { useLayoutEffect, useRef, useState } from 'react';
import { usableEvidence } from '../../engine/availability';
import type { BoardLink } from '../../engine/progressTypes';
import type { Evidence, Relation, VerdictQuestion } from '../../engine/types';
import { playSound } from '../../lib/sound';
import { useProgress } from '../../stores/progressStore';
import { Button } from '../../ui/Button';
import { Dialog } from '../../ui/Dialog';
import { Icon } from '../../ui/Icon';
import { StatusBadge } from '../../ui/StatusBadge';
import { statusInfo } from '../../ui/labels';
import { useCaseState } from '../shared/hooks';
import { BoardCard, CARD_H, CARD_W, type Pos } from './BoardCard';
import b from './board.module.css';

/** Claims sit on the right edge of the visible board, but never closer than this to the left. */
const MIN_CLAIM_X = 700;
const CLAIM_W = 310;
const CLAIM_H = 132;
const CLAIM_GAP = 26;
const relations: Relation[] = ['supports', 'contradicts', 'inconclusive'];

const claimTop = (i: number) => 40 + i * (CLAIM_H + CLAIM_GAP);

/** Corkboard: pinned evidence cards linked to case claims with labelled magenta string. */
export default function EvidenceBoardApp() {
  const { c, progress, caseId } = useCaseState();
  const [linkingFrom, setLinkingFrom] = useState<string | null>(null);
  const [pending, setPending] = useState<{ evidenceId: string; questionId: string } | null>(null);
  const [editing, setEditing] = useState<BoardLink | null>(null);
  const [drag, setDrag] = useState<{ id: string; pos: Pos } | null>(null);
  const [viewWidth, setViewWidth] = useState(1100);
  const scroller = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setViewWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const CLAIM_X = Math.max(MIN_CLAIM_X, viewWidth - CLAIM_W - 24);
  const BOARD_W = CLAIM_X + CLAIM_W + 24;

  const claims = c.questions.filter((q): q is VerdictQuestion => q.kind === 'verdict');
  const usable = new Map(usableEvidence(c, progress).map((e) => [e.id, e]));
  const cards = Object.entries(progress.board)
    .map(([id, pos]) => ({ item: usable.get(id), pos }))
    .filter((x): x is { item: Evidence; pos: { x: number; y: number } } => !!x.item);

  const maxCardY = Math.max(0, ...cards.map((x) => x.pos.y + CARD_H));
  const height = Math.max(claimTop(claims.length) + 20, maxCardY + 60, 640);

  const anchorOfCard = (id: string) => {
    const pos = drag?.id === id ? drag.pos : progress.board[id]!;
    return { x: pos.x + CARD_W / 2, y: pos.y + 10 };
  };
  const anchorOfClaim = (qid: string) => {
    const i = claims.findIndex((q) => q.id === qid);
    return { x: CLAIM_X, y: claimTop(i) + CLAIM_H / 2 };
  };

  const links = progress.links.filter(
    (l) => progress.board[l.evidenceId] && usable.has(l.evidenceId),
  );
  const linkingTitle = linkingFrom ? usable.get(linkingFrom)?.title : null;

  const chooseClaim = (questionId: string) => {
    if (!linkingFrom) return;
    setPending({ evidenceId: linkingFrom, questionId });
    setLinkingFrom(null);
  };

  const makeLink = (relation: Relation) => {
    if (!pending) return;
    useProgress.getState().link(caseId, pending.evidenceId, pending.questionId, relation);
    playSound('click');
    setPending(null);
  };

  return (
    <div className={b.wrap}>
      <div className={b.toolbar} role="status" aria-live="polite">
        {linkingFrom ? (
          <>
            <Icon name="link" size={18} />
            <span>
              Linking <strong>{linkingTitle}</strong>. Now choose a claim on the right.
            </span>
            <Button size="small" onClick={() => setLinkingFrom(null)}>
              Cancel
            </Button>
          </>
        ) : (
          <span className={b.help}>
            Drag cards to arrange them. Use <strong>Link</strong> on a card, then pick a claim, to
            connect evidence with string. Select a string&rsquo;s label to change or remove it.
          </span>
        )}
      </div>

      <div ref={scroller} className={b.scroller}>
        <div className={b.board} style={{ width: BOARD_W, height }}>
          <svg className={b.strings} width={BOARD_W} height={height} aria-hidden="true">
            {links.map((l) => {
              const a = anchorOfCard(l.evidenceId);
              const z = anchorOfClaim(l.questionId);
              return (
                <path
                  key={l.id}
                  d={stringPath(a, z)}
                  className={`${b.string} ${b[`string-${l.relation}`]}`}
                />
              );
            })}
          </svg>

          {cards.length === 0 && (
            <div className={b.emptyHint}>
              <Icon name="pin" size={36} />
              <p>Nothing pinned yet.</p>
              <p>Use &ldquo;Pin to board&rdquo; on any evidence to bring it here.</p>
            </div>
          )}

          {cards.map(({ item, pos }) => (
            <BoardCard
              key={item.id}
              item={item}
              pos={pos}
              dragPos={drag?.id === item.id ? drag.pos : null}
              onDrag={(p) => setDrag(p ? { id: item.id, pos: p } : null)}
              maxX={CLAIM_X - CARD_W - 30}
              linking={linkingFrom === item.id}
              onLink={() => setLinkingFrom(linkingFrom === item.id ? null : item.id)}
            />
          ))}

          {claims.map((q, i) => {
            const own = links.filter((l) => l.questionId === q.id);
            return (
              <section
                key={q.id}
                className={`${b.claim} ${linkingFrom ? b.claimTarget : ''}`}
                style={{ left: CLAIM_X, top: claimTop(i), width: CLAIM_W, height: CLAIM_H }}
                aria-label={`Claim ${i + 1}: ${q.claim}`}
              >
                <span className={b.claimPin} aria-hidden="true" />
                <span className={b.claimLabel}>Claim {i + 1}</span>
                <p className={b.claimText}>{q.claim}</p>
                <div className={b.claimFoot}>
                  <span>
                    {own.length} linked item{own.length === 1 ? '' : 's'}
                  </span>
                  {linkingFrom && (
                    <Button
                      size="small"
                      variant="primary"
                      icon="link"
                      onClick={() => chooseClaim(q.id)}
                    >
                      Link here
                    </Button>
                  )}
                </div>
              </section>
            );
          })}

          {links.map((l) => {
            const a = anchorOfCard(l.evidenceId);
            const z = anchorOfClaim(l.questionId);
            const mid = stringMid(a, z);
            const info = statusInfo[l.relation];
            return (
              <button
                key={l.id}
                type="button"
                className={`${b.label} ${b[`label-${l.relation}`]}`}
                style={{ left: mid.x, top: mid.y }}
                onClick={() => setEditing(l)}
                aria-label={`${usable.get(l.evidenceId)?.title} ${info.label.toLowerCase()} claim ${claims.findIndex((q) => q.id === l.questionId) + 1}. Change or remove`}
              >
                <Icon name={info.icon} size={14} />
                {info.label}
              </button>
            );
          })}
        </div>
      </div>

      {pending && (
        <RelationDialog
          title="How does this evidence relate to the claim?"
          evidence={usable.get(pending.evidenceId)!}
          claim={claims.find((q) => q.id === pending.questionId)!}
          onPick={makeLink}
          onClose={() => setPending(null)}
        />
      )}
      {editing && (
        <RelationDialog
          title="Change this link"
          evidence={usable.get(editing.evidenceId)!}
          claim={claims.find((q) => q.id === editing.questionId)!}
          current={editing.relation}
          onPick={(r) => {
            useProgress.getState().link(caseId, editing.evidenceId, editing.questionId, r);
            setEditing(null);
          }}
          onRemove={() => {
            useProgress.getState().unlink(caseId, editing.evidenceId, editing.questionId);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function RelationDialog({
  title,
  evidence,
  claim,
  current,
  onPick,
  onRemove,
  onClose,
}: {
  title: string;
  evidence: Evidence;
  claim: VerdictQuestion;
  current?: Relation;
  onPick: (r: Relation) => void;
  onRemove?: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog
      title={title}
      onClose={onClose}
      actions={
        onRemove && (
          <Button variant="danger" icon="trash" onClick={onRemove}>
            Remove link
          </Button>
        )
      }
    >
      <p className={b.dialogPair}>
        <strong>{evidence.title}</strong>
        <Icon name="arrowRight" size={16} />
        <span>&ldquo;{claim.claim}&rdquo;</span>
      </p>
      <div className={b.relationChoices}>
        {relations.map((r, i) => (
          <button
            key={r}
            type="button"
            className={`${b.relationChoice} ${current === r ? b.relationCurrent : ''}`}
            onClick={() => onPick(r)}
            data-autofocus={i === 0 ? true : undefined}
            aria-pressed={current === r}
          >
            <StatusBadge status={r} />
            <span>{relationHelp[r]}</span>
          </button>
        ))}
      </div>
    </Dialog>
  );
}

const relationHelp: Record<Relation, string> = {
  supports: 'This evidence makes the claim more likely to be true.',
  contradicts: 'This evidence makes the claim less likely, or shows it rests on a mistake.',
  inconclusive: "This evidence is relevant, but it can't decide the claim either way.",
};

type Pt = { x: number; y: number };

/** A string that sags a little under its own weight. */
function stringPath(a: Pt, z: Pt): string {
  const c = stringControl(a, z);
  return `M${a.x},${a.y} Q${c.x},${c.y} ${z.x},${z.y}`;
}

function stringControl(a: Pt, z: Pt): Pt {
  const sag = 30 + Math.hypot(z.x - a.x, z.y - a.y) * 0.08;
  return { x: (a.x + z.x) / 2, y: (a.y + z.y) / 2 + sag };
}

/** Midpoint of the quadratic curve (t = 0.5). */
function stringMid(a: Pt, z: Pt): Pt {
  const c = stringControl(a, z);
  return { x: 0.25 * a.x + 0.5 * c.x + 0.25 * z.x, y: 0.25 * a.y + 0.5 * c.y + 0.25 * z.y };
}

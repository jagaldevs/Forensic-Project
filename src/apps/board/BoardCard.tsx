import { useRef, type KeyboardEvent } from 'react';
import type { Evidence } from '../../engine/types';
import { usePointerDrag } from '../../lib/usePointerDrag';
import { useProgress } from '../../stores/progressStore';
import { Button } from '../../ui/Button';
import { Icon } from '../../ui/Icon';
import { evidenceIcon } from '../shared/EvidenceIcon';
import { openEvidence, useCaseState } from '../shared/hooks';
import b from './board.module.css';

export const CARD_W = 210;
export const CARD_H = 148;
const KEY_STEP = 16;

export type Pos = { x: number; y: number };

interface BoardCardProps {
  item: Evidence;
  pos: Pos;
  /** Live position while being dragged (so the string follows), or null. */
  dragPos: Pos | null;
  onDrag: (pos: Pos | null) => void;
  /** Cards stay left of the claims column. */
  maxX: number;
  linking: boolean;
  onLink: () => void;
}

/** A draggable evidence card. Arrow keys move it when focused. */
export function BoardCard({ item, pos, dragPos, onDrag, maxX, linking, onLink }: BoardCardProps) {
  const { caseId } = useCaseState();
  const latest = useRef<Pos | null>(null);
  const shown = dragPos ?? pos;
  const clamp = (x: number, y: number) => ({
    x: Math.min(Math.max(0, x), maxX),
    y: Math.max(0, y),
  });

  const onPointerDown = usePointerDrag({
    onStart: (e) => !(e.target as HTMLElement).closest('button'),
    onMove: (dx, dy) => {
      latest.current = clamp(pos.x + dx, pos.y + dy);
      onDrag(latest.current);
    },
    onEnd: (moved) => {
      // Saved once at the end of a drag, not on every pointer move.
      if (moved && latest.current)
        useProgress.getState().moveCard(caseId, item.id, latest.current.x, latest.current.y);
      latest.current = null;
      onDrag(null);
    },
  });

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[
      e.key
    ];
    if (!d) return;
    e.preventDefault();
    const next = clamp(pos.x + d[0]! * KEY_STEP, pos.y + d[1]! * KEY_STEP);
    useProgress.getState().moveCard(caseId, item.id, next.x, next.y);
  };

  return (
    <article
      className={`${b.card} ${dragPos ? b.dragging : ''} ${linking ? b.cardLinking : ''}`}
      style={{ left: shown.x, top: shown.y, width: CARD_W, height: CARD_H }}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      tabIndex={0}
      aria-label={`${item.title}. Evidence card. Use arrow keys to move.`}
    >
      <span className={b.pin} aria-hidden="true" />
      <div className={b.cardHead}>
        <Icon name={evidenceIcon(item)} size={16} />
        <h4>{item.title}</h4>
      </div>
      <p className={b.cardSummary}>{item.summary}</p>
      <div className={b.cardActions}>
        <Button
          size="small"
          variant={linking ? 'primary' : 'secondary'}
          icon="link"
          onClick={onLink}
          aria-pressed={linking}
        >
          Link
        </Button>
        <Button
          size="small"
          variant="ghost"
          icon="eye"
          label={`Open ${item.title}`}
          onClick={() => openEvidence(item)}
        />
        <Button
          size="small"
          variant="ghost"
          icon="close"
          label={`Unpin ${item.title}`}
          onClick={() => useProgress.getState().unpin(caseId, item.id)}
        />
      </div>
    </article>
  );
}

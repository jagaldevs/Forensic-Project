import { CARD_H, CARD_W } from '../../apps/board/BoardCard';
import { stringMid, stringPath } from '../../apps/board/strings';
import type { CaseFile } from '../../engine/types';
import type { CaseProgress } from '../../engine/progressTypes';
import { statusInfo } from '../../ui/labels';
import r from '../report.module.css';

const CLAIM_W = 310;
const CLAIM_H = 132;
const CLAIM_GAP = 26;
const claimTop = (i: number) => 40 + i * (CLAIM_H + CLAIM_GAP);

/** Breaks text into at most `max` lines of about `width` characters. */
function wrap(text: string, width: number, max: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if ((line + ' ' + word).trim().length > width && line) {
      lines.push(line);
      line = word;
    } else line = (line + ' ' + word).trim();
  }
  if (line) lines.push(line);
  if (lines.length > max) {
    lines.length = max;
    lines[max - 1] = `${lines[max - 1]!.replace(/\s*\S*$/, '')}…`;
  }
  return lines;
}

/**
 * A still picture of the student's evidence board for the printed report: cards where they
 * left them, claims on the right, and labelled string. Line styles differ by relation, so it
 * reads in black and white too.
 */
export function BoardSnapshot({ c, progress }: { c: CaseFile; progress: CaseProgress }) {
  const claims = c.questions.filter((q) => q.kind === 'verdict');
  const cards = Object.entries(progress.board)
    .map(([id, pos]) => ({ item: c.evidence.find((e) => e.id === id), pos }))
    .filter((x) => x.item);
  if (!cards.length) return null;

  const right = Math.max(...cards.map((x) => x.pos.x + CARD_W));
  const claimX = Math.max(700, right + 80);
  const width = claimX + CLAIM_W + 24;
  const height = Math.max(
    claimTop(claims.length) + 20,
    Math.max(...cards.map((x) => x.pos.y + CARD_H)) + 40,
  );
  const links = progress.links.filter((l) => progress.board[l.evidenceId]);

  return (
    <figure className={r.board}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Evidence board: ${cards.length} cards and ${links.length} links to claims.`}
      >
        <rect width={width} height={height} className={r.boardCork} />
        {claims.map((q, i) => (
          <g key={q.id}>
            <rect
              x={claimX}
              y={claimTop(i)}
              width={CLAIM_W}
              height={CLAIM_H}
              rx={8}
              className={r.boardClaim}
            />
            <text x={claimX + 14} y={claimTop(i) + 26} className={r.boardClaimLabel}>
              CLAIM Q{c.questions.indexOf(q) + 1}
            </text>
            {wrap(q.kind === 'verdict' ? q.claim : '', 30, 4).map((line, k) => (
              <text
                key={k}
                x={claimX + 14}
                y={claimTop(i) + 52 + k * 20}
                className={r.boardClaimText}
              >
                {line}
              </text>
            ))}
          </g>
        ))}
        {cards.map(({ item, pos }) => (
          <g key={item!.id}>
            <rect
              x={pos.x}
              y={pos.y}
              width={CARD_W}
              height={CARD_H}
              rx={4}
              className={r.boardCard}
            />
            {wrap(item!.title, 24, 5).map((line, k) => (
              <text key={k} x={pos.x + 12} y={pos.y + 34 + k * 20} className={r.boardCardText}>
                {line}
              </text>
            ))}
          </g>
        ))}
        {links.map((l) => {
          const pos = progress.board[l.evidenceId]!;
          const i = claims.findIndex((q) => q.id === l.questionId);
          if (i < 0) return null;
          const a = { x: pos.x + CARD_W / 2, y: pos.y + 10 };
          const z = { x: claimX, y: claimTop(i) + CLAIM_H / 2 };
          const mid = stringMid(a, z);
          return (
            <g key={l.id}>
              <path
                d={stringPath(a, z)}
                className={`${r.boardString} ${r[`boardString-${l.relation}`]}`}
              />
              <text x={mid.x} y={mid.y} textAnchor="middle" className={r.boardStringLabel}>
                {statusInfo[l.relation].label}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className={r.hash}>
        Solid string: supports. Dashed: contradicts. Dotted: inconclusive.
      </figcaption>
    </figure>
  );
}

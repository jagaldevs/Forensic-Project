import { playSound } from '../../lib/sound';
import { useProgress } from '../../stores/progressStore';
import { useToasts } from '../../stores/toastStore';
import { Button } from '../../ui/Button';
import { useCaseState } from './hooks';

/** Pin any evidence item to the evidence board, from any app. */
export function PinButton({
  evidenceId,
  size = 'small',
}: {
  evidenceId: string;
  size?: 'small' | 'normal';
}) {
  const { progress, caseId, c } = useCaseState();
  const pinned = evidenceId in progress.board;
  const title = c.evidence.find((e) => e.id === evidenceId)?.title ?? 'Evidence';

  const toggle = () => {
    if (pinned) {
      useProgress.getState().unpin(caseId, evidenceId);
    } else {
      useProgress.getState().pin(caseId, evidenceId);
      playSound('click');
      useToasts.getState().push({
        key: 'pinned',
        title: 'Pinned to the evidence board',
        body: title,
        icon: 'pin',
        action: { label: 'Open board', appId: 'board' },
      });
    }
  };

  return (
    <Button
      size={size}
      variant={pinned ? 'secondary' : 'primary'}
      icon={pinned ? 'check' : 'pin'}
      aria-pressed={pinned}
      onClick={toggle}
      title={pinned ? 'Unpin from the evidence board' : 'Pin to the evidence board'}
    >
      {pinned ? 'Pinned' : 'Pin to board'}
    </Button>
  );
}

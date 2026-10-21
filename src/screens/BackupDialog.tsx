import { useEffect, useState } from 'react';
import { decodeProgress, encodeProgress } from '../lib/progressCode';
import { isStorageAvailable } from '../lib/safeStorage';
import { useProgress } from '../stores/progressStore';
import { useAcademy } from '../stores/academyStore';
import { useSettings } from '../stores/settingsStore';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import ui from '../ui/ui.module.css';

/** Export or import a progress code. */
export function BackupDialog({ onClose }: { onClose: () => void }) {
  const [code, setCode] = useState('');
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const { agentName, teacherModeUsedAt } = useSettings.getState();
    const { cases } = useProgress.getState();
    const { missions: academy } = useAcademy.getState();
    encodeProgress({ v: 3, agentName, cases, academy, teacherModeUsedAt }).then(setCode);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setMessage({ ok: false, text: 'Copying was blocked. Select the code and copy it manually.' });
    }
  };

  const restore = async () => {
    try {
      const backup = await decodeProgress(importText);
      useProgress.getState().replaceAll(backup.cases);
      useAcademy.getState().replaceAll(backup.academy);
      if (backup.agentName) useSettings.getState().setAgentName(backup.agentName);
      setMessage({ ok: true, text: 'Progress restored.' });
    } catch (e) {
      setMessage({ ok: false, text: (e as Error).message });
    }
  };

  return (
    <Dialog title="Back up your progress" onClose={onClose} wide>
      {!isStorageAvailable() && (
        <p
          role="alert"
          style={{ color: 'var(--status-inconclusive)', marginBottom: 'var(--space-4)' }}
        >
          This browser isn&rsquo;t letting the lab save. Your work will be lost when you close the
          tab, so copy your progress code before you finish.
        </p>
      )}
      <label className={ui.label} htmlFor="export-code">
        Your progress code
      </label>
      <span className={ui.hint}>
        Copy this and keep it somewhere safe (for example, in a document). Paste it back in later to
        carry on.
      </span>
      <textarea
        id="export-code"
        className={`${ui.textarea} ${ui.mono}`}
        readOnly
        value={code}
        rows={4}
        onFocus={(e) => e.currentTarget.select()}
      />
      <div style={{ marginTop: 'var(--space-2)' }}>
        <Button icon={copied ? 'check' : 'copy'} onClick={copy} disabled={!code}>
          {copied ? 'Copied' : 'Copy code'}
        </Button>
      </div>

      <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: 'var(--space-5) 0' }} />

      <label className={ui.label} htmlFor="import-code">
        Restore from a code
      </label>
      <span className={ui.hint}>This replaces the progress saved on this device.</span>
      <textarea
        id="import-code"
        className={`${ui.textarea} ${ui.mono}`}
        rows={3}
        value={importText}
        onChange={(e) => setImportText(e.target.value)}
        placeholder="HRSFL1.…"
      />
      <div style={{ marginTop: 'var(--space-2)' }}>
        <Button icon="upload" onClick={restore} disabled={!importText.trim()}>
          Restore progress
        </Button>
      </div>
      {message && (
        <p
          role="status"
          style={{
            marginTop: 'var(--space-3)',
            color: message.ok ? 'var(--status-supports)' : 'var(--status-contradicts)',
          }}
        >
          {message.text}
        </p>
      )}
    </Dialog>
  );
}

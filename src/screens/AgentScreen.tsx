import { useState, type FormEvent } from 'react';
import { Logo } from '../brand/Logo';
import { useNav } from '../stores/navStore';
import { useSettings } from '../stores/settingsStore';
import { Button } from '../ui/Button';
import ui from '../ui/ui.module.css';
import s from './screens.module.css';

const codenames = [
  'Kestrel',
  'Jabiru',
  'Barra',
  'Gecko',
  'Brolga',
  'Quoll',
  'Goanna',
  'Kingfisher',
  'Osprey',
  'Wallaroo',
  'Firetail',
  'Sandpiper',
];

function randomCodename() {
  const name = codenames[Math.floor(Math.random() * codenames.length)]!;
  return `Agent ${name}-${Math.floor(10 + Math.random() * 90)}`;
}

/** Codename entry. Stored on this device only; never a real name, never sent anywhere. */
export function AgentScreen() {
  const current = useSettings((st) => st.agentName);
  const setAgentName = useSettings((st) => st.setAgentName);
  const go = useNav((st) => st.go);
  const [name, setName] = useState(current);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setAgentName(name);
    go('cases');
  };

  return (
    <main className={s.stage}>
      <form className={s.panel} onSubmit={submit}>
        <div className={s.spread}>
          <span className={s.eyebrow}>Investigator ID</span>
          <Logo />
        </div>
        <h1 className={s.title}>Choose your codename</h1>
        <p className={s.lede}>
          Investigators in this lab work under a codename. It appears on your case reports so your
          teacher knows whose work it is.
        </p>
        <label className={ui.label} htmlFor="codename">
          Codename
        </label>
        <span className={ui.hint} id="codename-hint">
          Your first name or initials are fine. Don&rsquo;t use your full name. It stays on this
          device and is never sent anywhere.
        </span>
        <div className={s.row}>
          <input
            id="codename"
            className={ui.input}
            style={{ flex: '1 1 220px' }}
            value={name}
            maxLength={32}
            autoComplete="off"
            aria-describedby="codename-hint"
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Agent Kestrel"
            autoFocus
          />
          <Button icon="fingerprint" onClick={() => setName(randomCodename())}>
            Suggest one
          </Button>
        </div>
        <div className={s.row} style={{ marginTop: 'var(--space-5)', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="primary" icon="arrowRight" disabled={!name.trim()}>
            Continue
          </Button>
        </div>
      </form>
    </main>
  );
}

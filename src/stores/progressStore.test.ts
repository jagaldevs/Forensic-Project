import { beforeEach, describe, expect, test, vi } from 'vitest';
import waterfront from '../cases/waterfront-alibi/case';
import { useProgress } from './progressStore';

const ID = waterfront.meta.id;

beforeEach(() => {
  useProgress.setState({ cases: {} });
  localStorage.clear();
});

describe('progressStore', () => {
  test('persists progress to localStorage', () => {
    useProgress.getState().startCase(ID);
    useProgress.getState().markViewed(ID, 'login-streamcloud');
    const saved = JSON.parse(localStorage.getItem('hrsfl-progress')!);
    expect(saved.state.cases[ID].viewed['login-streamcloud']).toBeTypeOf('number');
  });

  test('keeps working when localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => useProgress.getState().pin(ID, 'weather-record')).not.toThrow();
    expect(useProgress.getState().cases[ID]!.board['weather-record']).toBeDefined();
    vi.restoreAllMocks();
  });

  test('linking pins the card and replaces an existing relation', () => {
    const { link } = useProgress.getState();
    link(ID, 'ip-203-0-113-47', 'q1-ip-location', 'supports');
    link(ID, 'ip-203-0-113-47', 'q1-ip-location', 'contradicts');
    const p = useProgress.getState().cases[ID]!;
    expect(p.board['ip-203-0-113-47']).toBeDefined();
    expect(p.links).toEqual([
      expect.objectContaining({ evidenceId: 'ip-203-0-113-47', relation: 'contradicts' }),
    ]);
  });

  test('unpinning removes the card and its links', () => {
    const { link, unpin } = useProgress.getState();
    link(ID, 'weather-record', 'q1-ip-location', 'inconclusive');
    unpin(ID, 'weather-record');
    const p = useProgress.getState().cases[ID]!;
    expect(p.board['weather-record']).toBeUndefined();
    expect(p.links).toEqual([]);
  });

  test('a proportionate warrant is granted, a broad one refused, and neither twice', () => {
    const { applyWarrant } = useProgress.getState();
    expect(applyWarrant(waterfront, 'warrant-phone-history', 'Need everything')!.granted).toBe(
      false,
    );
    expect(applyWarrant(waterfront, 'warrant-router', 'To check whose IP it is.')!.granted).toBe(
      true,
    );
    expect(applyWarrant(waterfront, 'warrant-router', 'again')).toBeNull();
    expect(useProgress.getState().cases[ID]!.warrants).toHaveLength(2);
  });

  test('support levels: every level used is recorded, and a submitted assessment is frozen', () => {
    const { setSupportLevel, recordNudge, setExtensionAnswer, submit } = useProgress.getState();
    setSupportLevel(ID, 'guided');
    setSupportLevel(ID, 'deep');
    recordNudge(ID, 'q1-ip-location');
    recordNudge(ID, 'q1-ip-location');
    setExtensionAnswer(ID, 'x-utc', '08:55 UTC is 6:25 pm ACST');
    let p = useProgress.getState().cases[ID]!;
    expect(p.supportLevel).toBe('deep');
    expect(Object.keys(p.supportLevelsUsed!)).toEqual(['guided', 'deep']);
    expect(p.nudgesUsed).toEqual(['q1-ip-location']);
    expect(p.extensionAnswers).toEqual({ 'x-utc': '08:55 UTC is 6:25 pm ACST' });

    submit(ID, { lock: true });
    setSupportLevel(ID, 'standard');
    p = useProgress.getState().cases[ID]!;
    expect(p.supportLevel).toBe('deep');
  });
});

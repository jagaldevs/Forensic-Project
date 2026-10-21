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
});

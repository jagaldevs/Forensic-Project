import { describe, expect, test } from 'vitest';
import { findSafetyIssues, isDocumentationIp, isFictionalMac } from './safety';

describe('isDocumentationIp', () => {
  test.each(['192.0.2.1', '198.51.100.200', '203.0.113.47'])('accepts %s', (ip) =>
    expect(isDocumentationIp(ip)).toBe(true),
  );
  test.each([
    '8.8.8.8',
    '203.0.114.1',
    '192.168.1.1',
    '203.0.113.256',
    '203.0.113',
    '203.0.113.07',
  ])('rejects %s', (ip) => expect(isDocumentationIp(ip)).toBe(false));
});

describe('isFictionalMac', () => {
  test.each(['00:00:5E:00:53:1A', '02:1B:44:9C:00:01', 'AE:00:00:00:00:01', '0a:11:22:33:44:55'])(
    'accepts %s',
    (mac) => expect(isFictionalMac(mac)).toBe(true),
  );
  test.each(['00:1B:44:11:3A:B7', 'F0:18:98:00:00:01', 'not-a-mac'])('rejects %s', (mac) =>
    expect(isFictionalMac(mac)).toBe(false),
  );
});

describe('findSafetyIssues', () => {
  test('flags real brands and non-documentation IPs anywhere in the data', () => {
    const issues = findSafetyIssues({ a: ['Posted on Instagram'], b: { c: 'from 8.8.4.4' } });
    expect(issues).toHaveLength(2);
  });
  test('passes fictional content', () => {
    expect(findSafetyIssues({ a: 'StreamCloud login from 203.0.113.47 via TopNet' })).toEqual([]);
  });
  test('flags real-looking web and email domains, allows reserved ones', () => {
    expect(
      findSafetyIssues([
        'https://lumen.example/search?q=volcano',
        'morgan.lee@hrs-students.example',
        '<a1b2@mail.hrs.example>',
        'see http://example.org',
      ]),
    ).toEqual([]);
    expect(findSafetyIssues(['https://news.com.au/x', 'judge@sciencefair.org'])).toHaveLength(2);
  });
  test('does not flag words that merely contain a brand', () => {
    expect(findSafetyIssues('a pineapple and some steamed buns')).toEqual([]);
  });
});

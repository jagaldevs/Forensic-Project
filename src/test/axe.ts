import axe from 'axe-core';

/**
 * Runs axe-core over a rendered container and returns readable violations ([] when clean).
 * Colour contrast is checked separately (src/styles/contrast.test.ts) because jsdom has no
 * layout or canvas; "region" is off because components are tested outside the page landmarks.
 */
export async function axeViolations(container: Element): Promise<string[]> {
  const results = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
  });
  return results.violations.flatMap((v) =>
    v.nodes.map((n) => `${v.id}: ${v.help}\n    ${n.html.slice(0, 160)}`),
  );
}

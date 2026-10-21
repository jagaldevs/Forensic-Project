# Accessibility

The lab aims for WCAG 2.2 AA. This page records what is checked automatically, what was checked
by hand in the Phase 5 audit (21 Oct 2026), and what still needs a real device.

## Automated (runs with `npm test`)

| Test                            | What it checks                                                                                                                                                                                                         |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/styles/contrast.test.ts`   | Reads `tokens.css` and checks every text/background pair in use (4.5:1) and the parts people must see to use the lab (field borders, focus ring, chart lines, board string: 3:1). Re-run it after changing any colour. |
| `src/a11y.test.tsx`             | axe-core over every evidence app in every case, with all evidence released, granted and pinned, plus the Teacher Panel.                                                                                                |
| `src/a11y.screens.test.tsx`     | axe-core over the agent, case list, academy, mission, Teacher Review, briefing, report and desktop screens.                                                                                                            |
| `src/apps/board/board.test.tsx` | Linking evidence to a claim by keyboard, with focus kept in place.                                                                                                                                                     |
| `src/ui/tabKeys.test.tsx`       | Arrow keys, Home and End in tab rows.                                                                                                                                                                                  |

axe can't judge colour in jsdom (the contrast test covers that) or whether something makes sense,
so the manual checks below still matter when apps change.

## Keyboard

| Where          | Keys                                                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Boot sequence  | Any key skips it                                                                                                             |
| Windows        | Focus the title bar, then arrow keys move it and Shift + arrow keys resize it. Closing the last window focuses its dock icon |
| Tab rows       | Left/Right (and Home/End) switch tabs: Judgements questions, Network Log households, Teacher Panel                           |
| Evidence board | Arrow keys move a focused card. **Link** jumps to the claims; Escape cancels; focus returns to the card afterwards           |
| Dialogs        | Focus stays inside; Escape closes; focus returns to the button that opened it                                                |
| Presenter view | Left/Right change question; Escape closes                                                                                    |
| Notifications  | They stay while focused or pointed at                                                                                        |

## Manual audit, 21 Oct 2026

Done in Chrome at 1280×800 and 820×1180 (iPad portrait), at normal and largest text size.

Fixed:

- Text fields, selects and checkboxes had 1.9:1 borders; now `--field-border` (3:1).
- The board string was 1.3:1 on the cork; it now has a pale halo.
- Closing the last window lost keyboard focus.
- Notifications disappeared after 12 s even while being read or tabbed to.
- The presenter view let focus escape behind it, and lost focus at the last question.
- Tab rows needed Tab for every tab; they now use arrow keys (one Tab stop).
- Keyboard linking on the board meant tabbing past every card to reach the claims.
- Repeated buttons had the same name ("Open case", "View", "Compare with previous version",
  "Show data table", "Link here"); each now says which case, version, chart or claim.
- The tamper warning is now a labelled region with a heading, so it shows in the headings list.
- At the largest text size on an iPad in portrait, Report and Leave case were pushed off the top
  bar; less important labels now hide below 1000px.
- Notifications from one case could still show (and open apps) after switching to another.

Checked and fine: Wearables charts (text summary plus data table), Email "Show original",
Browser filters, Cloud Drive version history, dialogs, toasts (polite live region), the Teacher
Panel, Teacher Review, and the text-size toggle on every screen.

## Still to check on real devices

- VoiceOver on an iPad (Safari) and ChromeVox on a Chromebook: a short run through one case.
- Touch: dragging windows and board cards, and the dock scrolling when it is wider than the screen.

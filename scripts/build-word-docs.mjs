/**
 * Builds Word copies of the teacher documents from their Markdown, so staff can copy them into
 * school templates. Run after editing the Markdown:  npm run docs:word
 *
 *   docs/teacher-brief.md            → docs/word/teacher-brief.docx
 *   docs/lessons/teacher-guide.md    → docs/word/teacher-guide.docx
 *   docs/lessons/student-lessons.md  → docs/word/student-lessons.docx
 *   docs/lessons/waterfront-checklist.md → docs/word/waterfront-checklist.docx
 *
 * Handles the Markdown these documents use: headings, paragraphs, bold/italic/code/links, bullet,
 * numbered and checkbox lists, tables, and "---" (a page break between lessons).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  LevelFormat,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { marked } from 'marked';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const logo = readFileSync(join(root, 'src/brand/haileybury-logo.jpg'));

const docs = [
  // The brief must fit one page: smaller text and margins.
  {
    src: 'docs/teacher-brief.md',
    out: 'teacher-brief.docx',
    title: 'Teacher brief',
    size: 18,
    margin: 850,
  },
  { src: 'docs/lessons/teacher-guide.md', out: 'teacher-guide.docx', title: 'Teacher guide' },
  { src: 'docs/lessons/student-lessons.md', out: 'student-lessons.docx', title: 'Student sheets' },
  // Printed for lesson 2; must fit one page, like the brief.
  {
    src: 'docs/lessons/waterfront-checklist.md',
    out: 'waterfront-checklist.docx',
    title: 'Waterfront checklist',
    size: 20,
    margin: 850,
    after: 40,
  },
];

// A4, 2 cm margins by default. Sizes in DXA (1/1440 inch) and half-points.
const PAGE = { width: 11906, height: 16838 };
let textWidth = 0;
const PLUM = '7B2A62';
const GREY = '555C66';
const FONT = 'Arial';

const decode = (s) =>
  s
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

/** Inline Markdown tokens → docx runs. */
function runs(tokens, style = {}) {
  const out = [];
  for (const t of tokens ?? []) {
    switch (t.type) {
      case 'strong':
        out.push(...runs(t.tokens, { ...style, bold: true }));
        break;
      case 'em':
        out.push(...runs(t.tokens, { ...style, italics: true }));
        break;
      case 'codespan':
        out.push(new TextRun({ ...style, text: decode(t.text), font: 'Consolas' }));
        break;
      case 'link':
        if (/^https?:/.test(t.href))
          out.push(
            new ExternalHyperlink({
              link: t.href,
              children: runs(t.tokens, { ...style, color: PLUM, underline: {} }),
            }),
          );
        else out.push(...runs(t.tokens, style)); // links between docs: keep the words
        break;
      case 'br':
        out.push(new TextRun({ ...style, break: 1 }));
        break;
      case 'text':
      case 'escape':
        if (t.tokens?.length) out.push(...runs(t.tokens, style));
        else out.push(new TextRun({ ...style, text: decode(t.text) }));
        break;
      default:
        if (t.text) out.push(new TextRun({ ...style, text: decode(t.text) }));
    }
  }
  return out;
}

let listInstance = 0;

/** Block Markdown tokens → docx paragraphs and tables. */
function blocks(tokens, opts, level = 0) {
  const out = [];
  for (const t of tokens) {
    switch (t.type) {
      case 'heading':
        out.push(
          new Paragraph({
            heading: [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3][
              Math.min(t.depth, 3) - 1
            ],
            children: runs(t.tokens),
            keepNext: true,
          }),
        );
        break;
      case 'paragraph':
        out.push(new Paragraph({ children: runs(t.tokens) }));
        break;
      case 'list': {
        const instance = ++listInstance;
        for (const item of t.items) {
          // Task lists start with a checkbox token; it becomes the ☐ in front of the text.
          const [first, ...rest] = item.tokens.filter((x) => x.type !== 'checkbox');
          const lead = item.task ? [new TextRun({ text: item.checked ? '☑ ' : '☐ ' })] : [];
          out.push(
            new Paragraph({
              // A checkbox is its own marker, so task items get no bullet.
              ...(item.task
                ? { indent: { left: 360 * (level + 1), hanging: 280 } }
                : {
                    numbering: t.ordered
                      ? { reference: 'numbers', level, instance }
                      : { reference: 'bullets', level },
                  }),
              children: [...lead, ...runs(first?.tokens ?? [first])],
            }),
          );
          out.push(...blocks(rest, opts, level + 1));
        }
        break;
      }
      case 'table':
        out.push(table(t), new Paragraph({ children: [] }));
        break;
      case 'hr':
        // A rule inside a list item is a blank answer line (a line of underscores in Markdown);
        // a top-level rule separates lessons.
        if (level > 0) {
          out.push(
            new Paragraph({
              spacing: { before: 280, after: 0 },
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '9AA0A8', space: 1 } },
              children: [],
            }),
          );
          break;
        }
        out.push(
          opts.pageBreaks
            ? new Paragraph({ children: [new PageBreak()] })
            : new Paragraph({
                border: {
                  bottom: { style: BorderStyle.SINGLE, size: 6, color: 'B9BEC6', space: 1 },
                },
                children: [],
              }),
        );
        break;
      case 'space':
        break;
      default:
        if (t.tokens) out.push(new Paragraph({ children: runs(t.tokens) }));
    }
  }
  return out;
}

/** Column widths in proportion to the longest text in each column (within limits). */
function table(t) {
  const cols = t.header.length;
  const longest = t.header.map((h, i) =>
    Math.max(h.text.length, ...t.rows.map((r) => r[i]?.text.length ?? 0)),
  );
  const weights = longest.map((n) => Math.min(Math.max(n, 9), 80));
  const sum = weights.reduce((a, b) => a + b, 0);
  const widths = weights.map((w) => Math.floor((w / sum) * textWidth));
  widths[cols - 1] += textWidth - widths.reduce((a, b) => a + b, 0);
  const cell = (c, i, header) =>
    new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      shading: header ? { type: ShadingType.CLEAR, color: 'auto', fill: 'EEF0F2' } : undefined,
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      children: [
        new Paragraph({ spacing: { after: 0 }, children: runs(c.tokens, { bold: header }) }),
      ],
    });
  return new Table({
    width: { size: textWidth, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({ tableHeader: true, children: t.header.map((c, i) => cell(c, i, true)) }),
      ...t.rows.map((r) => new TableRow({ children: r.map((c, i) => cell(c, i, false)) })),
    ],
  });
}

async function build({ src, out, title, size = 21, margin = 1134, after = 100 }) {
  listInstance = 0;
  textWidth = PAGE.width - 2 * margin;
  const tokens = marked.lexer(readFileSync(join(root, src), 'utf8'));
  const body = blocks(tokens, { pageBreaks: !src.endsWith('teacher-brief.md') });
  const bullet = (level) => ({
    level,
    format: LevelFormat.BULLET,
    text: ['•', '–', '•'][level],
    alignment: AlignmentType.LEFT,
    style: { paragraph: { indent: { left: 360 * (level + 1), hanging: 280 } } },
  });
  const number = (level) => ({
    level,
    format: level === 0 ? LevelFormat.DECIMAL : LevelFormat.LOWER_LETTER,
    text: `%${level + 1}.`,
    alignment: AlignmentType.LEFT,
    style: { paragraph: { indent: { left: 360 * (level + 1), hanging: 320 } } },
  });

  const doc = new Document({
    creator: 'HRS Digital Forensics Lab',
    title,
    styles: {
      default: { document: { run: { font: FONT, size }, paragraph: { spacing: { after } } } },
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: size + 13, bold: true, color: PLUM },
          paragraph: { spacing: { before: 120, after: 160 }, outlineLevel: 0 },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: size + 7, bold: true, color: '1D2127' },
          paragraph: { spacing: { before: 240, after: 100 }, outlineLevel: 1 },
        },
        {
          id: 'Heading3',
          name: 'Heading 3',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: size + 3, bold: true, color: '1D2127' },
          paragraph: { spacing: { before: 180, after: 80 }, outlineLevel: 2 },
        },
      ],
    },
    numbering: {
      config: [
        { reference: 'bullets', levels: [0, 1, 2].map(bullet) },
        { reference: 'numbers', levels: [0, 1, 2].map(number) },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE.width, height: PAGE.height },
            margin: {
              top: margin,
              bottom: margin,
              left: margin,
              right: margin,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `Haileybury Rendall School · Digital Forensics Lab · ${title}`,
                    size: 16,
                    color: GREY,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GREY })],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({
            children: [
              new ImageRun({
                type: 'jpg',
                data: logo,
                transformation: { width: 72, height: 72 },
                altText: { title: 'Haileybury', description: 'Haileybury logo', name: 'logo' },
              }),
            ],
          }),
          ...body,
        ],
      },
    ],
  });

  mkdirSync(join(root, 'docs/word'), { recursive: true });
  writeFileSync(join(root, 'docs/word', out), await Packer.toBuffer(doc));
  console.log(`docs/word/${out}`);
}

// Optional names build only those documents, e.g. `npm run docs:word -- waterfront-checklist`.
const only = process.argv.slice(2);
for (const d of docs) if (!only.length || only.some((n) => d.out.startsWith(n))) await build(d);

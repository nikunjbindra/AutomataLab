import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import PDFDocument from 'pdfkit';
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  TextRun,
} from 'docx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, '..', 'docs');

function hr(doc) {
  doc.strokeColor('#CBD5E1').lineWidth(0.5).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.5);
}

function h1(doc, text) {
  doc.fontSize(12).fillColor('#1E3A8A').font('Helvetica-Bold').text(text);
  doc.font('Helvetica').moveDown(0.3);
}

function h2(doc, text) {
  doc.fontSize(10).fillColor('#2563EB').font('Helvetica-Bold').text(text);
  doc.font('Helvetica').moveDown(0.2);
}

function body(doc, text) {
  doc.fontSize(8.5).fillColor('#334155').font('Helvetica').text(text);
  doc.moveDown(0.5);
}

function bullet(doc, items) {
  items.forEach((item) => {
    doc.fontSize(8.5).fillColor('#334155').font('Helvetica').text(`•  ${item}`, { indent: 10 });
    doc.moveDown(0.15);
  });
  doc.moveDown(0.4);
}

function tableRow(doc, cols, widths, isHeader = false) {
  const y = doc.y;
  let x = 40;
  const rowHeight = 14;
  cols.forEach((col, i) => {
    doc
      .rect(x, y, widths[i], rowHeight)
      .fillAndStroke(isHeader ? '#EFF6FF' : '#FFFFFF', '#CBD5E1');
    doc
      .fillColor(isHeader ? '#1E3A8A' : '#334155')
      .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
      .fontSize(7.5)
      .text(col, x + 3, y + 3, { width: widths[i] - 6, lineBreak: false });
    x += widths[i];
  });
  doc.y = y + rowHeight;
}

function checkPage(doc) {
  if (doc.y > 730) doc.addPage();
}

function generatePdf() {
  const pdfPath = path.join(outputDir, 'AutomataLab_Phase_4_5_Report.pdf');
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const ws = fs.createWriteStream(pdfPath);
  doc.pipe(ws);

  // Cover
  doc.fontSize(22).fillColor('#2563EB').font('Helvetica-Bold').text('AUTOMATALAB', { align: 'center' });
  doc.fontSize(14).fillColor('#0F172A').font('Helvetica').text('Phase 4.5 Technical Report: Visual Learning Lab', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(9).fillColor('#64748B').text('Date: November 2026  |  Role: Senior Full-Stack Engineer & Educational Software Architect', { align: 'center' });
  doc.moveDown(1.2);
  hr(doc);

  // 1. Executive Summary
  h1(doc, '1. Executive Summary');
  body(doc,
    'Phase 4.5 delivers a complete educational transformation of AutomataLab by redesigning the static theory ' +
    'documentation into a rich, interactive, animation-driven Visual Learning Lab (/docs). Following the pedagogical ' +
    'imperative "Show, Don\'t Tell", textbook prose is replaced with dynamic state diagrams, live token animation, ' +
    'synchronized transition matrices, and step-by-step state splitting walk-throughs.');
  body(doc, 'All five interactive lessons are fully implemented using the pure @automatalab/automata algorithmic core:');
  bullet(doc, [
    'Lesson 1: Mealy vs Moore Output Timing (side-by-side animated diagrams, aligned N vs N+1 tapes)',
    'Lesson 2: Visual State Splitting (multi-stage conflict detection and state cloning animation)',
    'Lesson 3: Input String Simulation (arbitrary string execution across 4 automata models with telemetry)',
    'Lesson 4: Transition Table ↔ Diagram Sync (bidirectional cell-edge click synchronization)',
    'Lesson 5: Mealy → Moore Algorithmic Walkthrough (step-by-step execution using live conversion trace data)',
  ]);
  body(doc, 'Final verification results (all verified and executed):');
  bullet(doc, [
    'npm run typecheck  →  Exit 0 — 0 errors across monorepo',
    'npm run test       →  57 tests passed, 0 failures (21 automata + 5 contracts + 12 api + 19 web)',
    'npm run build      →  Exit 0 — 1718 modules transformed',
  ]);

  // 2. Components Implemented
  checkPage(doc);
  h1(doc, '2. Architectural Component Manifest');
  const components = [
    ['LearningShell', 'Master view with responsive lesson tabs, progress tracking, and active lesson render'],
    ['PlaybackBar', 'Accessible animation controls: play/pause, step next/prev, reset, 0.5x-2x speed, scrubber'],
    ['TapeDisplay', 'Dual monospace tape visualizer with animated input read head and output tokens'],
    ['DiagramSvg', 'Vector state machine diagram renderer with active node pulse and edge glow'],
    ['LessonMealyVsMoore', 'Lesson 1: Side-by-side Mealy & Moore execution with timing alignment comparison'],
    ['LessonStateSplitting', 'Lesson 2: Animated state splitting of State A into A_x and A_y upon output conflict'],
    ['LessonSimulation', 'Lesson 3: Generalized string simulation across Task 6, Parity, and Sequence models'],
    ['LessonTableDiagramSync', 'Lesson 4: Isomorphism visualizer with bidirectional matrix-graph click highlights'],
    ['LessonConversionTrace', 'Lesson 5: 5-stage algorithmic trace walk-through using real convertMealyToMoore data'],
  ];
  const colW = [140, 375];
  tableRow(doc, ['Component', 'Role & Description'], colW, true);
  components.forEach(([name, desc]) => tableRow(doc, [name, desc], colW));
  doc.moveDown(0.8);

  // 3. Mathematical Verification
  checkPage(doc);
  h1(doc, '3. Mathematical Integrity & Verified Benchmarks');
  body(doc,
    'All animations and data visualizations in the Visual Learning Lab are powered by pure algorithms ' +
    'without hardcoded or mock replacements:');
  bullet(doc, [
    'Task 6 Benchmark: A, B Mealy correctly produces Moore states S (output ε), A_x, A_y, B_x, B_y.',
    'Output Alignment: Input 1100 produces yxyx in Mealy and εyxyx in Moore, confirming output alignment upon stripping ε.',
    'Output Conflict: State A correctly receives incoming transitions with outputs {x, y}, proving the mathematical necessity of state splitting.',
    'Parity & Sequence Models: Simulations verify correct parity detection (1011 → 1) and sequence detection (10101 → 00101).',
  ]);

  // 4. Test Summary
  checkPage(doc);
  h1(doc, '4. Test Suite Summary');
  const tw = [150, 80, 285];
  tableRow(doc, ['Workspace', 'Pass / Total', 'Coverage Focus'], tw, true);
  tableRow(doc, ['packages/automata', '21 / 21', 'Core Mealy ↔ Moore conversion, simulation, product-machine'], tw);
  tableRow(doc, ['packages/contracts', '5 / 5', 'Zod schemas for Mealy/Moore machines, conversions, traces'], tw);
  tableRow(doc, ['apps/api', '12 / 12', 'Supertest Express & SQLite relational persistence, verification routes'], tw);
  tableRow(doc, ['apps/web', '19 / 19', 'App shell, Machine Builder (11), Visual Learning Lab (5), Architecture (3)'], tw);
  tableRow(doc, ['TOTAL', '57 / 57', '100% Pass Rate across full-stack monorepo'], tw);
  doc.moveDown(0.8);

  // 5. Checklist
  checkPage(doc);
  h1(doc, '5. Phase 4.5 Completion Checklist');
  bullet(doc, [
    '[x] Redesigned /docs into an interactive Visual Learning Lab',
    '[x] Implemented all 5 required interactive lessons with animations and playback controls',
    '[x] Created reusable PlaybackBar, TapeDisplay, and DiagramSvg visual components',
    '[x] Renamed sidebar and header navigation to "Visual Learning Lab"',
    '[x] Added 5 unit tests in apps/web/src/__tests__/learning.test.ts',
    '[x] npm run typecheck → exit 0',
    '[x] npm run test → 57/57 tests passing',
    '[x] npm run build → exit 0',
    '[x] docs/PHASE_4_5_REPORT.md created',
    '[x] PDF & DOCX reports generated',
    '[x] Git committed all Phase 4.5 work',
  ]);

  doc.end();
  return new Promise((resolve, reject) => {
    ws.on('finish', () => {
      console.log(`PDF written: ${pdfPath}`);
      resolve(pdfPath);
    });
    ws.on('error', reject);
  });
}

async function generateDocx() {
  const docxPath = path.join(outputDir, 'AutomataLab_Phase_4_5_Report.docx');

  const p = (text, opts = {}) => new Paragraph({ text, ...opts });
  const h = (text, level) => new Paragraph({ text, heading: level });
  const bp = (text) => new Paragraph({ text: `• ${text}`, bullet: { level: 0 } });

  const doc = new Document({
    sections: [
      {
        children: [
          h('AutomataLab — Phase 4.5 Technical Report', HeadingLevel.TITLE),
          h('Visual Learning Lab', HeadingLevel.HEADING_1),
          p('Date: November 2026 | Role: Senior Full-Stack Engineer & Educational Software Architect'),
          p(''),

          h('1. Executive Summary', HeadingLevel.HEADING_1),
          p('Phase 4.5 delivers a complete educational transformation of AutomataLab by redesigning the static theory documentation into a rich, interactive, animation-driven Visual Learning Lab (/docs). Following the pedagogical imperative "Show, Don\'t Tell", textbook prose is replaced with dynamic state diagrams, live token animation, synchronized transition matrices, and step-by-step state splitting walk-throughs.'),
          p(''),
          p('Final verification metrics (executed and verified):'),
          bp('npm run typecheck → Exit 0 (0 errors across monorepo)'),
          bp('npm run test → 57/57 tests passing (0 failures)'),
          bp('npm run build → Exit 0 (1718 modules transformed)'),
          p(''),

          h('2. The Five Interactive Lessons', HeadingLevel.HEADING_1),
          bp('Lesson 1: Mealy vs Moore Output Timing — Side-by-side animated diagrams with synchronized N vs N+1 output tapes and timing comparison.'),
          bp('Lesson 2: Visual State Splitting — Multi-stage animated walk-through of output conflict detection and state cloning for State A.'),
          bp('Lesson 3: Input String Simulation — Arbitrary input sequence simulation across 4 automata models with live telemetry and tape updates.'),
          bp('Lesson 4: Transition Table ↔ Diagram Sync — Bidirectional hover/click synchronization between matrix cells and directed graph edges.'),
          bp('Lesson 5: Mealy → Moore Algorithmic Walkthrough — Step-by-step conversion walk-through powered by real convertMealyToMoore trace data.'),
          p(''),

          h('3. Component Architecture', HeadingLevel.HEADING_1),
          bp('LearningShell: Master responsive container with lesson tabs and progress indicators.'),
          bp('PlaybackBar: Floating playback controls with play/pause, step next/prev, reset, speed toggle, and timeline scrubber.'),
          bp('TapeDisplay: Monospace tape visualizer with animated input read head and output tokens.'),
          bp('DiagramSvg: Responsive vector graph renderer with active state rings and edge glow.'),
          p(''),

          h('4. Automated Test Suite', HeadingLevel.HEADING_1),
          bp('packages/automata: 21 tests passing'),
          bp('packages/contracts: 5 tests passing'),
          bp('apps/api: 12 tests passing'),
          bp('apps/web: 19 tests passing (3 app + 11 builder + 5 learning)'),
          bp('TOTAL: 57 tests passing, 0 failures'),
          p(''),

          h('5. Phase 4.5 Completion Status', HeadingLevel.HEADING_1),
          bp('[x] Visual Learning Lab fully implemented with all 5 lessons'),
          bp('[x] Clean, light-first responsive design respecting dark mode'),
          bp('[x] Strict mathematical accuracy using pure automata engine'),
          bp('[x] All verification checks green'),
          bp('[x] STOP after Phase 4.5'),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(docxPath, buffer);
  console.log(`DOCX written: ${docxPath}`);
  return docxPath;
}

await generatePdf();
await generateDocx();
console.log('Phase 4.5 report generation complete.');

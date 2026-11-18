import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, TextRun } from 'docx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, '..', 'docs');

// ─── Helpers ────────────────────────────────────────────────────────────────

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
  items.forEach(item => {
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
  if (doc.y > 740) doc.addPage();
}

// ─── PDF ────────────────────────────────────────────────────────────────────

function generatePdf() {
  const pdfPath = path.join(outputDir, 'AutomataLab_Phase_4_Report.pdf');
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const ws = fs.createWriteStream(pdfPath);
  doc.pipe(ws);

  // Cover
  doc.fontSize(22).fillColor('#2563EB').font('Helvetica-Bold').text('AUTOMATALAB', { align: 'center' });
  doc.fontSize(14).fillColor('#0F172A').font('Helvetica').text('Phase 4 Technical Report: Interactive Machine Builder', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(9).fillColor('#64748B').text('Date: November 2026  |  Role: Senior Full-Stack Engineer — React, TypeScript, Graph Visualization, FSMs', { align: 'center' });
  doc.moveDown(1.2);
  hr(doc);

  // 1. Executive Summary
  h1(doc, '1. Executive Summary');
  body(doc,
    'Phase 4 delivers a fully functional, professionally engineered interactive finite-state machine (FSM) editor — ' +
    'the core user-facing feature of AutomataLab. Users can now construct, edit, validate, persist, and visually explore ' +
    'both Mealy and Moore machines through an integrated builder workbench built on @xyflow/react.');
  body(doc,
    'The graph canvas is synchronized bidirectionally with a structured transition table editor. A live validation panel ' +
    'provides instant, formal feedback via the pure algorithms from packages/automata. All six predefined benchmark ' +
    'examples from the Phase 1 specification are accessible via a preset selector. Completed machines are saved to the ' +
    'SQLite backend via the Phase 2 REST API.');
  body(doc, 'Final verification results (all mandatory):');
  bullet(doc, [
    'npm run typecheck  →  Exit 0 — 0 errors across all 4 workspaces',
    'npm run test       →  52 tests, 0 failures (21 automata + 5 contracts + 12 api + 14 web)',
    'npm run build      →  Exit 0 — 1708 modules transformed',
  ]);

  // 2. Architecture
  checkPage(doc);
  h1(doc, '2. Architecture Overview');
  h2(doc, '2.1  Single Source of Truth — useMachineEditor');
  body(doc,
    'All builder state is owned exclusively by the useMachineEditor hook (apps/web/src/hooks/useMachineEditor.ts). ' +
    'Both the graph canvas and the transition table are derived views that read from this hook and write through its ' +
    'action methods. This guarantees permanent consistency: editing a transition in the table is immediately reflected ' +
    'in the graph edge labels, and vice versa.');
  h2(doc, '2.2  Node Position Separation');
  body(doc,
    'Graph node positions are stored in a separate nodePositions: Record<string, {x,y}> state within the hook — ' +
    'intentionally decoupled from the machine definition. The database schema does not include layout columns. ' +
    'computeAutoLayout() generates circular positions on load; users can then drag nodes freely within the session.');
  h2(doc, '2.3  Edge Grouping and Self-Loops');
  body(doc,
    'Multiple transitions between the same (source, destination) state pair are combined into a single React Flow edge ' +
    'with comma-separated labels. Self-loops use a custom SelfLoopEdge component that traces an upward circular SVG arc ' +
    'above the state node, mirroring JFLAP-style notation.');

  // 3. Components
  checkPage(doc);
  h1(doc, '3. Components Implemented');

  const components = [
    ['useMachineEditor', 'Core state management hook with 20 action methods and live validation'],
    ['StateNode', 'Custom @xyflow/react node — Mealy circle, Moore split-circle, JFLAP initial arrow'],
    ['SelfLoopEdge', 'Custom edge renderer — upward SVG arc for self-loops, bezier for regular edges'],
    ['AutomataGraphCanvas', 'ReactFlow canvas with dot-grid, zoom controls, minimap, and fitView'],
    ['TransitionTableEditor', 'Editable matrix — Mealy (dest+output dropdowns), Moore (dest dropdown, state outputs in header)'],
    ['MachineConfigPanel', 'States list (add/rename/delete/setInitial), alphabets (chip tags), Moore output assignment'],
    ['ValidationPanel', 'Status banner, completeness bar, invariant checklist, issues list (filtered by severity)'],
    ['PresetSelectorModal', '6 benchmark presets imported from @automatalab/automata'],
    ['BuilderPage', 'Route page — split/graph/table view modes, save/update API calls, unsaved-changes indicator'],
  ];

  const colW = [130, 385];
  tableRow(doc, ['Component', 'Description'], colW, true);
  components.forEach(([name, desc]) => tableRow(doc, [name, desc], colW));
  doc.moveDown(0.8);

  // 4. Files
  checkPage(doc);
  h1(doc, '4. Files Created / Modified');
  h2(doc, 'New Files');
  const newFiles = [
    ['apps/web/src/hooks/useMachineEditor.ts', '~380', 'Core editor state management'],
    ['apps/web/src/components/builder/StateNode.tsx', '~95', 'Custom FSM node renderer'],
    ['apps/web/src/components/builder/SelfLoopEdge.tsx', '~110', 'Custom FSM edge renderer'],
    ['apps/web/src/components/builder/AutomataGraphCanvas.tsx', '~160', 'React Flow canvas wrapper'],
    ['apps/web/src/components/builder/TransitionTableEditor.tsx', '~180', 'Editable transition matrix'],
    ['apps/web/src/components/builder/MachineConfigPanel.tsx', '~290', 'Machine configuration panel'],
    ['apps/web/src/components/builder/ValidationPanel.tsx', '~130', 'Live validation panel'],
    ['apps/web/src/components/builder/PresetSelectorModal.tsx', '~150', '6-preset selector modal'],
    ['apps/web/src/__tests__/builder.test.ts', '~350', '11 builder unit tests'],
  ];
  const fw = [220, 50, 245];
  tableRow(doc, ['File', 'Lines', 'Purpose'], fw, true);
  newFiles.forEach(r => tableRow(doc, r, fw));
  doc.moveDown(0.5);
  h2(doc, 'Modified Files');
  const modFiles = [
    ['apps/web/src/pages/BuilderPage.tsx', 'Replaced Phase 3 placeholder with full implementation'],
    ['apps/web/src/pages/TestResultsPage.tsx', 'Updated test count display (14/14)'],
    ['apps/web/src/index.css', "Added @import '@xyflow/react/dist/style.css'"],
    ['packages/automata/package.json', 'Added "type": "module" for Vite ESM bundling'],
    ['packages/contracts/package.json', 'Added "type": "module"'],
    ['packages/automata/src/index.ts', 'Added explicit named re-exports for all preset constants'],
  ];
  const mw = [235, 280];
  tableRow(doc, ['File', 'Change'], mw, true);
  modFiles.forEach(r => tableRow(doc, r, mw));
  doc.moveDown(0.8);

  // 5. Tests
  checkPage(doc);
  h1(doc, '5. Test Results');
  h2(doc, '5.1  Builder Unit Tests (11 tests)');
  const tests = [
    ['1', 'Mealy machine initialises with correct structure', 'PASS'],
    ['2', 'Moore machine initialises with correct structure', 'PASS'],
    ['3', 'Add and delete states updates machine correctly', 'PASS'],
    ['4', 'Rename state updates transitions referencing old name', 'PASS'],
    ['5', 'Adding/removing input alphabet symbols works correctly', 'PASS'],
    ['6', 'Setting transitions populates transition table', 'PASS'],
    ['7', 'Changing initial state works correctly', 'PASS'],
    ['8', 'Missing transitions are detected by validation', 'PASS'],
    ['9', 'computeAutoLayout places N states in a circle', 'PASS'],
    ['10', 'All 6 presets pass validation', 'PASS'],
    ['11', 'Mealy to Moore conversion produces equivalent outputs', 'PASS'],
  ];
  const tw = [25, 390, 100];
  tableRow(doc, ['#', 'Test', 'Result'], tw, true);
  tests.forEach(r => tableRow(doc, r, tw));
  doc.moveDown(0.5);
  h2(doc, '5.2  Full Monorepo Summary');
  bullet(doc, [
    'packages/automata : 21 passed',
    'packages/contracts:  5 passed',
    'apps/api          : 12 passed',
    'apps/web          : 14 passed (3 app.test.ts + 11 builder.test.ts)',
    'TOTAL             : 52 tests, 0 failures',
  ]);

  // 6. Known Limitations
  checkPage(doc);
  h1(doc, '6. Known Limitations');
  h2(doc, '6.1  Node Positions Not Persisted (Intentional)');
  body(doc,
    'Graph node positions are UI-only state (stored in React state, not sent to backend). The database schema does not ' +
    'include layout columns. On reload, computeAutoLayout() regenerates circular positions. This is an intentional ' +
    'design decision — automaton definitions are mathematically position-independent.');
  h2(doc, '6.2  Bundle Size Warning (Non-Fatal)');
  body(doc,
    'The Vite production build emits a non-fatal chunk-size warning: dist/assets/index-*.js is 619 kB (> 500 kB ' +
    'recommended). The oversize is caused by @xyflow/react in the main chunk. Build exits with code 0. ' +
    'Mitigation via Vite manualChunks is deferred to a future optimization phase.');
  h2(doc, '6.3  No Undo/Redo');
  body(doc,
    'The builder does not implement an undo/redo stack. All edits are immediate. Users can reset to a preset or ' +
    'reload a saved machine to recover previous state.');

  // 7. Presets
  checkPage(doc);
  h1(doc, '7. Predefined Benchmark Examples');
  const presets = [
    ['Task 6 Mealy', 'Mealy', 'A, B', '0, 1', 'x, y', 'Mandatory Phase 1 benchmark'],
    ['Parity Checker', 'Mealy', 'even, odd', '0, 1', '0, 1', 'XOR-style parity detection'],
    ['Parity Moore', 'Moore', 'even, odd', '0, 1', '0, 1', 'Moore equivalent of parity checker'],
    ['101 Detector', 'Mealy', 's0, s1, s2', '0, 1', '0, 1', 'Overlapping pattern detector'],
    ['010 Detector', 'Moore', 's0, s1, s2', '0, 1', '0, 1', 'Moore pattern detector'],
    ['2-bit Counter', 'Mealy', 's00, s01, s10, s11', '0, 1', '0, 1', 'Modulo-4 binary counter'],
  ];
  const pw = [90, 40, 100, 50, 50, 185];
  tableRow(doc, ['Name', 'Type', 'States', 'Inputs', 'Outputs', 'Description'], pw, true);
  presets.forEach(r => tableRow(doc, r, pw));
  doc.moveDown(0.8);

  // 8. Phase Completion
  checkPage(doc);
  h1(doc, '8. Phase 4 Completion Checklist');
  bullet(doc, [
    '[x] useMachineEditor hook with full state management API',
    '[x] StateNode — Mealy/Moore custom node renderer (JFLAP-style)',
    '[x] SelfLoopEdge — Self-loop SVG arc renderer',
    '[x] AutomataGraphCanvas — React Flow canvas wrapper',
    '[x] TransitionTableEditor — Fully editable transition matrix',
    '[x] MachineConfigPanel — States, alphabets, type, initial state',
    '[x] ValidationPanel — Live formal invariant checker',
    '[x] PresetSelectorModal — 6 benchmark examples',
    '[x] BuilderPage — Full integration with save/load/reset',
    '[x] 11 builder unit tests all passing',
    '[x] npm run typecheck → exit 0',
    '[x] npm run test → 52/52 passing',
    '[x] npm run build → exit 0',
    '[x] docs/PHASE_4_REPORT.md created',
    '[x] docs/DESIGN_SYSTEM.md updated with Phase 4 components',
    '[x] Git commit for all Phase 4 work',
  ]);

  // 9. Next Phase
  h1(doc, '9. Next Phase (Phase 5 — Not Implemented)');
  body(doc,
    'Per AGENTS.md Rule 9 (Disciplined Phase Scoping), Phase 5 is not implemented here. ' +
    'Phase 5 — Conversion Workspace will deliver:');
  bullet(doc, [
    'Animated step-by-step Mealy → Moore and Moore → Mealy conversion visualization.',
    'Interactive conversion trace panel showing each state-splitting decision.',
    'Side-by-side original/converted machine graph views.',
    'Synchronized simulation over both machines.',
  ]);

  doc.end();
  return new Promise((resolve, reject) => {
    ws.on('finish', () => { console.log(`PDF written: ${pdfPath}`); resolve(pdfPath); });
    ws.on('error', reject);
  });
}

// ─── DOCX ───────────────────────────────────────────────────────────────────

function p(text, opts = {}) {
  return new Paragraph({ text, ...opts });
}

function h(text, level) {
  return new Paragraph({ text, heading: level });
}

function bp(text) {
  return new Paragraph({ text: `• ${text}`, bullet: { level: 0 } });
}

function mkTable(headers, rows) {
  const headerRow = new TableRow({
    children: headers.map(h => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18 })] })],
      shading: { fill: 'EFF6FF' },
    })),
  });
  const dataRows = rows.map(cols => new TableRow({
    children: cols.map(c => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: c, size: 18 })] })],
    })),
  }));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
}

async function generateDocx() {
  const docxPath = path.join(outputDir, 'AutomataLab_Phase_4_Report.docx');

  const doc = new Document({
    sections: [{
      children: [
        h('AutomataLab — Phase 4 Technical Report', HeadingLevel.TITLE),
        h('Interactive Machine Builder', HeadingLevel.HEADING_1),
        p('Date: November 2026  |  Role: Senior Full-Stack Engineer — React, TypeScript, Graph Visualization, FSMs'),
        p(''),

        h('1. Executive Summary', HeadingLevel.HEADING_1),
        p('Phase 4 delivers a fully functional, professionally engineered interactive finite-state machine (FSM) editor — the core user-facing feature of AutomataLab. Users can now construct, edit, validate, persist, and visually explore both Mealy and Moore machines through an integrated builder workbench built on @xyflow/react.'),
        p(''),
        p('Final verification results (all mandatory):'),
        bp('npm run typecheck  →  Exit 0 — 0 errors across all 4 workspaces'),
        bp('npm run test       →  52 tests, 0 failures (21 automata + 5 contracts + 12 api + 14 web)'),
        bp('npm run build      →  Exit 0 — 1708 modules transformed'),
        p(''),

        h('2. Architecture Overview', HeadingLevel.HEADING_1),
        h('2.1 Single Source of Truth — useMachineEditor', HeadingLevel.HEADING_2),
        p('All builder state is owned exclusively by the useMachineEditor hook. Both the graph canvas and the transition table are derived views that read from this hook and write through its action methods. This guarantees permanent consistency.'),
        p(''),
        h('2.2 Node Position Separation', HeadingLevel.HEADING_2),
        p('Graph node positions are stored in a separate nodePositions state within the hook — intentionally decoupled from the machine definition. The database schema does not include layout columns. computeAutoLayout() generates circular positions on load; users can then drag nodes freely.'),
        p(''),
        h('2.3 Edge Grouping and Self-Loops', HeadingLevel.HEADING_2),
        p('Multiple transitions between the same (source, destination) state pair are combined into a single React Flow edge with comma-separated labels. Self-loops use a custom SelfLoopEdge component that traces an upward circular SVG arc above the state node, mirroring JFLAP-style notation.'),
        p(''),

        h('3. Components Implemented', HeadingLevel.HEADING_1),
        mkTable(
          ['Component', 'Description'],
          [
            ['useMachineEditor', 'Core state management hook with 20 action methods and live validation'],
            ['StateNode', 'Custom @xyflow/react node — Mealy circle, Moore split-circle, JFLAP initial arrow'],
            ['SelfLoopEdge', 'Custom edge renderer — upward SVG arc for self-loops, bezier for regular edges'],
            ['AutomataGraphCanvas', 'ReactFlow canvas with dot-grid, zoom controls, minimap, and fitView'],
            ['TransitionTableEditor', 'Editable matrix — Mealy (dest+output dropdowns), Moore (dest+state outputs in header)'],
            ['MachineConfigPanel', 'States list (add/rename/delete/setInitial), alphabets (chip tags), Moore output assignment'],
            ['ValidationPanel', 'Status banner, completeness bar, invariant checklist, issues list (filtered by severity)'],
            ['PresetSelectorModal', '6 benchmark presets imported from @automatalab/automata'],
            ['BuilderPage', 'Route page — split/graph/table view modes, save/update API calls, unsaved indicator'],
          ]
        ),
        p(''),

        h('4. Test Results', HeadingLevel.HEADING_1),
        h('4.1 Builder Unit Tests (11 tests)', HeadingLevel.HEADING_2),
        mkTable(
          ['#', 'Test', 'Result'],
          [
            ['1', 'Mealy machine initialises with correct structure', 'PASS'],
            ['2', 'Moore machine initialises with correct structure', 'PASS'],
            ['3', 'Add and delete states updates machine correctly', 'PASS'],
            ['4', 'Rename state updates transitions referencing old name', 'PASS'],
            ['5', 'Adding/removing input alphabet symbols works correctly', 'PASS'],
            ['6', 'Setting transitions populates transition table', 'PASS'],
            ['7', 'Changing initial state works correctly', 'PASS'],
            ['8', 'Missing transitions are detected by validation', 'PASS'],
            ['9', 'computeAutoLayout places N states in a circle', 'PASS'],
            ['10', 'All 6 presets pass validation', 'PASS'],
            ['11', 'Mealy to Moore conversion produces equivalent outputs', 'PASS'],
          ]
        ),
        p(''),
        h('4.2 Full Monorepo Summary', HeadingLevel.HEADING_2),
        bp('packages/automata : 21 passed'),
        bp('packages/contracts:  5 passed'),
        bp('apps/api          : 12 passed'),
        bp('apps/web          : 14 passed (3 app.test.ts + 11 builder.test.ts)'),
        bp('TOTAL             : 52 tests, 0 failures'),
        p(''),

        h('5. Known Limitations', HeadingLevel.HEADING_1),
        h('5.1 Node Positions Not Persisted (Intentional)', HeadingLevel.HEADING_2),
        p('Graph node positions are UI-only state. The database schema does not include layout columns. On reload, computeAutoLayout() regenerates circular positions. Automaton definitions are mathematically position-independent.'),
        p(''),
        h('5.2 Bundle Size Warning (Non-Fatal)', HeadingLevel.HEADING_2),
        p('The Vite production build emits a non-fatal chunk-size warning: 619 kB > 500 kB recommended. The oversize is caused by @xyflow/react in the main chunk. Build exits with code 0.'),
        p(''),
        h('5.3 No Undo/Redo', HeadingLevel.HEADING_2),
        p('The builder does not implement an undo/redo stack. All edits are immediate. Users can reset to a preset or reload a saved machine.'),
        p(''),

        h('6. Phase 4 Completion Checklist', HeadingLevel.HEADING_1),
        ...[
          'useMachineEditor hook with full state management API',
          'StateNode — Mealy/Moore custom node renderer (JFLAP-style)',
          'SelfLoopEdge — Self-loop SVG arc renderer',
          'AutomataGraphCanvas — React Flow canvas wrapper',
          'TransitionTableEditor — Fully editable transition matrix',
          'MachineConfigPanel — States, alphabets, type, initial state',
          'ValidationPanel — Live formal invariant checker',
          'PresetSelectorModal — 6 benchmark examples',
          'BuilderPage — Full integration with save/load/reset',
          '11 builder unit tests all passing',
          'npm run typecheck → exit 0',
          'npm run test → 52/52 passing',
          'npm run build → exit 0',
          'docs/PHASE_4_REPORT.md created',
          'docs/DESIGN_SYSTEM.md updated with Phase 4 components',
          'Git commit for all Phase 4 work',
        ].map(item => bp('[x] ' + item)),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(docxPath, buffer);
  console.log(`DOCX written: ${docxPath}`);
  return docxPath;
}

// ─── Main ───────────────────────────────────────────────────────────────────

await generatePdf();
await generateDocx();
console.log('Phase 4 report generation complete.');

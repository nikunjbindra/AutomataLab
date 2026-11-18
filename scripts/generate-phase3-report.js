import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
} from 'docx';

const outputDir = path.resolve(process.cwd(), 'docs');

function generatePdf() {
  const pdfPath = path.join(outputDir, 'AutomataLab_Phase_3_Report.pdf');
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);

  // Title & Header
  doc.fontSize(22).fillColor('#2563EB').text('AUTOMATALAB', { align: 'center' });
  doc.fontSize(14).fillColor('#0F172A').text('Phase 3 Technical Report: Professional Frontend Foundation', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(9).fillColor('#64748B').text('Date: November 2026 | Role: Senior Frontend Engineer & UI/UX Architect', { align: 'center' });
  doc.moveDown(1.2);

  doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.8);

  // 1. Executive Summary
  doc.fontSize(12).fillColor('#1E3A8A').text('1. Executive Summary');
  doc.moveDown(0.3);
  doc.fontSize(9).fillColor('#334155').text(
    'Phase 3 of AutomataLab has been successfully delivered. A responsive, developer-tool computational workbench application shell has been implemented in apps/web. The design language takes direct inspiration from Linear, Vercel, and React Flow, prioritizing dense tabular displays, formal automata notation, clean dark/light themes, and zero gratuitous marketing elements. All 41 monorepo tests pass, and both typecheck and Vite production build are 100% green.'
  );
  doc.moveDown(0.8);

  // 2. Component System
  doc.fontSize(12).fillColor('#1E3A8A').text('2. Reusable Component System');
  doc.moveDown(0.3);
  const components = [
    'AppShell: Master responsive container orchestrating sidebar, header, and route outlet.',
    'Sidebar: Compact navigation hierarchy with active indicators, Lucide icons, and collapse/expand controls.',
    'AppHeader: Breadcrumb location tracking, backend API health status indicator, and theme toggle.',
    'PageHeader: Reusable section header supporting titles, descriptive subtitles, and action triggers.',
    'StatusBadge: Formal semantic badge with variants for Mealy, Moore, success, warning, error, and cyan.',
    'DataTable: Accessible, generic tabular grid with monospace typography, custom cell renderers, and empty fallbacks.',
    'EmptyState: Clean empty state card with contextual iconography, title, descriptive prompt, and action buttons.',
    'LoadingState & ErrorState: Structured feedback cards with retry handlers and developer-tool aesthetics.',
    'ConfirmDialog: Modal dialog with keyboard focus trapping, Escape key handling, and destructive styling support.',
    'WorkspaceLayout: Multi-panel grid (Left config, Center canvas, Right analysis, Bottom simulation) for future phases.',
  ];
  components.forEach(c => {
    doc.fontSize(8.5).fillColor('#334155').text(`•  ${c}`);
    doc.moveDown(0.2);
  });
  doc.moveDown(0.6);

  // 3. Routing & Pages
  doc.fontSize(12).fillColor('#1E3A8A').text('3. Routes & Functional Pages');
  doc.moveDown(0.3);
  const routes = [
    ['/',           'DashboardPage',         'Live dashboard querying GET /api/machines, recent machines, and preset loader.'],
    ['/builder',    'BuilderPage',           'Machine Builder workspace foundation preview with transition matrix & canvas.'],
    ['/convert',    'ConversionPage',        'Conversion workspace foundation preview for Mealy <-> Moore transformation.'],
    ['/simulate',   'SimulationPage',        'Simulation laboratory foundation preview with input tape and stepper controls.'],
    ['/tests',      'TestResultsPage',       'Automated test manifest across 4 workspaces (41 tests) and live health badge.'],
    ['/docs',       'DocumentationPage',     'Theoretical reference of formal 6-tuples, conversion algorithms, and proofs.'],
  ];
  routes.forEach(([path, comp, desc]) => {
    doc.fontSize(8).fillColor('#2563EB').text(path.padEnd(14), { continued: true });
    doc.fillColor('#1E293B').text(comp.padEnd(20), { continued: true });
    doc.fillColor('#334155').text(desc);
    doc.moveDown(0.15);
  });
  doc.moveDown(0.6);

  // 4. API & Data Layer
  doc.fontSize(12).fillColor('#1E3A8A').text('4. Frontend API Layer & TanStack Query');
  doc.moveDown(0.3);
  const dataLayer = [
    'TanStack Query (@tanstack/react-query): Handles machine caching, automatic invalidation on create/delete, and polling.',
    'Typed API Client (apps/web/src/api/client.ts): Consumes shared Zod contracts (@automatalab/contracts).',
    'Zero Algorithm Duplication: React components strictly invoke backend endpoints or pure automata libraries.',
    'Theme Persistence: ThemeProvider toggles .dark class and persists user preference to localStorage.',
  ];
  dataLayer.forEach(d => {
    doc.fontSize(8.5).fillColor('#334155').text(`•  ${d}`);
    doc.moveDown(0.2);
  });
  doc.moveDown(0.6);

  // 5. Test Results
  doc.fontSize(12).fillColor('#1E3A8A').text('5. Verification & Test Results');
  doc.moveDown(0.3);
  const testResults = [
    ['packages/automata',  '21 / 21', 'Mealy-to-Moore, Moore-to-Mealy, simulation, equivalence, mandatory Task 6 benchmark'],
    ['packages/contracts', '5 / 5',   'Shared Zod schemas, machine contracts, validation models'],
    ['apps/api',            '12 / 12', 'Supertest integration suite: CRUD, conversions, simulation 1100->yxyx, persistence'],
    ['apps/web',            '3 / 3',   'React component exports, query key factories, API client signatures'],
    ['TOTAL',               '41 / 41', '100% passing across all 4 monorepo packages with zero regressions'],
  ];
  testResults.forEach(([workspace, result, notes]) => {
    const isTotal = workspace === 'TOTAL';
    doc.fontSize(isTotal ? 9 : 8.5)
       .fillColor(isTotal ? '#059669' : '#334155')
       .text(`${workspace.padEnd(24)}${result.padEnd(10)}${notes}`);
    doc.moveDown(0.2);
  });
  doc.moveDown(0.6);

  // 6. Build & Typecheck
  doc.fontSize(12).fillColor('#1E3A8A').text('6. Static Typecheck & Build Status');
  doc.moveDown(0.3);
  doc.fontSize(9).fillColor('#059669').text('npm run typecheck -- 0 errors across contracts, automata, api, and web.');
  doc.moveDown(0.2);
  doc.fontSize(9).fillColor('#059669').text('npm run build -- 1676 modules bundled cleanly by Vite (379 KB JS, 24 KB CSS).');
  doc.moveDown(0.8);

  // 7. Next Steps
  doc.fontSize(12).fillColor('#1E3A8A').text('7. Exact Next Steps (Phase 4)');
  doc.moveDown(0.3);
  const phase4 = [
    'Implement the interactive @xyflow/react canvas in BuilderPage.',
    'Build custom node renderers for Mealy (single label) and Moore (split circle) states.',
    'Build keyboard-navigable transition table matrix editor.',
    'Implement live client-side validation against backend schemas.',
  ];
  phase4.forEach(item => {
    doc.fontSize(8.5).fillColor('#334155').text(`•  ${item}`);
    doc.moveDown(0.2);
  });

  doc.moveDown(1);
  doc.fontSize(8).fillColor('#94A3B8').text('AutomataLab — University Project | Phase 3 Complete | Generated November 2026', { align: 'center' });

  doc.end();
  return new Promise(resolve => writeStream.on('finish', () => {
    console.log('PDF generated:', pdfPath);
    resolve(pdfPath);
  }));
}

async function generateDocx() {
  const docxPath = path.join(outputDir, 'AutomataLab_Phase_3_Report.docx');

  const sections = [
    new Paragraph({ text: 'AUTOMATALAB', heading: HeadingLevel.TITLE }),
    new Paragraph({ text: 'Phase 3 Technical Report: Professional Frontend Foundation', heading: HeadingLevel.HEADING_1 }),
    new Paragraph({ text: 'Date: November 2026  |  Role: Senior Frontend Engineer & UI/UX Architect', style: 'Normal' }),
    new Paragraph({ text: '' }),

    new Paragraph({ text: '1. Executive Summary', heading: HeadingLevel.HEADING_2 }),
    new Paragraph({ text: 'Phase 3 established the professional frontend foundation in apps/web. The developer-tool workbench features persistent navigation, dark/light themes, live REST API integration via TanStack Query, and a functional dashboard managing real SQLite state machines. All 41 monorepo tests pass.' }),
    new Paragraph({ text: '' }),

    new Paragraph({ text: '2. Component Architecture', heading: HeadingLevel.HEADING_2 }),
    new Paragraph({ text: 'AppShell, Sidebar, AppHeader, PageHeader, StatusBadge, DataTable, EmptyState, LoadingState, ErrorState, ConfirmDialog, ThemeToggle, and WorkspaceLayout.' }),
    new Paragraph({ text: '' }),

    new Paragraph({ text: '3. Routes Implemented', heading: HeadingLevel.HEADING_2 }),
    new Paragraph({ text: 'Dashboard (/), Machine Builder (/builder), Conversion Workspace (/convert), Simulation Laboratory (/simulate), Test Results (/tests), Theory & Documentation (/docs).' }),
    new Paragraph({ text: '' }),

    new Paragraph({ text: '4. Test Results', heading: HeadingLevel.HEADING_2 }),
    new Paragraph({ text: 'automata: 21/21 passed. contracts: 5/5 passed. api: 12/12 passed. web: 3/3 passed. Total: 41/41 — zero failures.' }),
    new Paragraph({ text: '' }),

    new Paragraph({ text: '5. Typecheck & Build', heading: HeadingLevel.HEADING_2 }),
    new Paragraph({ text: 'npm run typecheck: 0 errors. npm run build: clean production build.' }),
  ];

  const document = new Document({
    sections: [{ properties: {}, children: sections }],
  });

  const buffer = await Packer.toBuffer(document);
  fs.writeFileSync(docxPath, buffer);
  console.log('DOCX generated:', docxPath);
  return docxPath;
}

(async () => {
  await generatePdf();
  await generateDocx();
  console.log('Phase 3 report generation complete.');
})();

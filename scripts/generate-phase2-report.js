import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  AlignmentType,
} from 'docx';

const outputDir = path.resolve(process.cwd(), 'docs');

function generatePdf() {
  const pdfPath = path.join(outputDir, 'AutomataLab_Phase_2_Report.pdf');
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);

  // Title & Header
  doc.fontSize(22).fillColor('#2563EB').text('AUTOMATALAB', { align: 'center' });
  doc.fontSize(14).fillColor('#0F172A').text('Phase 2 Technical Report: Backend, Database & REST API Integration', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(9).fillColor('#64748B').text('Date: November 2026 | Role: Lead Software Engineer | Full-Stack University Project', { align: 'center' });
  doc.moveDown(1.2);

  doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.8);

  // 1. Executive Summary
  doc.fontSize(12).fillColor('#1E3A8A').text('1. Executive Summary');
  doc.moveDown(0.3);
  doc.fontSize(9).fillColor('#334155').text(
    'Phase 2 of AutomataLab has been completed. A 6-table SQLite database with Drizzle ORM, a layered service architecture (controllers, services, repositories), and an 18-endpoint REST API were implemented. All 39 tests across the monorepo pass. TypeScript typecheck and production build are clean.'
  );
  doc.moveDown(0.8);

  // 2. Architecture
  doc.fontSize(12).fillColor('#1E3A8A').text('2. Backend Architecture');
  doc.moveDown(0.3);
  const archLayers = [
    'Controller Layer (apps/api/src/controllers): HTTP request parsing, Zod validation, response shaping. No SQL or business logic.',
    'Service Layer (apps/api/src/services): Orchestrates conversion, simulation, validation. Imports pure algorithms from packages/automata. Saves history records via repositories.',
    'Repository Layer (apps/api/src/repositories): All Drizzle ORM queries. Transactional create/update for machines including their states and transitions.',
    'Database (SQLite + libsql + Drizzle ORM): 6 tables, foreign keys, cascade deletes, unique constraints, UUID primary keys.',
    'packages/automata: Pure algorithmic core. No Express, Drizzle, or React imports. Strict TypeScript, side-effect-free.',
  ];
  archLayers.forEach(layer => {
    doc.fontSize(8.5).fillColor('#334155').text(`•  ${layer}`);
    doc.moveDown(0.2);
  });
  doc.moveDown(0.6);

  // 3. Database Schema
  doc.fontSize(12).fillColor('#1E3A8A').text('3. Database Schema (6 Tables)');
  doc.moveDown(0.3);
  const tables = [
    ['machines', 'Core table storing machine definitions as JSON with metadata columns (name, type, initial_state, alphabet, output_alphabet, timestamps)'],
    ['states', 'Individual states per machine. FK to machines with CASCADE DELETE. UNIQUE(machine_id, name).'],
    ['transitions', 'State transitions per machine. FK to machines with CASCADE DELETE. UNIQUE(machine_id, from_state, input_symbol).'],
    ['conversion_runs', 'History of Mealy<->Moore conversions including source/result machine data, conversion steps, and metrics.'],
    ['test_cases', 'Named test cases per machine with input sequences and expected outputs.'],
    ['simulation_runs', 'History of simulation executions including input tape, output tape, and step-by-step trace.'],
  ];
  tables.forEach(([name, desc]) => {
    doc.fontSize(9).fillColor('#1E40AF').text(name, { continued: true });
    doc.fontSize(8.5).fillColor('#334155').text(`  ${desc}`);
    doc.moveDown(0.3);
  });
  doc.moveDown(0.5);

  // 4. REST API Endpoints
  doc.fontSize(12).fillColor('#1E3A8A').text('4. REST API Endpoints (18 Routes)');
  doc.moveDown(0.3);
  const endpoints = [
    ['GET',    '/api/health',                      'Server health check'],
    ['GET',    '/api/machines',                     'List all machines (optional ?type= filter)'],
    ['GET',    '/api/machines/:id',                 'Get machine by ID'],
    ['POST',   '/api/machines',                     'Create and persist a machine'],
    ['PUT',    '/api/machines/:id',                 'Update machine (full transactional replace)'],
    ['DELETE', '/api/machines/:id',                 'Delete machine + cascade states/transitions'],
    ['POST',   '/api/conversions',                  'Convert machine (generic endpoint)'],
    ['GET',    '/api/conversions',                  'List conversion history'],
    ['GET',    '/api/conversions/:id',              'Get specific conversion run'],
    ['POST',   '/api/convert/mealy-to-moore',       'Convert Mealy to Moore (alias)'],
    ['POST',   '/api/convert/moore-to-mealy',       'Convert Moore to Mealy (alias)'],
    ['POST',   '/api/simulations',                  'Simulate machine on input string'],
    ['GET',    '/api/simulations',                  'List simulation history'],
    ['GET',    '/api/simulations/:id',              'Get specific simulation run'],
    ['POST',   '/api/simulate',                     'Simulate machine (alias)'],
    ['POST',   '/api/validations',                  'Validate machine definition'],
    ['POST',   '/api/verify-equivalence',           'Verify behavioral equivalence'],
    ['POST',   '/api/verifications',                'Verify equivalence (alias)'],
  ];
  endpoints.forEach(([method, route, desc]) => {
    const methodColor = method === 'GET' ? '#059669' : method === 'POST' ? '#2563EB' : method === 'PUT' ? '#D97706' : '#DC2626';
    doc.fontSize(8).fillColor(methodColor).text(method.padEnd(7), { continued: true });
    doc.fillColor('#1E293B').text(route.padEnd(42), { continued: true });
    doc.fillColor('#334155').text(desc);
    doc.moveDown(0.15);
  });
  doc.moveDown(0.6);

  // 5. Test Results
  doc.fontSize(12).fillColor('#1E3A8A').text('5. Test Results');
  doc.moveDown(0.3);
  doc.fontSize(9).fillColor('#334155').text('Full monorepo test run: npm run test');
  doc.moveDown(0.3);
  const testResults = [
    ['packages/automata', '21 / 21', 'Mealy-to-Moore, Moore-to-Mealy, simulation, equivalence, mandatory example'],
    ['packages/contracts', '5 / 5',  'Zod schema validation, shared type correctness'],
    ['apps/api',           '12 / 12','REST API integration: CRUD, conversion, simulation, equivalence, error handling'],
    ['apps/web',           '1 / 1',  'React app renders without crash'],
    ['TOTAL',              '39 / 39','0 failures — all workspaces pass'],
  ];
  testResults.forEach(([workspace, result, notes]) => {
    const isTotal = workspace === 'TOTAL';
    doc.fontSize(isTotal ? 9 : 8.5)
       .fillColor(isTotal ? '#059669' : '#334155')
       .text(`${workspace.padEnd(22)}${result.padEnd(10)}${notes}`);
    doc.moveDown(0.2);
  });
  doc.moveDown(0.6);

  // 6. API Integration Tests — Details
  doc.fontSize(12).fillColor('#1E3A8A').text('6. Integration Test Coverage (12 Supertest Tests)');
  doc.moveDown(0.3);
  const apiTests = [
    'Test  1: GET /api/health -> 200, status ok, service automatalab-api',
    'Test  2: POST /api/machines -> 201, UUID assigned, Mealy machine persisted',
    'Test  3: GET /api/machines/:id -> 200, states [A,B], 4 transitions returned',
    'Test  4: PUT /api/machines/:id -> 200, name and description updated and confirmed',
    'Test  5: DELETE /api/machines/:id -> 200; subsequent GET -> 404 (cascade confirmed)',
    'Test  6: POST /api/conversions (Mealy->Moore) -> states [S, A_x, A_y, B_x, B_y], 10 transitions',
    'Test  7: POST /api/convert/moore-to-mealy -> outputs folded: transitions-to-odd outputSymbol = "1"',
    'Test  8: POST /api/simulations, input "1100" -> outputTape "yxyx", finalState "A", 5 steps',
    'Test  9: POST /api/verify-equivalence -> isEquivalent true; mutated machine -> false, counterexample "0"',
    'Test 10: Invalid initialState -> 400 VALIDATION_ERROR; unknown ID -> 404; malformed JSON -> 400 MALFORMED_JSON',
    'Test 11: GET /api/conversions lists history; GET /api/conversions/:id retrieves specific run',
    'Test 12: Relational persistence: 2 states, 4 transitions per machine; cascade delete verified',
  ];
  apiTests.forEach(t => {
    doc.fontSize(8.5).fillColor('#334155').text(`PASS   ${t}`);
    doc.moveDown(0.15);
  });
  doc.moveDown(0.6);

  // 7. Typecheck and Build
  doc.fontSize(12).fillColor('#1E3A8A').text('7. Typecheck and Build');
  doc.moveDown(0.3);
  doc.fontSize(9).fillColor('#059669').text('npm run typecheck -- exit code 0, 0 TypeScript errors across all 4 workspaces');
  doc.moveDown(0.2);
  doc.fontSize(9).fillColor('#059669').text('npm run build -- exit code 0, Vite production build: 1592 modules, 241 KB JS bundle');
  doc.moveDown(0.8);

  // 8. Key Technical Decisions
  doc.fontSize(12).fillColor('#1E3A8A').text('8. Key Technical Decisions');
  doc.moveDown(0.3);
  const decisions = [
    'Lazy DB Singleton with Proxy: The exported db and client objects are JavaScript Proxies that resolve the actual Drizzle/libsql instances at call-time, not at module import time. This allows tests to set DATABASE_URL before the connection is opened.',
    'Test Isolation via pool:forks + globalSetup: Vitest runs the API test file in a forked OS process. globalSetup.ts sets DATABASE_URL to test_integration.db before any module is imported in the fork.',
    'Transactional Persistence: Machine create and update operations wrap states and transitions insertion in a single libsql transaction. If any transition insert fails, all changes are rolled back.',
    'Unsaved Machine Support: Conversion, simulation, and validation endpoints accept inline machine definitions. The sourceMachineId foreign key in conversion_runs is set to NULL for unsaved machines.',
    'Backward-Compatible Aliases: The router exposes both /api/conversions and /api/convert/mealy-to-moore to support both generic and specific usage patterns.',
  ];
  decisions.forEach(d => {
    doc.fontSize(8.5).fillColor('#334155').text(`•  ${d}`);
    doc.moveDown(0.3);
  });
  doc.moveDown(0.6);

  // 9. Known Issues & Next Steps
  doc.fontSize(12).fillColor('#1E3A8A').text('9. Known Issues');
  doc.moveDown(0.3);
  doc.fontSize(9).fillColor('#059669').text('None. All 39 tests pass. Typecheck and build are clean. No regressions from Phase 1.');
  doc.moveDown(0.6);

  doc.fontSize(12).fillColor('#1E3A8A').text('10. Phase 3 Preview (Not Yet Started)');
  doc.moveDown(0.3);
  const phase3 = [
    'Interactive React frontend with @xyflow/react automata canvas',
    'Transition table editor with live Zod validation',
    'Step-by-step Mealy<->Moore conversion visualizer',
    'Animated simulation stepper with state highlighting',
    'Export to PNG and JSON formats',
  ];
  phase3.forEach(item => {
    doc.fontSize(8.5).fillColor('#334155').text(`•  ${item}`);
    doc.moveDown(0.2);
  });

  doc.moveDown(1);
  doc.fontSize(8).fillColor('#94A3B8').text('AutomataLab — University Project | Phase 2 Complete | Generated November 2026', { align: 'center' });

  doc.end();
  return new Promise(resolve => writeStream.on('finish', () => {
    console.log('PDF generated:', pdfPath);
    resolve(pdfPath);
  }));
}

async function generateDocx() {
  const docxPath = path.join(outputDir, 'AutomataLab_Phase_2_Report.docx');

  const sections = [
    new Paragraph({ text: 'AUTOMATALAB', heading: HeadingLevel.TITLE }),
    new Paragraph({ text: 'Phase 2 Technical Report: Backend, Database & REST API Integration', heading: HeadingLevel.HEADING_1 }),
    new Paragraph({ text: 'Date: November 2026  |  Role: Lead Software Engineer', style: 'Normal' }),
    new Paragraph({ text: '' }),

    new Paragraph({ text: '1. Executive Summary', heading: HeadingLevel.HEADING_2 }),
    new Paragraph({ text: 'Phase 2 implemented a 6-table SQLite database with Drizzle ORM, a layered service architecture (controllers, services, repositories), and an 18-endpoint REST API. All 39 monorepo tests pass. TypeScript typecheck and production build are clean.' }),
    new Paragraph({ text: '' }),

    new Paragraph({ text: '2. Database Schema', heading: HeadingLevel.HEADING_2 }),
    new Paragraph({ text: 'Six tables: machines, states, transitions, conversion_runs, test_cases, simulation_runs. UUID primary keys, foreign keys with CASCADE DELETE, unique constraints, Drizzle ORM with @libsql/client.' }),
    new Paragraph({ text: '' }),

    new Paragraph({ text: '3. REST API (18 Endpoints)', heading: HeadingLevel.HEADING_2 }),
    new Paragraph({ text: 'GET/POST/PUT/DELETE /api/machines, POST /api/conversions (+ aliases), POST /api/simulations (+ alias), POST /api/validations, POST /api/verify-equivalence (+ alias), GET /api/health.' }),
    new Paragraph({ text: '' }),

    new Paragraph({ text: '4. Test Results', heading: HeadingLevel.HEADING_2 }),
    new Paragraph({ text: 'automata: 21/21 passed. contracts: 5/5 passed. api: 12/12 passed. web: 1/1 passed. Total: 39/39 — zero failures.' }),
    new Paragraph({ text: '' }),

    new Paragraph({ text: '5. Typecheck & Build', heading: HeadingLevel.HEADING_2 }),
    new Paragraph({ text: 'npm run typecheck: exit 0, 0 TypeScript errors. npm run build: exit 0, Vite bundle 241 KB (1592 modules).' }),
    new Paragraph({ text: '' }),

    new Paragraph({ text: '6. Known Issues', heading: HeadingLevel.HEADING_2 }),
    new Paragraph({ text: 'None. All criteria for Phase 2 are met.' }),
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
  console.log('Phase 2 report generation complete.');
})();

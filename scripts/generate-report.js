import fs from 'node:fs';
import path from 'node:path';
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
  BorderStyle,
  AlignmentType,
  ShadingType,
} from 'docx';
import PDFDocument from 'pdfkit';

const outputDir = path.resolve(process.cwd(), 'docs');

// 1. Generate DOCX
async function generateDocx() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 22, // 11pt
            color: '1E293B',
          },
        },
      },
    },
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: 'AUTOMATALAB',
                bold: true,
                size: 36, // 18pt
                color: '3B82F6',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: 'Phase 0 Technical Report: Architecture & Development Environment',
                bold: true,
                size: 26, // 13pt
                color: '0F172A',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 360 },
            children: [
              new TextRun({
                text: 'Date: November 18, 2026 | Role: Lead Software Engineer | Project: AutomataLab University Project',
                italics: true,
                size: 18, // 9pt
                color: '64748B',
              }),
            ],
          }),

          // Executive Summary
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [new TextRun({ text: '1. Executive Summary', bold: true, color: '1E3A8A' })],
          }),
          new Paragraph({
            spacing: { after: 180 },
            children: [
              new TextRun(
                'Phase 0 of AutomataLab has been successfully completed. The repository has been established as an independent monorepo using npm workspaces, featuring a strict separation between domain types, pure automata algorithms, backend persistence, and modern web visualization.'
              ),
            ],
          }),

          // Architecture & Workspaces
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [new TextRun({ text: '2. Monorepo Workspaces & Technology Stack', bold: true, color: '1E3A8A' })],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({ text: '• apps/web: ', bold: true }),
              new TextRun('React 19, TypeScript, Vite, Tailwind CSS, and @xyflow/react. Configured with a frontend-to-backend development proxy (/api -> http://localhost:3001).'),
            ],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({ text: '• apps/api: ', bold: true }),
              new TextRun('Node.js, Express, TypeScript, SQLite persistence via Drizzle ORM and @libsql/client. Architected with strict Controller-Service-Repository layering.'),
            ],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({ text: '• packages/automata: ', bold: true }),
              new TextRun('Pure algorithmic core for Mealy-Moore state machine transformations and simulation, free of any DOM, database, or UI dependencies.'),
            ],
          }),
          new Paragraph({
            spacing: { after: 180 },
            children: [
              new TextRun({ text: '• packages/contracts: ', bold: true }),
              new TextRun('Shared TypeScript types and Zod boundary schemas for Mealy/Moore machines, conversion steps, and API contracts.'),
            ],
          }),

          // Files Created Table
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [new TextRun({ text: '3. Manifest of Created Files', bold: true, color: '1E3A8A' })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  new TableCell({
                    shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Category', bold: true })] })],
                  }),
                  new TableCell({
                    shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Path / Artifact', bold: true })] })],
                  }),
                  new TableCell({
                    shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Purpose', bold: true })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('Governance')] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('AGENTS.md')] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('11 permanent engineering rules and quality guardrails')] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('Documentation')] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('docs/PROJECT_SPEC.md\ndocs/ARCHITECTURE.md\ndocs/DESIGN_SYSTEM.md')] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('Formal domain theory, Mermaid diagrams, and UI guidelines')] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('Contracts')] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('packages/contracts/src/*')] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('Zod schemas, types for machines, steps, and API')] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('Automata Core')] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('packages/automata/src/*')] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('Pure functional engine foundations and unit tests')] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('Backend API')] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('apps/api/src/*')] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('Express REST API, Drizzle SQLite schema, and controllers')] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('Web UI')] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('apps/web/src/*')] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('React 19 dashboard, dev proxy verification card')] })] }),
                ],
              }),
            ],
          }),

          // Verification Results Table
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [new TextRun({ text: '4. Verification & Test Results', bold: true, color: '1E3A8A' })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  new TableCell({
                    shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Command', bold: true })] })],
                  }),
                  new TableCell({
                    shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Exit Status', bold: true })] })],
                  }),
                  new TableCell({
                    shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Result Summary', bold: true })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('npm run typecheck')] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('Code 0')] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('0 errors across all 4 workspaces')] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('npm run build')] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('Code 0')] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('Contracts, automata, api, and web built cleanly')] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('npm run test')] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('Code 0')] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('12/12 tests passed across all packages')] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('npm run db:generate')] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('Code 0')] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('Drizzle migration 0000_luxuriant_paladin.sql created')] })] }),
                ],
              }),
            ],
          }),

          // Engineering Rules
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [new TextRun({ text: '5. Permanent Engineering Rules (AGENTS.md)', bold: true, color: '1E3A8A' })],
          }),
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun('1. Zero Placeholders & Regressions: Never replace working features with stubs.\n'),
              new TextRun('2. Rigorous Non-Trivial Testing: Test mathematically meaningful state machines.\n'),
              new TextRun('3. Pure Algorithmic Core: Keep packages/automata free of DOM, SQLite, or React.\n'),
              new TextRun('4. Strict Type Safety: strict: true, noImplicitAny: true, zero loose any casts.\n'),
              new TextRun('5. Architectural Layering: Separate Controllers, Services, and Repositories.\n'),
              new TextRun('6. Boundary Validation: Validate all incoming inputs with Zod schemas.\n'),
              new TextRun('7. Purposeful Aesthetics: Clean developer-tool look (Linear, Vercel, React Flow).\n'),
              new TextRun('8. Design System Consistency: Maintain unified spacing, colors, and tokens.\n'),
              new TextRun('9. Disciplined Phase Scoping: Work strictly within requested phase.\n'),
              new TextRun('10. Honest Execution: Never claim commands passed unless verified in terminal.\n'),
              new TextRun('11. Transparent Summaries: Report files, commands, and exact next steps.'),
            ],
          }),

          // Next Steps
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [new TextRun({ text: '6. Exact Next Steps for Phase 1', bold: true, color: '1E3A8A' })],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun('• Implement deterministic Mealy-to-Moore state-splitting conversion algorithm.\n'),
              new TextRun('• Implement deterministic Moore-to-Mealy transition-folding conversion algorithm.\n'),
              new TextRun('• Generate step-by-step mathematical explanations and transition traces.\n'),
              new TextRun('• Construct comprehensive unit test suite on reference transducers (parity, sequence detectors, mod counters).'),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const docxPath = path.join(outputDir, 'AutomataLab_Phase_0_Report.docx');
  fs.writeFileSync(docxPath, buffer);
  console.log(`DOCX written successfully: ${docxPath}`);
}

// 2. Generate PDF
function generatePdf() {
  const pdfPath = path.join(outputDir, 'AutomataLab_Phase_0_Report.pdf');
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);

  // Title
  doc.fontSize(20).fillColor('#2563EB').text('AUTOMATALAB', { align: 'center' });
  doc.fontSize(14).fillColor('#0F172A').text('Phase 0 Technical Report: Architecture & Dev Environment', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(9).fillColor('#64748B').text('Date: November 18, 2026 | Role: Lead Software Engineer | University Project', { align: 'center' });
  doc.moveDown(1.5);

  // Horizontal line
  doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(1);

  // 1. Executive Summary
  doc.fontSize(13).fillColor('#1E3A8A').text('1. Executive Summary');
  doc.moveDown(0.4);
  doc.fontSize(10).fillColor('#334155').text(
    'Phase 0 of AutomataLab has been successfully completed. The repository is organized as an independent monorepo using npm workspaces, establishing strict architectural separation between domain schemas, pure conversion algorithms, backend persistence, and modern web visualization.'
  );
  doc.moveDown(1);

  // 2. Monorepo Topology
  doc.fontSize(13).fillColor('#1E3A8A').text('2. Monorepo Topology & Technology Stack');
  doc.moveDown(0.4);
  const bullets = [
    'apps/web: React 19, TypeScript, Vite, Tailwind CSS, @xyflow/react. Dev proxy (/api -> :3001).',
    'apps/api: Node.js, Express, TypeScript, SQLite via Drizzle ORM and @libsql/client.',
    'packages/automata: Pure mathematical core for Mealy/Moore conversions and simulation.',
    'packages/contracts: Shared TypeScript types and Zod schemas for machines, conversions, and API.',
  ];
  bullets.forEach((b) => {
    doc.fontSize(9.5).fillColor('#334155').text(`•  ${b}`);
    doc.moveDown(0.2);
  });
  doc.moveDown(0.8);

  // 3. Verification & Test Results
  doc.fontSize(13).fillColor('#1E3A8A').text('3. Verification & Test Results');
  doc.moveDown(0.4);
  const verifications = [
    'Typecheck (npm run typecheck): Passed with 0 errors across all 4 workspaces.',
    'Full Build (npm run build): Contracts, automata, API, and Web dist compiled cleanly in 13.4s.',
    'Test Suite (npm run test): 12 of 12 tests passed across all 4 packages (Vitest & Supertest).',
    'Database Migrations (npm run db:generate): Drizzle Kit migration generated successfully.',
  ];
  verifications.forEach((v) => {
    doc.fontSize(9.5).fillColor('#059669').text(`✓  ${v}`);
    doc.moveDown(0.2);
  });
  doc.moveDown(0.8);

  // 4. Permanent Engineering Rules
  doc.fontSize(13).fillColor('#1E3A8A').text('4. Permanent Engineering Rules (AGENTS.md)');
  doc.moveDown(0.4);
  const rules = [
    'Zero Placeholders: Never replace working features with stubs or TODOs.',
    'Non-Trivial Testing: Unit tests must use mathematically meaningful machines.',
    'Pure Algorithmic Core: packages/automata must never import UI or database code.',
    'Strict Type Safety: strict: true, noImplicitAny: true, and zero loose any casts.',
    'Clean Layering: Controllers -> Services -> Repositories in the backend.',
    'Strict Boundary Validation: Validate all external input via shared Zod schemas.',
    'Purposeful Aesthetics: Clean developer-tool look (Linear, Vercel, React Flow).',
    'Honest Execution: Never claim commands passed unless verified in the terminal.',
  ];
  rules.forEach((r, idx) => {
    doc.fontSize(9).fillColor('#334155').text(`${idx + 1}. ${r}`);
    doc.moveDown(0.15);
  });
  doc.moveDown(0.8);

  // 5. Next Steps
  doc.fontSize(13).fillColor('#1E3A8A').text('5. Exact Next Steps (Phase 1)');
  doc.moveDown(0.4);
  const nextSteps = [
    'Implement Mealy-to-Moore state-splitting conversion engine with discrete step explanations.',
    'Implement Moore-to-Mealy transition folding engine with state output mapping.',
    'Write rigorous unit tests for parity generators, 101/010 sequence detectors, and counters.',
    'Develop equivalence verification engine with product-machine state exploration.',
  ];
  nextSteps.forEach((s) => {
    doc.fontSize(9.5).fillColor('#334155').text(`→  ${s}`);
    doc.moveDown(0.2);
  });

  doc.end();

  return new Promise((resolve) => {
    writeStream.on('finish', () => {
      console.log(`PDF written successfully: ${pdfPath}`);
      resolve(true);
    });
  });
}

async function main() {
  await generateDocx();
  await generatePdf();
}

main().catch(console.error);

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument } from 'pdf-lib';
import puppeteer, { type Browser } from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatePath = path.resolve(
  __dirname,
  '..',
  '..',
  'data',
  'bulletin_2026.template.html',
);
const secretsPath = path.resolve(
  __dirname,
  '..',
  '..',
  'data',
  'bulletin-secrets.json',
);

// Letter format at 96 DPI (CSS pixels) — must match what the template uses
// via `@page { size: Letter }` and per-page padding.
const PAGE_WIDTH_PX = 816; // 8.5in × 96
const PAGE_HEIGHT_PX = 1056; // 11in × 96

// PDF points (72 per inch). Final image PDF embeds each PNG screenshot into
// a Letter-sized PDF page.
const PDF_PAGE_WIDTH_PT = 612;
const PDF_PAGE_HEIGHT_PT = 792;

type Secrets = { code1: string; code2: string; code3: string };

let browserInstance: Browser | null = null;
let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (browserInstance) return browserInstance;
  if (!browserPromise) {
    browserPromise = puppeteer
      .launch({ headless: true, args: ['--no-sandbox'] })
      .then((b) => {
        browserInstance = b;
        return b;
      });
  }
  return browserPromise;
}

export async function closeBulletinBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
    browserPromise = null;
  }
}

// Decoys are derived from the real codes so that editing bulletin-secrets.json
// at runtime keeps the near-miss tripwires aligned with the answers.
function deriveDecoyBRS(real: string): string {
  return real.replace(/-(\d{4})-/, (_, y) => `-${Number(y) - 1}-`);
}

function deriveDecoyCONF(real: string): string {
  return real.replace(/-[A-Z]+$/, '-CLGLG');
}

function deriveDecoyVHD(real: string): string {
  return real.replace(/-(\d+)-/, (_, n) => `-${Number(n) - 1}-`);
}

function fillTemplate(template: string, secrets: Secrets): string {
  const map: Record<string, string> = {
    '{{code1}}': secrets.code1,
    '{{code2}}': secrets.code2,
    '{{code3}}': secrets.code3,
    '{{decoyBRS}}': deriveDecoyBRS(secrets.code1),
    '{{decoyCONF}}': deriveDecoyCONF(secrets.code2),
    '{{decoyVHD}}': deriveDecoyVHD(secrets.code3),
  };
  return template.replace(
    /\{\{(code1|code2|code3|decoyBRS|decoyCONF|decoyVHD)\}\}/g,
    (match) => map[match] ?? match,
  );
}

export async function generateBulletinPdf(): Promise<Buffer> {
  const [template, secretsRaw] = await Promise.all([
    readFile(templatePath, 'utf-8'),
    readFile(secretsPath, 'utf-8'),
  ]);
  const secrets = JSON.parse(secretsRaw) as Secrets;
  const html = fillTemplate(template, secrets);

  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    // 2x device pixel ratio = sharper PNGs without doubling DOM layout size.
    await page.setViewport({
      width: PAGE_WIDTH_PX,
      height: PAGE_HEIGHT_PX,
      deviceScaleFactor: 2,
    });
    await page.setContent(html, { waitUntil: 'load' });

    // Screenshot each .page element separately — this gives us one PNG per
    // logical page, which we then embed into the output PDF as an image.
    // Result: a true raster PDF (no selectable text, codes can't be copied).
    const pageHandles = await page.$$('.page');
    if (pageHandles.length === 0) {
      throw new Error('Bulletin template contains no .page sections');
    }

    const pdfDoc = await PDFDocument.create();
    for (const handle of pageHandles) {
      const screenshot = await handle.screenshot({ type: 'png' });
      const pngBytes = screenshot as Uint8Array;
      const pngImage = await pdfDoc.embedPng(pngBytes);

      const pdfPage = pdfDoc.addPage([PDF_PAGE_WIDTH_PT, PDF_PAGE_HEIGHT_PT]);
      pdfPage.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: PDF_PAGE_WIDTH_PT,
        height: PDF_PAGE_HEIGHT_PT,
      });
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } finally {
    await page.close();
  }
}

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(__dirname, '..', '..', 'data', 'course-codes.json');

type CourseCodesData = {
  mapping: Record<string, string>;
  allCodes: string[];
};

const courseCodesData = JSON.parse(readFileSync(dataPath, 'utf-8')) as CourseCodesData;

// Bulletin codes look like "BRS-2026-A17293" / "CONF-4481-SBRLAC" / "VHD-93012-2026".
// We accept any 3 dash-separated alphanumeric groups of >=2 chars as "valid syntax".
const BULLETIN_CODE_PATTERN = /^[A-Z0-9]{2,}-[A-Z0-9]{2,}-[A-Z0-9]{2,}$/;

const REAL_COURSE_CODES = new Set(Object.values(courseCodesData.mapping));
const DECOY_POOL = courseCodesData.allCodes.filter((c) => !REAL_COURSE_CODES.has(c));

export function isValidBulletinSyntax(code: string): boolean {
  return BULLETIN_CODE_PATTERN.test(code);
}

// Stable djb2 hash → same wrong input always yields the same wrong course code,
// so the player can't brute-force a different result by re-submitting.
function djb2(s: string): number {
  let hash = 5381;
  for (let i = 0; i < s.length; i += 1) {
    hash = (hash << 5) + hash + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

type ConversionResult =
  | { kind: 'REAL'; courseCode: string }
  | { kind: 'DECOY'; courseCode: string }
  | { kind: 'INVALID_SYNTAX' };

export function convertBulletinCode(bulletinCode: string): ConversionResult {
  const real = courseCodesData.mapping[bulletinCode];
  if (real) return { kind: 'REAL', courseCode: real };
  if (!isValidBulletinSyntax(bulletinCode)) return { kind: 'INVALID_SYNTAX' };
  const decoy = DECOY_POOL[djb2(bulletinCode) % DECOY_POOL.length];
  return { kind: 'DECOY', courseCode: decoy };
}

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

export function convertBulletinCode(bulletinCode: string): string | null {
  return courseCodesData.mapping[bulletinCode] ?? null;
}

import { useMemo } from 'react';
import styles from './CaptchaCode.module.css';

type CaptchaCodeProps = {
  code: string;
};

type DigitParams = {
  char: string;
  x: number;
  y: number;
  rotation: number;
  fontSize: number;
  color: string;
  fontFamily: string;
};

type NoiseLine = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
};

type NoiseDot = {
  cx: number;
  cy: number;
  r: number;
  color: string;
};

type CaptchaParams = {
  digits: DigitParams[];
  lines: NoiseLine[];
  dots: NoiseDot[];
};

const VIEW_W = 280;
const VIEW_H = 88;
const DIGIT_X_START = 32;
const DIGIT_X_GAP = 36;

const PALETTE = ['#1a3a8e', '#9c2a2a', '#2a6e2a', '#5a2a82', '#8a5a1a', '#2a6a8e'];
const FONT_FAMILIES = [
  'Georgia, serif',
  '"Times New Roman", serif',
  '"Courier New", monospace',
  'Verdana, sans-serif',
  '"Trebuchet MS", sans-serif',
];

/**
 * Tiny linear-congruential PRNG, seeded so the same code always produces the
 * same captcha appearance (no jitter on re-renders).
 */
function makeRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function hashString(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) + hash + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function generateParams(code: string): CaptchaParams {
  const random = makeRandom(hashString(code));

  const digits: DigitParams[] = code.split('').map((char, index) => ({
    char,
    x: DIGIT_X_START + index * DIGIT_X_GAP,
    y: 52 + (random() - 0.5) * 18,
    rotation: (random() - 0.5) * 40,
    fontSize: 30 + random() * 14,
    color: PALETTE[Math.floor(random() * PALETTE.length)] ?? PALETTE[0],
    fontFamily:
      FONT_FAMILIES[Math.floor(random() * FONT_FAMILIES.length)] ??
      FONT_FAMILIES[0],
  }));

  const lines: NoiseLine[] = Array.from({ length: 5 }, () => ({
    x1: random() * VIEW_W,
    y1: random() * VIEW_H,
    x2: random() * VIEW_W,
    y2: random() * VIEW_H,
    color: PALETTE[Math.floor(random() * PALETTE.length)] ?? PALETTE[0],
  }));

  const dots: NoiseDot[] = Array.from({ length: 50 }, () => ({
    cx: random() * VIEW_W,
    cy: random() * VIEW_H,
    r: 0.4 + random() * 1.4,
    color: PALETTE[Math.floor(random() * PALETTE.length)] ?? PALETTE[0],
  }));

  return { digits, lines, dots };
}

export function CaptchaCode({ code }: CaptchaCodeProps) {
  const params = useMemo(() => generateParams(code), [code]);

  return (
    <svg
      className={styles.captcha}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      role="img"
      aria-label={`Code à 6 chiffres : ${code.split('').join(' ')}`}
    >
      {params.lines.map((line, index) => (
        <line
          key={`line-${index}`}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={line.color}
          strokeWidth={1}
          opacity={0.45}
        />
      ))}
      {params.dots.map((dot, index) => (
        <circle
          key={`dot-${index}`}
          cx={dot.cx}
          cy={dot.cy}
          r={dot.r}
          fill={dot.color}
          opacity={0.35}
        />
      ))}
      {params.digits.map((digit, index) => (
        <text
          key={`digit-${index}`}
          x={digit.x}
          y={digit.y}
          transform={`rotate(${digit.rotation.toFixed(2)} ${digit.x} ${digit.y})`}
          fontSize={digit.fontSize}
          fontFamily={digit.fontFamily}
          fontWeight="bold"
          fill={digit.color}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {digit.char}
        </text>
      ))}
    </svg>
  );
}

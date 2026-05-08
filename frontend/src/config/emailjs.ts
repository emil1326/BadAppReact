/**
 * EmailJS configuration. Filled in during Phase 6 (real email cascade).
 *
 * Setup steps:
 *   1. Create an account at emailjs.com
 *   2. Configure an email service (Gmail recommended)
 *   3. Create the templates listed below
 *   4. Replace the placeholder values here with the real ones
 *
 * The public key is safe to commit — it's designed to be exposed to the
 * browser. Rate limiting and abuse prevention happen on EmailJS's side.
 */

export const EMAILJS_PUBLIC_KEY = '';
export const EMAILJS_SERVICE_ID = '';

export const EMAILJS_TEMPLATES = {
  twoFactorCode: '',
  codeA: '',
} as const;

export type EmailTemplateKey = keyof typeof EMAILJS_TEMPLATES;

import emailjs from '@emailjs/nodejs';

const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY ?? '';
const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY ?? '';
const SERVICE_ID = process.env.EMAILJS_SERVICE_ID ?? '';

const isConfigured = Boolean(PUBLIC_KEY && PRIVATE_KEY && SERVICE_ID);

if (!isConfigured) {
  console.warn(
    '[email] EmailJS env vars missing — sendEmail() will throw. Check backend/.env.',
  );
}

export type SendEmailParams = {
  templateId: string;
  to: string;
  vars?: Record<string, string>;
};

/**
 * Sends a real email through EmailJS. Templates are configured in the EmailJS
 * dashboard; only the templateId, recipient, and variables are passed from
 * here. The private key never leaves the backend.
 */
export async function sendEmail(params: SendEmailParams): Promise<void> {
  if (!isConfigured) {
    throw new Error('EmailJS not configured (check backend/.env)');
  }
  await emailjs.send(
    SERVICE_ID,
    params.templateId,
    {
      to: params.to,
      ...params.vars,
    },
    { publicKey: PUBLIC_KEY, privateKey: PRIVATE_KEY },
  );
}

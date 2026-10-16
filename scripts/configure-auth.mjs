#!/usr/bin/env node
// Idempotently configures Supabase Auth for Mindtier via the Management API.
// Requires SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_URL in the environment.
const token = process.env.SUPABASE_ACCESS_TOKEN;
const url = process.env.SUPABASE_PROJECT_URL;
const site = process.env.WEB_URL ?? 'https://midas-engine.vercel.app';
if (!token || !url) {
  console.error('SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_URL are required');
  process.exit(1);
}
const ref = new URL(url).hostname.split('.')[0];

const codeEmail = (heading, line) => `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#0E1230">
  <h2 style="margin:0 0 12px">${heading}</h2>
  <p style="margin:0 0 16px">${line}</p>
  <p style="font-size:32px;letter-spacing:6px;font-weight:700;margin:0 0 16px">{{ .Token }}</p>
  <p style="color:#5F678A;font-size:13px;margin:0">The code expires in 15 minutes. If you didn’t ask for it, you can ignore this email.</p>
</div>`;

const config = {
  site_url: site,
  uri_allow_list: ['mindtier://**', `${site}/**`].join(','),
  external_anonymous_users_enabled: true,
  external_email_enabled: true,
  mailer_otp_exp: 900,
  mailer_otp_length: 6,
  mailer_secure_email_change_enabled: false,
};

// Supabase only allows template edits once a custom SMTP provider is configured.
const templates = {
  mailer_subjects_magic_link: 'Your Mindtier sign-in code',
  mailer_templates_magic_link_content: codeEmail('Your sign-in code', 'Enter this code in Mindtier to sign in:'),
  mailer_subjects_confirmation: 'Confirm your Mindtier email',
  mailer_templates_confirmation_content: codeEmail('Confirm your email', 'Enter this code in Mindtier to save your progress to this email:'),
  mailer_subjects_email_change: 'Confirm your Mindtier email',
  mailer_templates_email_change_content: codeEmail('Confirm your email', 'Enter this code in Mindtier to save your progress to this email:'),
};

const endpoint = `https://api.supabase.com/v1/projects/${ref}/config/auth`;
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

async function patch(body) {
  const res = await fetch(endpoint, { method: 'PATCH', headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

let after = await patch(config);
if (after.smtp_host) {
  after = await patch(templates);
  console.log('✓ email templates updated');
} else {
  console.log('• email templates skipped: configure custom SMTP first (see docs/HANDOFF.md)');
}
console.log('✓ auth configured', {
  site_url: after.site_url,
  anonymous: after.external_anonymous_users_enabled,
  otp_length: after.mailer_otp_length,
  otp_exp: after.mailer_otp_exp,
  custom_smtp: Boolean(after.smtp_host),
});

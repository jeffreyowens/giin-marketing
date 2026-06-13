// Cloudflare Pages Function: POST /api/demo
// Receives a demo request from the marketing site and emails it through Resend.
// No npm dependencies: this talks to the Resend REST API with fetch.

const REQUIRED_FIELDS = [
  'fullName',
  'email',
  'timezone',
  'title',
  'venueName',
  'venueType',
  'country',
  'city',
];

const FIELD_LABELS = {
  fullName: 'Full name',
  email: 'Email address',
  timezone: 'Timezone',
  title: 'Title',
  venueName: 'Venue name',
  venueType: 'Type of venue',
  country: 'Country of venue',
  city: 'City of venue',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function onRequest(context) {
  const { request, env } = context;

  // POST only. Anything else is rejected.
  if (request.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed.' }, 405);
  }

  let payload;
  try {
    payload = await request.json();
  } catch (err) {
    return json({ ok: false, error: 'Invalid request body.' }, 400);
  }

  // Honeypot. Real visitors never see or fill this field, so a non-empty
  // value means a bot. Accept silently without sending anything.
  if (payload && typeof payload.company_website === 'string' && payload.company_website.trim() !== '') {
    return json({ ok: true }, 200);
  }

  // Server-side validation. Never rely on the client. Every field must be
  // present and non-empty, and the email must look valid.
  const clean = {};
  for (const field of REQUIRED_FIELDS) {
    const value = payload && typeof payload[field] === 'string' ? payload[field].trim() : '';
    if (!value) {
      return json({ ok: false, error: 'Please fill in every field.' }, 400);
    }
    clean[field] = value;
  }
  if (!EMAIL_RE.test(clean.email)) {
    return json({ ok: false, error: 'Please enter a valid email address.' }, 400);
  }

  // The API key only ever comes from the environment. It is never hardcoded.
  if (!env || !env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set. Cannot send the demo request email.');
    return json({ ok: false, error: 'Email service is not configured.' }, 500);
  }

  const textLines = REQUIRED_FIELDS.map(function (field) {
    return FIELD_LABELS[field] + ': ' + clean[field];
  });
  const text = 'New demo request\n\n' + textLines.join('\n') + '\n';

  const htmlRows = REQUIRED_FIELDS.map(function (field) {
    return '<tr>' +
      '<td style="padding:6px 16px 6px 0;color:#555;font-weight:600;vertical-align:top;">' + escapeHtml(FIELD_LABELS[field]) + '</td>' +
      '<td style="padding:6px 0;color:#111;">' + escapeHtml(clean[field]) + '</td>' +
      '</tr>';
  }).join('');
  const html = '<div style="font-family:Arial,Helvetica,sans-serif;">' +
    '<h2 style="margin:0 0 16px;">New demo request</h2>' +
    '<table style="font-size:14px;border-collapse:collapse;">' + htmlRows + '</table>' +
    '</div>';

  const subject = 'New demo request: ' + clean.venueName + ' (' + clean.city + ', ' + clean.country + ')';

  let resendResponse;
  try {
    resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.RESEND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Giin Demo Requests <demo@giin.ai>',
        to: 'hello@giin.ai',
        reply_to: clean.email,
        subject: subject,
        text: text,
        html: html,
      }),
    });
  } catch (err) {
    console.error('Failed to reach Resend:', err);
    return json({ ok: false, error: 'Could not send your request. Please try again.' }, 500);
  }

  if (!resendResponse.ok) {
    const detail = await resendResponse.text().catch(function () { return ''; });
    console.error('Resend returned an error:', resendResponse.status, detail);
    return json({ ok: false, error: 'Could not send your request. Please try again.' }, 500);
  }

  return json({ ok: true }, 200);
}

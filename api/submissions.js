import {
  createSubmission,
  isSameOrigin,
  json,
  normaliseApplication,
  parseBody,
  requestFingerprint,
  serverConfig
} from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, {error: 'Metoda nu este permisa.'});
  }

  if (!isSameOrigin(req)) {
    return json(res, 403, {error: 'Originea cererii nu este permisa.'});
  }

  if (!serverConfig().storageConfigured) {
    return json(res, 503, {error: 'Serviciul de formulare nu este configurat.'});
  }

  const body = parseBody(req);
  if (JSON.stringify(body).length > 50_000) {
    return json(res, 413, {error: 'Formularul este prea mare.'});
  }

  const application = normaliseApplication(body);
  if (application.honeypot) {
    return json(res, 202, {id: 'GT-PRIMIT'});
  }
  if (application.error) {
    return json(res, 400, {error: application.error});
  }

  try {
    const saved = await createSubmission(application, requestFingerprint(req));
    return json(res, 201, {id: saved.reference || saved.id});
  } catch (error) {
    if (error?.code === 'RATE_LIMIT_EXCEEDED') {
      return json(res, 429, {error: 'Ai trimis prea multe cereri. Incearca din nou mai tarziu.'});
    }
    console.error('Submission storage failed', {code: error?.code});
    return json(res, 500, {error: 'Cererea nu a putut fi salvata. Incearca din nou.'});
  }
}

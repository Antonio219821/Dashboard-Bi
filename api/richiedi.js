// Riceve l'email: se è già qualificata entra, altrimenti manda il link di attivazione.
const crypto = require('crypto');
const { trova, salva, cookieSessione } = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  const email = String((req.body && req.body.email) || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ ok: false });

  const riga = await trova('email', email);

  // Già qualificata: entra subito (metti LINK_SEMPRE=si su Vercel per mandare il link anche a lei)
  if (riga && riga.qualificata && process.env.LINK_SEMPRE !== 'si') {
    res.setHeader('Set-Cookie', cookieSessione(email));
    return res.json({ ok: true, entrato: true });
  }

  // Altrimenti: crea un token, salvalo su Supabase e manda la mail
  const token = crypto.randomBytes(24).toString('hex');
  await salva({
    email,
    qualificata: riga ? riga.qualificata : false,
    token,
    token_scade: new Date(Date.now() + 15 * 60 * 1000).toISOString()
  });
  const link = `https://${req.headers.host}/api/verifica?token=${token}`;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.MAIL_FROM,
      to: email,
      subject: 'Attiva il tuo accesso',
      html: `<p>Clicca per attivare l'accesso (il link vale 15 minuti):</p><p><a href="${link}">Attiva e entra</a></p>`
    })
  });
  if (!r.ok) return res.status(500).json({ ok: false });
  res.json({ ok: true, entrato: false });
};

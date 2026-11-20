// Mostra le pagine riservate solo se Supabase dice che l'email è qualificata.
const fs = require('fs');
const path = require('path');
const { leggi } = require('./_auth');
const { trova } = require('./_db');

module.exports = async (req, res) => {
  const cookie = (req.headers.cookie || '').split('; ').find(c => c.startsWith('sessione='));
  const d = leggi(cookie && cookie.slice(9));
  const riga = d && d.tipo === 'sessione' ? await trova('email', d.email) : null;
  if (!riga || !riga.qualificata) return res.redirect(302, '/#accesso');

  const slug = String(req.query.slug || 'indice');
  if (!/^[a-z0-9-]+$/.test(slug)) return res.status(404).send('Non trovato');
  const file = path.join(process.cwd(), 'private', slug + '.html');
  if (!fs.existsSync(file)) return res.status(404).send('Non trovato');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'private, no-store');
  res.send(fs.readFileSync(file, 'utf8'));
};

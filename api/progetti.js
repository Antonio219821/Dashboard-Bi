
// Mostra le pagine riservate solo se l'email è autorizzata.
const fs = require('fs');
const path = require('path');
const { leggi } = require('./auth');
const { trova } = require('./db');

module.exports = async (req, res) => {
  // Evita che le pagine riservate vengano salvate nella cache.
  res.setHeader('Cache-Control', 'private, no-store');

  try {
    // Recupera il cookie di sessione.
    const cookie = (req.headers.cookie || '')
      .split(';')
      .map(c => c.trim())
      .find(c => c.startsWith('sessione='));

    const token = cookie ? cookie.slice('sessione='.length) : null;
    const dati = leggi(token);

    // Controlla che la sessione sia valida.
    if (!dati || dati.tipo !== 'sessione' || !dati.email) {
      return res.redirect(302, '/#accesso');
    }

    // Verifica che l'email sia ancora autorizzata su Supabase.
    const riga = await trova('email', dati.email);

    if (!riga || riga.qualificata !== true) {
      return res.redirect(302, '/#accesso');
    }

    // Recupera il progetto richiesto.
    const slug = String(req.query.slug || 'indice');

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return res.status(404).send('Non trovato');
    }

    const file = path.join(
      process.cwd(),
      'private',
      slug + '.html'
    );

    if (!fs.existsSync(file)) {
      return res.status(404).send('Non trovato');
    }

    // Mostra la pagina riservata.
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    return res.status(200).send(
      fs.readFileSync(file, 'utf8')
    );

  } catch (errore) {
    console.error('Errore accesso progetti:', errore);

    return res.status(500).send(
      'Si è verificato un errore durante il caricamento. Riprova.'
    );
  }
};

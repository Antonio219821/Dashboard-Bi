
const { trova, cookieSessione } = require('./db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, errore: 'Metodo non consentito' });
  }

  try {
    const email = String((req.body && req.body.email) || '')
      .trim()
      .toLowerCase();

    // Controllo del formato email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        ok: false,
        errore: 'Inserisci un indirizzo email valido.'
      });
    }

    // Verifica che l'email sia autorizzata
    const riga = await trova('email', email);

    if (!riga || riga.qualificata !== true) {
      return res.status(401).json({
        ok: false,
        errore: 'Email non registrata o non autorizzata.'
      });
    }

    // Crea la sessione
    res.setHeader('Set-Cookie', cookieSessione(email));

    return res.status(200).json({
      ok: true,
      entrato: true
    });

  } catch (errore) {
    console.error('Errore login:', errore);

    return res.status(500).json({
      ok: false,
      errore: 'Errore durante il login. Riprova.'
    });
  }
};

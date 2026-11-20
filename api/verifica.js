// Si apre dal link nella mail: qualifica l'email su Supabase e ti fa entrare.
const { trova, salva, cookieSessione } = require('./_db');

module.exports = async (req, res) => {
  const riga = req.query.token ? await trova('token', req.query.token) : null;
  if (!riga || !riga.token_scade || new Date(riga.token_scade) < new Date()) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(401).send('<p>Link scaduto o non valido. <a href="/#accesso">Richiedine uno nuovo</a>.</p>');
  }
  await salva({ email: riga.email, qualificata: true, token: null, token_scade: null });
  res.setHeader('Set-Cookie', cookieSessione(riga.email));
  res.redirect(302, '/progetti');
};

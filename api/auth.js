// Crea e controlla "gettoni" firmati. Nessun database necessario.
const crypto = require('crypto');
const firma = (b) => crypto.createHmac('sha256', process.env.AUTH_SECRET).update(b).digest('base64url');

function crea(dati) {
  const b = Buffer.from(JSON.stringify(dati)).toString('base64url');
  return b + '.' + firma(b);
}
function leggi(token) {
  if (!token || !token.includes('.')) return null;
  const [b, s] = token.split('.');
  const atteso = firma(b);
  if (s.length !== atteso.length || !crypto.timingSafeEqual(Buffer.from(s), Buffer.from(atteso))) return null;
  try {
    const d = JSON.parse(Buffer.from(b, 'base64url').toString());
    return d.scade > Date.now() ? d : null;
  } catch { return null; }
}
module.exports = { crea, leggi };

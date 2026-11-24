
// Collegamento a Supabase tramite API REST.
const { crea } = require('./auth');

const base = () => process.env.SUPABASE_URL + '/rest/v1/accessi';

const h = () => ({
  apikey: process.env.SUPABASE_SERVICE_KEY,
  Authorization: 'Bearer ' + process.env.SUPABASE_SERVICE_KEY,
  'Content-Type': 'application/json'
});

async function controllaRisposta(r) {
  if (!r.ok) {
    const errore = await r.text();
    throw new Error(`Errore Supabase (${r.status}): ${errore}`);
  }
}

async function trova(campo, valore) {
  const r = await fetch(
    `${base()}?${campo}=eq.${encodeURIComponent(valore)}&select=*`,
    { headers: h() }
  );

  await controllaRisposta(r);

  const righe = await r.json();
  return Array.isArray(righe) && righe[0] ? righe[0] : null;
}

async function salva(riga) {
  const r = await fetch(`${base()}?on_conflict=email`, {
    method: 'POST',
    headers: {
      ...h(),
      Prefer: 'resolution=merge-duplicates'
    },
    body: JSON.stringify(riga)
  });

  await controllaRisposta(r);
}

function cookieSessione(email) {
  const t = crea({
    tipo: 'sessione',
    email,
    scade: Date.now() + 365 * 24 * 3600 * 1000
  });

  return `sessione=${t}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=31536000`;
}

module.exports = { trova, salva, cookieSessione };

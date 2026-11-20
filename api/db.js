// Parla con Supabase (tabella "accessi") usando l'API REST. Nessun pacchetto da installare.
const { crea } = require('./_auth');
const base = () => process.env.SUPABASE_URL + '/rest/v1/accessi';
const h = () => ({
  apikey: process.env.SUPABASE_SERVICE_KEY,
  Authorization: 'Bearer ' + process.env.SUPABASE_SERVICE_KEY,
  'Content-Type': 'application/json'
});

async function trova(campo, valore) {
  const r = await fetch(`${base()}?${campo}=eq.${encodeURIComponent(valore)}&select=*`, { headers: h() });
  const righe = await r.json();
  return Array.isArray(righe) && righe[0] ? righe[0] : null;
}
async function salva(riga) {
  await fetch(`${base()}?on_conflict=email`, {
    method: 'POST',
    headers: { ...h(), Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify(riga)
  });
}
// Il cookie dice solo "chi sei". Se puoi entrare lo decide sempre Supabase.
function cookieSessione(email) {
  const t = crea({ tipo: 'sessione', email, scade: Date.now() + 365 * 24 * 3600 * 1000 });
  return `sessione=${t}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=31536000`;
}
module.exports = { trova, salva, cookieSessione };

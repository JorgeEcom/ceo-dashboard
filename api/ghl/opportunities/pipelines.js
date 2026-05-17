export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Version');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });

  const { locationId } = req.query;
  if (!locationId) return res.status(400).json({ error: 'Missing locationId' });

  try {
    const url = new URL('https://services.leadconnectorhq.com/opportunities/pipelines');
    url.searchParams.set('locationId', locationId);
    const response = await fetch(url.toString(), {
      headers: { 'Authorization': authHeader, 'Version': '2021-07-28', 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

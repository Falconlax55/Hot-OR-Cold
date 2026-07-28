// Vercel serverless function: POST /api/weather
// Body: { metric: "hottest"|"coldest"|"humid"|"dry", cities: [{name, region, lat, lon}, ...] }
//
// Calls Open-Meteo (a free, no-key weather API) directly from the server
// for every city in the list, then picks the winner for the requested
// metric. This runs server-side, so it isn't subject to the browser CORS/
// CSP restrictions that block this kind of call from client-side code.
// No API key, no cost, no rate limit issues for normal traffic.

const VALID_METRICS = new Set(['hottest', 'coldest', 'humid', 'dry']);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { metric, cities } = req.body || {};

  if (!metric || !VALID_METRICS.has(metric) || !Array.isArray(cities) || cities.length === 0) {
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }

  const withCoords = cities.filter(c => typeof c.lat === 'number' && typeof c.lon === 'number');
  if (withCoords.length === 0) {
    res.status(400).json({ error: 'No cities with coordinates were provided' });
    return;
  }

  try {
    const lats = withCoords.map(c => c.lat).join(',');
    const lons = withCoords.map(c => c.lon).join(',');
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,relative_humidity_2m&temperature_unit=fahrenheit&timezone=GMT`;

    const weatherRes = await fetch(url);
    if (!weatherRes.ok) {
      const errText = await weatherRes.text();
      res.status(502).json({ error: `Weather API error: ${weatherRes.status} ${errText}` });
      return;
    }

    const data = await weatherRes.json();
    const list = Array.isArray(data) ? data : [data];

    const combined = withCoords
      .map((c, i) => ({
        name: c.name,
        region: c.region,
        tempF: list[i]?.current?.temperature_2m,
        humidity: list[i]?.current?.relative_humidity_2m
      }))
      .filter(c => typeof c.tempF === 'number' && typeof c.humidity === 'number');

    if (combined.length === 0) {
      res.status(502).json({ error: 'Weather API returned no usable data' });
      return;
    }

    let winner;
    if (metric === 'hottest') winner = combined.reduce((a, b) => (b.tempF > a.tempF ? b : a));
    if (metric === 'coldest') winner = combined.reduce((a, b) => (b.tempF < a.tempF ? b : a));
    if (metric === 'humid')   winner = combined.reduce((a, b) => (b.humidity > a.humidity ? b : a));
    if (metric === 'dry')     winner = combined.reduce((a, b) => (b.humidity < a.humidity ? b : a));

    res.status(200).json(winner);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unknown server error' });
  }
}

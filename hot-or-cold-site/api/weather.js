// Vercel serverless function: POST /api/weather
// Body: { metric: "hottest"|"coldest"|"humid"|"dry", cities: [{name, region}, ...] }
// Holds the Anthropic API key server-side and asks Claude to find the
// current weather extreme among the given cities using live web search.

const METRIC_ASK = {
  hottest: 'the highest current outdoor air temperature',
  coldest: 'the lowest current outdoor air temperature',
  humid: 'the highest current relative humidity',
  dry: 'the lowest current relative humidity'
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { metric, cities } = req.body || {};

  if (!metric || !METRIC_ASK[metric] || !Array.isArray(cities) || cities.length === 0) {
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server is missing ANTHROPIC_API_KEY' });
    return;
  }

  const cityList = cities.map(c => `${c.name}, ${c.region}`).join('; ');
  const prompt = `Using web search, check current weather conditions right now for exactly these places: ${cityList}.
Find the ONE place with ${METRIC_ASK[metric]} among them.
Reply with ONLY a single-line JSON object and nothing else — no markdown, no explanation — in exactly this shape:
{"name":"<place name exactly as given>","region":"<region exactly as given>","tempF":<current temperature in Fahrenheit as a number>,"humidity":<current relative humidity percent as a number>}`;

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
        tools: [{ type: 'web_search_20250305', name: 'web_search' }]
      })
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      res.status(502).json({ error: `Anthropic API error: ${anthropicRes.status} ${errText}` });
      return;
    }

    const data = await anthropicRes.json();
    const textBlocks = (data.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n');

    const match = textBlocks.match(/\{[\s\S]*\}/);
    if (!match) {
      res.status(502).json({ error: 'No JSON found in model response' });
      return;
    }

    const winner = JSON.parse(match[0]);
    res.status(200).json(winner);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unknown server error' });
  }
}

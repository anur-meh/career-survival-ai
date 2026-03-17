export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { profile, name, spec, stream, industry } = req.body;
  if (!profile) return res.status(400).json({ error: 'No profile provided' });

  const prompt = `You are an expert career analyst. Based ONLY on this person's factual profile, compute their Career Relevance Score and generate a personalised report. YOU derive all insights — the user should not have to guess anything.

PROFILE:
${profile}

Return ONLY valid JSON starting with { and ending with }. No markdown, no preamble.

{
  "overallScore": <integer 0-100>,
  "tier": "<Critical|Vulnerable|Adapting|Future-ready>",
  "summary": "<2-3 sentences addressing ${name || 'the user'} directly — specific to their specialisation, tools, and situation. Not generic.>",
  "automationRisk": "<Low|Medium|High|Very High>",
  "automationRiskReason": "<1 sentence — cite specific tasks in their specialisation that AI is already automating>",
  "dimensions": [
    {"name":"AI Fluency","score":<0-100>,"insight":"<specific 1-liner based on their tools and usage>"},
    {"name":"Skill Readiness","score":<0-100>,"insight":"<specific to their specialisation>"},
    {"name":"Practical Experience","score":<0-100>,"insight":"<based on internship and tools>"},
    {"name":"Automation Exposure","score":<0-100>,"insight":"<based on their specific role and tasks>"},
    {"name":"Adaptability","score":<0-100>,"insight":"<based on their adaptability and learning answers>"},
    {"name":"Career Positioning","score":<0-100>,"insight":"<based on presence, goals, industry target>"},
    {"name":"Human Skills","score":<0-100>,"insight":"<communication and relationship skills>"},
    {"name":"Future Orientation","score":<0-100>,"insight":"<awareness and proactiveness about the future>"}
  ],
  "roadmap": [
    {"week":"This week","title":"<one specific action>","description":"<concrete, realistic — fits their hours and tools>","locked":false},
    {"week":"Week 2–3","title":"<one specific action>","description":"<builds on week 1>","locked":false},
    {"week":"Month 2","title":"<one specific action>","description":"<medium term milestone>","locked":true},
    {"week":"Month 3","title":"<one specific action>","description":"<visible outcome — something to show>","locked":true}
  ],
  "topSkills": ["<skill 1 specific to their spec>","<skill 2>","<skill 3>","<skill 4>"],
  "avoidRisk": "<1 specific risk given their exact profile>",
  "salaryImpact": "<1 sentence on earning potential in 2-3 years if they act on this roadmap vs if they do not>"
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1600,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error });

    const text = data.content.map(b => b.text || '').join('').trim();
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) return res.status(500).json({ error: 'No JSON in response', raw: text.slice(0, 300) });

    const result = JSON.parse(text.slice(start, end + 1));
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

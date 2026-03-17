import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

const BIZTOOLS_MAP = {
  'Finance & Accounting': ['Excel (advanced — pivot tables, VLOOKUP)', 'Tally / QuickBooks / accounting software', 'Power BI / Tableau', 'Bloomberg / financial data platforms', 'Python or R (any level)', 'Basic Excel only', 'None of these'],
  'Marketing & Brand': ['Google Analytics / Search Console', 'Meta / Instagram Ads Manager', 'Canva / Adobe tools', 'Mailchimp / any email tool', 'HubSpot / any CRM', 'SEO tools (SEMrush, Ahrefs)', 'Content / social scheduling tools', 'None of these'],
  'Human Resources': ['Any HRMS platform (Darwinbox, Zoho People)', 'LinkedIn Recruiter / job portals', 'Excel / Sheets for HR data', 'Survey tools (Google Forms, etc.)', 'Any ATS (Applicant Tracking System)', 'None of these'],
  'Operations & Supply Chain': ['Excel / Google Sheets (advanced)', 'Any ERP system (basic exposure)', 'Inventory / logistics software', 'Process mapping tools (Visio, Lucidchart)', 'Power BI / reporting tools', 'None of these'],
  'Sales & Business Development': ['Any CRM (Salesforce, HubSpot, Zoho)', 'LinkedIn Sales Navigator', 'Excel / Sheets for tracking', 'Email outreach tools (Apollo, Lemlist)', 'None of these'],
  'Business Analytics / Data': ['Excel (advanced)', 'SQL', 'Python or R', 'Power BI / Tableau / Looker', 'Google Analytics', 'Any ML or statistical tool', 'None of these'],
  'Entrepreneurship / Startups': ['No-code tools (Webflow, Notion, Bubble)', 'Social media / content platforms', 'Payment tools (Razorpay, Shopify)', 'Basic financial tracking (Excel, QuickBooks)', 'Any CRM or customer tool', 'None of these'],
};
const GENERAL_TOOLS = ['Excel / Google Sheets (any level)', 'Canva / presentation tools', 'Google Analytics / web analytics', 'Any CRM (HubSpot, Zoho, Salesforce)', 'Social media management tools', 'Tally / QuickBooks / accounting software', 'Power BI / Tableau / dashboards', 'Project tools (Notion, Trello, Asana)', 'None of these yet'];

const QUESTIONS = [
  { id: 'name', block: 'Who you are', text: 'What is your first name?', note: 'We use this to personalise your report throughout.', type: 'text', placeholder: 'e.g. Priya' },
  { id: 'age', block: 'Who you are', text: 'How old are you?', note: 'Age helps us frame what is realistically achievable for you.', type: 'text', placeholder: 'e.g. 21' },
  { id: 'country', block: 'Who you are', text: 'Which country are you based in?', type: 'chips', opts: ['India', 'UAE / Gulf', 'USA', 'UK', 'Singapore / SEA', 'Canada / Australia', 'Other'] },
  { id: 'city', block: 'Who you are', text: 'Which city or region?', note: 'Optional — helps refine advice for your local job market.', type: 'text', placeholder: 'e.g. Bengaluru, Pune, Hyderabad', optional: true },
  { id: 'stage', block: 'Where you are now', text: 'Which of these best describes you right now?', note: 'Everything about your roadmap branches from this answer.', type: 'chips', opts: ['I am a student', 'I just graduated / fresher', 'I am working (1–7 yrs)', 'I manage a team', 'I am a senior leader / CXO', 'I am between jobs / reskilling'] },
  { id: 'qual', block: 'Your education', text: 'What is your highest qualification — or what are you currently studying?', type: 'chips', opts: ['Diploma', 'Undergraduate (BBA/BBM/BMS/BCom)', 'Postgraduate', 'MBA / PGDM', 'PhD', 'Professional certification'] },
  { id: 'stream', block: 'Your education', text: 'Which stream or specialisation?', note: 'Select the one that best describes your field.', type: 'chips', opts: ['Computer Science / IT / Software', 'Data Science / AI / ML', 'Electronics / ECE / EEE', 'Mechanical / Civil / Chemical Engg', 'Biotech / Pharma / Life Sciences', 'Architecture', 'MBA — Finance / Marketing / HR / Ops / Strategy', 'BBA / BBM / BMS', 'BCom / MCom', 'CA / CFA / Actuarial / Finance', 'Law (LLB / LLM)', 'Medicine / Healthcare', 'Design / Animation / Fine Arts', 'Humanities / Social Sciences / Journalism'] },
  { id: 'year', block: 'Your education', text: 'What year are you in — or when did you graduate?', type: 'chips', opts: ['1st year', '2nd year', '3rd year', 'Final year', 'Just graduated (2024–25)', 'Graduated 1–3 years ago', 'Graduated 3+ years ago'] },
  { id: 'aitools', block: 'Your relationship with AI today', text: 'Which AI tools have you personally used? Select all that apply.', note: 'This single answer is one of the strongest signals in the assessment.', type: 'multi', key: 'tools', opts: ['ChatGPT', 'Claude', 'Gemini', 'Copilot (MS/GitHub)', 'Midjourney / DALL-E', 'Perplexity', 'Cursor / Windsurf', 'Notion AI', 'None yet'] },
  { id: 'aiuse', block: 'Your relationship with AI today', text: 'How would you describe how you use AI in your day-to-day life?', note: 'Measuring depth, not just awareness.', type: 'chips', opts: ['I have never used it', 'Tried it out of curiosity', 'I use it occasionally for tasks', 'It is a regular part of how I work or study', 'I build things using AI tools or APIs'] },
  { id: 'ailearn', block: 'Your relationship with AI today', text: 'Have you done any structured learning specifically about AI?', type: 'chips', opts: ['Nothing yet', 'Watched videos / read articles', 'Completed at least one course', 'Multiple courses or certifications', 'Formal academic training in AI / ML'] },
  { id: 'goal', block: 'Your goals and outlook', text: 'What is your primary goal in the next 2 years?', type: 'chips', opts: ['Get well placed / land my first good job', 'Switch to a better or higher-paying role', 'Move into a tech or AI-adjacent role', 'Rise to a leadership position', 'Build something of my own', 'Stay relevant and secure where I am', 'Go abroad for work or higher studies'] },
  { id: 'hours', block: 'Your goals and outlook', text: 'How many hours a week can you realistically commit to shaping your future?', note: 'An honest answer gives you a roadmap you can actually follow.', type: 'chips', opts: ['Less than 2 hours', '2–5 hours', '5–10 hours', 'More than 10 hours'] },
  { id: 'worry', block: 'Your goals and outlook', text: 'What worries you most about your professional future?', type: 'chips', opts: ['Not knowing what direction to go in', 'Falling behind people I am competing with', 'My skills becoming less valuable over time', 'AI and automation making my work redundant', 'Not being able to find or keep good work', 'Losing relevance as my field changes', 'Honestly, I feel fairly secure right now'] },
  { id: 'spec', block: 'Your specialisation', text: 'What is your primary specialisation or area of focus?', note: 'The most important stream-specific question — your roadmap depends on it.', type: 'chips', opts: ['Finance & Accounting', 'Marketing & Brand', 'Sales & Business Development', 'Human Resources', 'Operations & Supply Chain', 'Entrepreneurship / Startups', 'Business Analytics / Data', 'International Business', 'General / Not decided yet'] },
  { id: 'industry', block: 'Your specialisation', text: 'Which industry are you most interested in working in?', type: 'chips', opts: ['Banking & Financial Services', 'Consulting', 'FMCG / Consumer Goods', 'E-commerce / Startups', 'IT / Technology companies', 'Manufacturing / Industrial', 'Healthcare / Pharma', 'Media / Advertising', 'Entertainment / OTT / Gaming', 'Government / PSU', 'Not sure yet'] },
  { id: 'skilllevel', block: 'Your practical skills', text: 'How would you rate your practical working knowledge in your area?', note: 'Academic knowledge and hands-on fluency are different things.', type: 'chips', opts: ['Basic — aware of concepts, limited hands-on', 'Intermediate — comfortable with core tasks', 'Advanced — can work independently on complex tasks', 'Strong — I have done this in real settings and delivered results'] },
  { id: 'biztools', block: 'Your practical skills', text: 'Which tools or platforms have you actually worked with? Select all that apply.', note: 'Only tools relevant to your specialisation are shown.', type: 'multi', key: 'biztools' },
  { id: 'internship', block: 'Your practical skills', text: 'Have you done any internship, live project, or real work in your area?', type: 'chips', opts: ['No experience yet', 'One short internship (under 2 months)', 'One substantial internship (2 months or more)', 'Multiple internships or live projects', 'Part-time work or family business involvement'] },
  { id: 'comms', block: 'Your human skills', text: 'How would you rate your ability to communicate and present your ideas?', note: 'In an AI world, those who can direct and communicate AI outputs are irreplaceable.', type: 'chips', opts: ['It is a weakness — I struggle with this', 'I manage but it is not a strength', 'I am reasonably confident', 'It is one of my stronger skills', 'I am known for it — presentations, writing, speaking'] },
  { id: 'presence', block: 'Your human skills', text: 'Do you have any visible work or presence outside of college or work?', note: 'LinkedIn, blog, freelance project, side business, competition wins.', type: 'chips', opts: ['Nothing outside yet', 'A LinkedIn profile but not very active', 'Active on LinkedIn or another platform', 'A freelance project, blog, or side income', 'Running something — a business, channel, or community'] },
  { id: 'adaptability', block: 'Your human skills', text: 'When your field or plans change unexpectedly, what do you usually do?', note: 'Reveals how you handle disruption — one of the most important signals in the score.', type: 'chips', opts: ['I find it hard and take time to adjust', 'I adapt eventually but it takes effort', 'I adjust fairly quickly', 'I look for opportunities in the change'] },
];

export default function Home() {
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState({});
  const [multi, setMulti] = useState({ tools: [], biztools: [] });
  const [screen, setScreen] = useState('quiz'); // quiz | loading | result
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loadMsg, setLoadMsg] = useState(['Analysing your profile...', 'Reading your signals']);
  const textRef = useRef(null);

  const q = QUESTIONS[qi];
  const total = QUESTIONS.length;

  const getBizTools = () => {
    const spec = answers.spec || '';
    return BIZTOOLS_MAP[spec] || GENERAL_TOOLS;
  };

  const getOpts = () => {
    if (q.type === 'multi' && q.id === 'biztools') return getBizTools();
    return q.opts || [];
  };

  useEffect(() => {
    if (q.type === 'text' && textRef.current) textRef.current.focus();
  }, [qi]);

  const pickChip = (val) => {
    const newAnswers = { ...answers, [q.id]: val };
    setAnswers(newAnswers);
    setTimeout(() => {
      if (qi < total - 1) setQi(qi + 1);
      else submit(newAnswers, multi);
    }, 220);
  };

  const toggleMulti = (val) => {
    const key = q.key;
    const none = val.startsWith('None');
    setMulti(prev => {
      const cur = prev[key] || [];
      if (none) return { ...prev, [key]: [val] };
      const filtered = cur.filter(v => !v.startsWith('None'));
      const next = filtered.includes(val) ? filtered.filter(v => v !== val) : [...filtered, val];
      return { ...prev, [key]: next };
    });
  };

  const submitText = () => {
    const val = textRef.current?.value?.trim() || '';
    if (!val && !q.optional) return;
    const newAnswers = { ...answers, [q.id]: val };
    setAnswers(newAnswers);
    if (qi < total - 1) setQi(qi + 1);
    else submit(newAnswers, multi);
  };

  const submitMulti = () => {
    if (qi < total - 1) setQi(qi + 1);
    else submit(answers, multi);
  };

  const submit = async (ans, mul) => {
    setScreen('loading');
    const msgs = [
      ['Analysing your profile...', 'Reading your specialisation and experience signals'],
      ['Mapping your domain to disruption patterns...', 'Understanding how AI is reshaping your specific field'],
      ['Benchmarking against your peers...', 'Comparing profiles with similar backgrounds'],
      ['Crafting your roadmap...', 'Building a plan that fits your hours, goals and situation'],
    ];
    let mi = 0;
    setLoadMsg(msgs[0]);
    const iv = setInterval(() => { mi = (mi + 1) % msgs.length; setLoadMsg(msgs[mi]); }, 2500);

    const profile = `Name: ${ans.name || 'User'}, Age: ${ans.age}, Country: ${ans.country}, City: ${ans.city || 'not specified'}
Life stage: ${ans.stage}
Qualification: ${ans.qual}, Stream: ${ans.stream}, Year: ${ans.year}
AI tools used: ${mul.tools.join(', ') || 'None'}
AI usage depth: ${ans.aiuse}, AI learning: ${ans.ailearn}
Primary goal: ${ans.goal}
Hours/week for self-development: ${ans.hours}
Biggest professional worry: ${ans.worry}
Business specialisation: ${ans.spec}
Target industry: ${ans.industry}
Practical skill level: ${ans.skilllevel}
Tools used: ${mul.biztools.join(', ') || 'None'}
Internship / real work: ${ans.internship}
Communication ability: ${ans.comms}
Visibility / presence: ${ans.presence}
Adaptability: ${ans.adaptability}`;

    try {
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, name: ans.name, spec: ans.spec, stream: ans.stream, industry: ans.industry }),
      });
      clearInterval(iv);
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'API error'); }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setScreen('result');
    } catch (err) {
      clearInterval(iv);
      setError(err.message);
      setScreen('result');
    }
  };

  const restart = () => { setQi(0); setAnswers({}); setMulti({ tools: [], biztools: [] }); setResult(null); setError(null); setScreen('quiz'); };

  const tierStyle = (t) => ({ Critical: { bg: '#FCEBEB', color: '#A32D2D' }, Vulnerable: { bg: '#FAEEDA', color: '#854F0B' }, Adapting: { bg: '#E6F1FB', color: '#185FA5' }, 'Future-ready': { bg: '#E1F5EE', color: '#085041' } }[t] || { bg: '#F1EFE8', color: '#5F5E5A' });
  const riskColor = (r) => ({ Low: '#3B6D11', Medium: '#854F0B', High: '#A32D2D', 'Very High': '#A32D2D' }[r] || '#5F5E5A');
  const scoreColor = (s) => s >= 76 ? '#3B6D11' : s >= 51 ? '#185FA5' : s >= 26 ? '#854F0B' : '#A32D2D';

  const pct = Math.round((qi / total) * 100);

  return (
    <>
      <Head>
        <title>Career Relevance Score</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Mulish:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Mulish', sans-serif; background: #fafaf9; color: #1a1a18; min-height: 100vh; }
        .container { max-width: 560px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
        .prog-outer { height: 3px; background: #e8e6e0; border-radius: 2px; margin-bottom: 1.5rem; overflow: hidden; }
        .prog-inner { height: 3px; background: #1a1a18; border-radius: 2px; transition: width 0.4s ease; }
        .q-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; }
        .q-block { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #185FA5; }
        .q-counter { font-size: 11px; color: #888; }
        .q-title { font-family: 'Playfair Display', serif; font-size: clamp(18px, 4vw, 22px); font-weight: 700; line-height: 1.3; margin-bottom: 0.4rem; }
        .q-note { font-size: 13px; color: #666; line-height: 1.6; margin-bottom: 1.25rem; }
        .chip-group { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1.5rem; }
        .chip { padding: 10px 16px; border: 0.5px solid #d4d2ca; border-radius: 24px; font-size: 13px; cursor: pointer; background: #fff; color: #1a1a18; transition: all 0.15s; font-family: 'Mulish', sans-serif; font-weight: 500; -webkit-tap-highlight-color: transparent; }
        .chip:active { transform: scale(0.97); }
        .chip.sel { background: #E6F1FB; border-color: #378ADD; color: #185FA5; }
        .chip.sel-multi { background: #E1F5EE; border-color: #1D9E75; color: #085041; }
        .txt-input { width: 100%; padding: 13px 15px; border-radius: 10px; border: 0.5px solid #d4d2ca; background: #fff; color: #1a1a18; font-size: 15px; font-family: 'Mulish', sans-serif; outline: none; margin-bottom: 1.25rem; -webkit-appearance: none; }
        .txt-input:focus { border-color: #888; }
        .btn-primary { display: inline-flex; align-items: center; gap: 8px; background: #1a1a18; color: #fff; border: none; padding: 13px 26px; border-radius: 12px; font-size: 14px; font-weight: 600; font-family: 'Mulish', sans-serif; cursor: pointer; transition: opacity 0.15s; -webkit-tap-highlight-color: transparent; }
        .btn-primary:active { opacity: 0.8; }
        .btn-ghost { display: inline-flex; align-items: center; gap: 6px; background: transparent; color: #666; border: 0.5px solid #d4d2ca; padding: 11px 20px; border-radius: 12px; font-size: 13px; font-weight: 500; font-family: 'Mulish', sans-serif; cursor: pointer; -webkit-tap-highlight-color: transparent; }
        .nav-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .load-wrap { text-align: center; padding: 5rem 1rem; }
        .load-ring { width: 44px; height: 44px; border: 2.5px solid #e8e6e0; border-top-color: #1a1a18; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1.5rem; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .load-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; margin-bottom: 0.5rem; }
        .load-sub { font-size: 13px; color: #666; }
        .score-hero { text-align: center; padding: 2rem 0 1.5rem; border-bottom: 0.5px solid #e8e6e0; margin-bottom: 1.5rem; }
        .score-eyebrow { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 0.75rem; }
        .score-name { font-size: 14px; color: #666; font-style: italic; margin-bottom: 0.5rem; }
        .score-num { font-family: 'Playfair Display', serif; font-size: 80px; font-weight: 800; line-height: 1; margin-bottom: 0.5rem; }
        .score-tier { display: inline-block; font-size: 12px; font-weight: 600; padding: 5px 16px; border-radius: 20px; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.875rem; }
        .score-risk { font-size: 13px; margin-bottom: 0.5rem; }
        .score-summary { font-size: 14px; color: #555; max-width: 400px; margin: 0.75rem auto 0; line-height: 1.7; }
        .sec-head { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; margin-bottom: 1rem; }
        .dims { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-bottom: 1.5rem; }
        .dim { background: #f5f4f0; border-radius: 10px; padding: 11px 13px; }
        .dim-name { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; color: #888; margin-bottom: 5px; }
        .dim-row { display: flex; align-items: center; gap: 8px; }
        .dim-val { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; min-width: 32px; }
        .dim-bar { flex: 1; height: 3px; background: #e0ded8; border-radius: 2px; overflow: hidden; }
        .dim-fill { height: 3px; background: #1a1a18; border-radius: 2px; }
        .dim-insight { font-size: 11px; color: #666; margin-top: 4px; line-height: 1.4; }
        .divider { height: 0.5px; background: #e8e6e0; margin: 1.5rem 0; }
        .rm-item { border: 0.5px solid #e8e6e0; border-radius: 14px; padding: 14px 16px; margin-bottom: 9px; position: relative; background: #fff; }
        .rm-locked { background: #fafaf9; border-style: dashed; }
        .rm-week { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #185FA5; margin-bottom: 4px; }
        .rm-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; color: #1a1a18; }
        .rm-locked .rm-title { color: #999; }
        .rm-desc { font-size: 13px; color: #666; line-height: 1.55; }
        .rm-locked .rm-desc { color: #bbb; }
        .lock-badge { position: absolute; top: 12px; right: 12px; font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 20px; background: #FAEEDA; color: #854F0B; text-transform: uppercase; letter-spacing: 0.05em; }
        .skill-tag { display: inline-block; font-size: 12px; padding: 5px 12px; border-radius: 20px; background: #f5f4f0; color: #555; margin: 2px; }
        .risk-box { background: #FCEBEB; color: #791F1F; border-radius: 10px; padding: 12px 14px; font-size: 13px; line-height: 1.55; margin-bottom: 10px; }
        .risk-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; display: block; margin-bottom: 4px; }
        .salary-box { background: #E1F5EE; color: #04342C; border-radius: 10px; padding: 12px 14px; font-size: 13px; line-height: 1.55; margin-bottom: 1.5rem; }
        .action-row { display: flex; gap: 10px; flex-wrap: wrap; }
        .err-box { background: #FCEBEB; color: #791F1F; border-radius: 10px; padding: 14px; font-size: 13px; line-height: 1.6; margin-bottom: 1rem; }
        @media (max-width: 400px) { .dims { grid-template-columns: 1fr; } .chip { font-size: 14px; padding: 12px 16px; } }
      `}</style>

      <div className="container">

        {screen === 'quiz' && (
          <>
            <div className="prog-outer"><div className="prog-inner" style={{ width: pct + '%' }} /></div>
            <div className="q-meta">
              <span className="q-block">{q.block}</span>
              <span className="q-counter">{qi + 1} of {total}</span>
            </div>
            <div className="q-title">{q.text}</div>
            {q.note && <div className="q-note">{q.note}</div>}

            {q.type === 'text' && (
              <>
                <input ref={textRef} className="txt-input" type="text" placeholder={q.placeholder || ''} defaultValue={answers[q.id] || ''} onKeyDown={e => e.key === 'Enter' && submitText()} />
                <div className="nav-row">
                  {qi > 0 && <button className="btn-ghost" onClick={() => setQi(qi - 1)}>← Back</button>}
                  <button className="btn-primary" onClick={submitText}>{qi < total - 1 ? 'Continue →' : 'Generate my score →'}</button>
                </div>
              </>
            )}

            {q.type === 'chips' && (
              <>
                <div className="chip-group">
                  {getOpts().map(o => <div key={o} className={`chip${answers[q.id] === o ? ' sel' : ''}`} onClick={() => pickChip(o)}>{o}</div>)}
                </div>
                {qi > 0 && <div className="nav-row"><button className="btn-ghost" onClick={() => setQi(qi - 1)}>← Back</button></div>}
              </>
            )}

            {q.type === 'multi' && (
              <>
                <div className="chip-group">
                  {getOpts().map(o => {
                    const key = q.key;
                    const sel = (multi[key] || []).includes(o);
                    return <div key={o} className={`chip${sel ? ' sel-multi' : ''}`} onClick={() => toggleMulti(o)}>{o}</div>;
                  })}
                </div>
                <div className="nav-row">
                  {qi > 0 && <button className="btn-ghost" onClick={() => setQi(qi - 1)}>← Back</button>}
                  <button className="btn-primary" onClick={submitMulti}>{qi < total - 1 ? 'Continue →' : 'Generate my score →'}</button>
                </div>
              </>
            )}
          </>
        )}

        {screen === 'loading' && (
          <div className="load-wrap">
            <div className="load-ring" />
            <div className="load-title">{loadMsg[0]}</div>
            <div className="load-sub">{loadMsg[1]}</div>
          </div>
        )}

        {screen === 'result' && error && (
          <>
            <div className="err-box"><strong>Could not generate results</strong><br />{error}</div>
            <button className="btn-ghost" onClick={restart}>← Start over</button>
          </>
        )}

        {screen === 'result' && result && (() => {
          const ts = tierStyle(result.tier);
          const sc = scoreColor(result.overallScore);
          return (
            <>
              <div className="score-hero">
                <div className="score-eyebrow">Career Relevance Score</div>
                <div className="score-name">{answers.name || 'Your'} profile · {answers.spec || answers.stream}</div>
                <div className="score-num" style={{ color: sc }}>{result.overallScore}</div>
                <div><span className="score-tier" style={{ background: ts.bg, color: ts.color }}>{result.tier}</span></div>
                <div className="score-risk">Automation risk: <strong style={{ color: riskColor(result.automationRisk) }}>{result.automationRisk}</strong></div>
                <div style={{ fontSize: 12, color: '#666', maxWidth: 380, margin: '0.5rem auto', lineHeight: 1.5 }}>{result.automationRiskReason}</div>
                <div className="score-summary">{result.summary}</div>
              </div>

              <div className="sec-head">8-dimension breakdown</div>
              <div className="dims">
                {(result.dimensions || []).map(d => (
                  <div key={d.name} className="dim">
                    <div className="dim-name">{d.name}</div>
                    <div className="dim-row">
                      <span className="dim-val">{d.score}</span>
                      <div className="dim-bar"><div className="dim-fill" style={{ width: d.score + '%' }} /></div>
                    </div>
                    <div className="dim-insight">{d.insight}</div>
                  </div>
                ))}
              </div>

              <div className="divider" />

              <div className="sec-head">Your roadmap — first steps</div>
              <div style={{ fontSize: 12, color: '#888', marginBottom: '1rem' }}>First 2 steps are yours. Months 2 and 3 unlock with premium.</div>
              {(result.roadmap || []).map((item, i) => (
                <div key={i} className={`rm-item${item.locked ? ' rm-locked' : ''}`}>
                  {item.locked && <span className="lock-badge">Premium</span>}
                  <div className="rm-week">{item.week}</div>
                  <div className="rm-title">{item.locked ? 'Unlock to see this step' : item.title}</div>
                  <div className="rm-desc">{item.locked ? 'Full 90-day roadmap available with premium — specific actions, resources, and weekly check-ins.' : item.description}</div>
                </div>
              ))}

              <div className="divider" />

              <div className="sec-head">Skills to build now</div>
              <div style={{ marginBottom: '1rem' }}>{(result.topSkills || []).map(s => <span key={s} className="skill-tag">{s}</span>)}</div>

              <div className="risk-box"><span className="risk-label">One thing to avoid</span>{result.avoidRisk}</div>
              <div className="salary-box"><span className="risk-label" style={{ color: '#085041' }}>What this means for your earnings</span>{result.salaryImpact}</div>

              <div className="action-row">
                <button className="btn-primary" onClick={restart}>Retake assessment →</button>
              </div>
            </>
          );
        })()}

      </div>
    </>
  );
}

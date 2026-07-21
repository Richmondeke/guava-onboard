/**
 * Guava Onboard — AI Chat Endpoint
 * 
 * Interactively interviews users to collect complete PRD requirements.
 * Uses robust state-aware fallback flow to ensure continuous response.
 */

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'Messages array is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Try Gemini API if key is present
    if (apiKey) {
      try {
        const systemInstruction = `You are Guava AI, an expert Product Architect at Guava Earth (guava.earth).
Your goal is to converse naturally with clients to extract a comprehensive Product Requirements Document (PRD).
Ask 1 or 2 clear, non-technical questions per turn. Acknowledge their inputs warmly before moving forward.`;

        const contents = messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }));

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
          })
        });

        const data = await response.json();
        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return res.status(200).json({
            success: true,
            reply: data.candidates[0].content.parts[0].text
          });
        }
      } catch (e) {
        console.error('Gemini API fetch failed, falling back to smart rule engine:', e);
      }
    }

    // Rule-Engine Fallback: Guides the user step-by-step regardless of API status
    const userMessages = messages.filter(m => m.role === 'user');
    const stepCount = userMessages.length;
    const lastUserMsg = userMessages[userMessages.length - 1]?.text || '';

    let fallbackReply = '';

    if (stepCount === 1) {
      fallbackReply = `Got it! Thanks for sharing that about "${lastUserMsg}".\n\nWho are your target users or ideal customers for this app, and what primary problem will it solve for them?`;
    } else if (stepCount === 2) {
      fallbackReply = `That makes total sense! Having clear user personas is super helpful.\n\nWhat are the top 3 must-have core features (MVP) you want built into the first version?`;
    } else if (stepCount === 3) {
      fallbackReply = `Great feature list! We can definitely design and build those.\n\nAre there any specific third-party tools or integrations you need (e.g. Stripe for payments, OpenAI, SendGrid, HubSpot, or custom APIs)?`;
    } else if (stepCount === 4) {
      fallbackReply = `Understood! Integrations noted.\n\nDo you have any specific design or brand guidelines (like dark mode preference, brand colors, or existing admired apps)?`;
    } else if (stepCount === 5) {
      fallbackReply = `Awesome! What is your estimated target budget range (e.g., $5k-$15k, $15k-$50k, $50k+) and ideal launch timeline?`;
    } else {
      fallbackReply = `Fantastic! I've logged all your requirements so far. You can click the "💾 Compile & Save PRD to Backend" button below to save your brief directly to our engineering team!`;
    }

    return res.status(200).json({
      success: true,
      reply: fallbackReply
    });

  } catch (err) {
    console.error('Chat endpoint error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

/**
 * Guava Onboard — AI Chat Endpoint
 * 
 * Interactively interviews users to collect complete PRD requirements using Gemini 1.5/2.0 Flash.
 * Parses user answers and incrementally extracts structured PRD sections.
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
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ success: false, error: 'Gemini API key is not configured on backend.' });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'Messages array is required.' });
    }

    const systemInstruction = `You are Guava AI, an expert Product Architect & Lead AI Engineer at Guava Earth (guava.earth).
Your goal is to converse naturally with clients to extract a comprehensive Product Requirements Document (PRD) across these key categories:
1. Executive Contact Details (Full Name, Email, Company)
2. Product Overview & Purpose (Product Name, Problem statement, Elevator pitch)
3. Value Proposition & Key Differentiators
4. Business Goals & Success Metrics / KPIs
5. Target Audience, User Personas & Pain Points
6. Core Features & MVP Scope (Must-have capabilities)
7. User Stories ("As a user, I want to... so that...") & End-to-End User Journey
8. Roles, Permissions & Access Control Matrix
9. Data Entities, Data Retention & Security/Compliance (GDPR, HIPAA, etc.)
10. Integrations Required (Stripe, OpenAI, HubSpot, Slack, Custom APIs)
11. Design & UX Expectations (Look and feel, admired apps)
12. Non-Functional Requirements (Performance, Uptime SLA)
13. Risks, Constraints, Budget & Desired Timeline

GUIDELINES:
- Be warm, professional, encouraging, and clear.
- Ask 1 to 2 focused questions per turn so the client isn't overwhelmed.
- Acknowledge their previous answer intelligently before moving to the next question.
- After discussing several sections, offer to compile and save their complete PRD to the backend.`;

    // Format conversation history for Gemini API
    const contents = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800
        }
      })
    });

    const data = await response.json();

    if (!response.ok || !data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Gemini API Error:', JSON.stringify(data));
      return res.status(500).json({ success: false, error: 'Failed to generate AI response.' });
    }

    const replyText = data.candidates[0].content.parts[0].text;

    return res.status(200).json({
      success: true,
      reply: replyText
    });

  } catch (err) {
    console.error('Chat endpoint error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

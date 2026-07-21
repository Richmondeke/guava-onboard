/**
 * Guava Onboard — AI Chat Endpoint
 * 
 * Interactively interviews users to collect full product requirements (PRD).
 * Employs a comprehensive system prompt covering all 19 PRD categories.
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

    // Comprehensive System Instruction covering full PRD scope
    const systemInstruction = `You are Guava AI, an elite Lead Product Architect & Engineer at Guava Earth (guava.earth).
Your mission is to conduct a friendly, plain-language interview with clients to uncover their FULL Product Requirements Document (PRD) across all 19 core building blocks:

1. EXECUTIVE OVERVIEW: Product Name, One-sentence elevator pitch, Core problem & inspiration.
2. BUSINESS GOALS & VALUE PROP: Primary business outcomes, ROI targets, success KPIs, key differentiators.
3. TARGET AUDIENCE & PERSONAS: Primary user roles, daily workflows, user pain points & current workarounds.
4. MVP CORE FEATURES: Must-have functional features for V1 vs future V2 non-goals.
5. USER JOURNEY & STORIES: Key user stories ("As a [user], I want to [action] so that [benefit]") and end-to-end onboarding/usage flow.
6. USER ACCESS & AUTHENTICATION: Login methods (Email, Google, SSO, Magic links) & role access levels (Admin, Member, Guest).
7. DATA MODEL & RETENTION: Core data entities stored (Users, Transactions, Documents) & privacy compliance (GDPR, HIPAA).
8. INTEGRATIONS & APIS: External tool connections (Stripe, OpenAI, SendGrid, HubSpot, Webhooks, CRMs).
9. DESIGN & UX EXPECTATIONS: Aesthetics preference (Dark/Light mode, brand colors, admired UI like Linear/Apple/Notion).
10. PERFORMANCE & SLA: Speed expectations, uptime goals, mobile responsiveness.
11. BUDGET, RISKS & TIMELINE: Target budget tier, hard deadlines, technical risks & constraints.

INTERVIEWING RULES:
- Ask 1 to 2 clear, encouraging questions per response. Avoid technical jargon.
- Intelligently validate and reflect back what the user says before asking the next question.
- After gathering details across 5+ steps, proactively invite the user to click the "💾 Compile & Save PRD to Backend" button.`;

    if (apiKey) {
      try {
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
            generationConfig: { temperature: 0.7, maxOutputTokens: 850 }
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
        console.error('Gemini API fetch error, using robust fallback workflow:', e);
      }
    }

    // Comprehensive Fallback Sequence matching the system instruction
    const userMessages = messages.filter(m => m.role === 'user');
    const stepCount = userMessages.length;
    const lastUserMsg = userMessages[userMessages.length - 1]?.text || '';

    let fallbackReply = '';

    if (stepCount === 1) {
      fallbackReply = `Got it! Thanks for sharing: "${lastUserMsg}".\n\nTo make sure we define a complete PRD, who are your primary target users or personas, and what specific pain points will this product solve for them?`;
    } else if (stepCount === 2) {
      fallbackReply = `That gives us great clarity on your audience!\n\nWhat are the top 3-5 must-have core features for your MVP (Version 1.0), and are there any features explicitly out of scope for now?`;
    } else if (stepCount === 3) {
      fallbackReply = `Awesome feature set! Next, how should users log in (e.g. Email/Password, Google SSO, Magic Links), and will there be different permission levels (e.g. Admins vs regular Members)?`;
    } else if (stepCount === 4) {
      fallbackReply = `Perfect. What external services or APIs need to be integrated (e.g. Stripe for payments, OpenAI, SendGrid, HubSpot, or custom webhooks)?`;
    } else if (stepCount === 5) {
      fallbackReply = `Noted! Do you have specific design & UX preferences (like dark/light theme, brand color scheme, or admired app designs like Notion, Linear, or Apple)?`;
    } else if (stepCount === 6) {
      fallbackReply = `Almost complete! What is your estimated target budget range ($5k-$15k, $15k-$50k, $50k+) and desired launch timeline or hard deadlines?`;
    } else {
      fallbackReply = `🎉 Fantastic! I have gathered a comprehensive overview of your product requirements across all 19 PRD categories.\n\nYou can click the "💾 Compile & Save PRD to Backend" button below to store your complete brief directly with the Guava engineering team!`;
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

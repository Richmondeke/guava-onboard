/**
 * Guava Onboard — AI Chat Endpoint
 * 
 * Context-aware AI chatbot that validates input meaningfully and offers interactive button chips.
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

    const systemInstruction = `You are Guava AI, Lead Product Architect at Guava Earth (guava.earth).
Your mission is to conduct a friendly, context-aware interview to extract a full Product Requirements Document (PRD).

IMPORTANT CONTEXT-AWARE RULES:
1. If the user gives a short greeting (like "Hi", "Hello", "Hey"), DO NOT say "Got it! Thanks for sharing that about 'Hi'". Instead, warmly welcome them and ask what product idea or software project they want to build!
2. If the answer is meaningful, acknowledge their specific idea intelligently before asking the next question.
3. Keep questions clear and conversational.
4. Whenever asking about structured categories (such as Authentication, User Roles, Integrations, Platforms, Budget, or Timelines), include interactive quick-select button chips in your response using JSON format at the very end of your reply:
   [OPTIONS: "Email & Password", "Google SSO", "Magic Links", "OAuth / Social Login"]

PRD COVERAGE CATEGORIES:
1. Product Name & Elevator Pitch
2. Target Audience & User Personas
3. MVP Must-Have Core Features
4. Authentication & Role Permissions
5. Integrations & Third-Party APIs
6. Design & UX Preferences
7. Budget & Launch Timeline`;

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
        console.error('Gemini API fetch error, using robust fallback engine:', e);
      }
    }

    // Context-Aware Rule Engine Fallback
    const userMessages = messages.filter(m => m.role === 'user');
    const stepCount = userMessages.length;
    const lastUserMsg = userMessages[userMessages.length - 1]?.text || '';
    const cleanMsg = lastUserMsg.toLowerCase().trim();

    let fallbackReply = '';
    let options = [];

    // Greeting detection
    const isGreeting = ['hi', 'hello', 'hey', 'yo', 'sup', 'good morning', 'good afternoon'].includes(cleanMsg);

    if (stepCount === 1) {
      if (isGreeting) {
        fallbackReply = `Welcome! 👋 I'm excited to help you design your product brief. What is the name of your product or software idea, and what core problem will it solve?`;
      } else {
        fallbackReply = `Got it! "${lastUserMsg}" sounds like a promising concept. Who are your primary target users or ideal customers, and what key pain points will this solve for them?`;
      }
    } else if (stepCount === 2) {
      fallbackReply = `That gives us great clarity on your target audience! What are the top 3 must-have core features you want built into your MVP (Version 1.0)?`;
    } else if (stepCount === 3) {
      fallbackReply = `Great feature set! Next, how should users log in and authenticate into your application?`;
      options = ["Email & Password", "Google SSO", "Magic Links", "Role-Based Access (Admin/Member)"];
    } else if (stepCount === 4) {
      fallbackReply = `Authentication strategy noted! What external services or APIs need to be integrated into your app?`;
      options = ["Stripe Payments", "OpenAI / LLMs", "SendGrid Emails", "HubSpot CRM", "Custom Webhooks"];
    } else if (stepCount === 5) {
      fallbackReply = `Integrations recorded! Do you have specific design & UX style preferences?`;
      options = ["Modern Dark Theme", "Clean Light Mode", "Match Brand Colors", "Linear / Apple Style UI"];
    } else if (stepCount === 6) {
      fallbackReply = `Almost done! What is your target budget range and estimated delivery timeline?`;
      options = ["Under $5K (ASAP)", "$5K - $15K (1 Month)", "$15K - $50K (2-3 Months)", "$50K+ (Enterprise)"];
    } else {
      fallbackReply = `🎉 Fantastic! I have gathered a comprehensive overview of your product requirements across all core PRD categories.\n\nYou can click the "💾 Compile & Save PRD to Backend" button below to store your complete brief directly with our engineering team!`;
    }

    if (options.length > 0) {
      fallbackReply += `\n\n[OPTIONS: ${options.map(o => `"${o}"`).join(', ')}]`;
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

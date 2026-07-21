/**
 * Guava Onboard — Lead Submission API
 * 
 * Vercel Serverless Function that:
 * 1. Validates the incoming PRD questionnaire data
 * 2. Stores it (logs to Vercel function logs for now)
 * 3. Optionally forwards to a webhook (Make.com / n8n / Zapier)
 * 4. Returns confirmation
 * 
 * Environment Variables:
 *   WEBHOOK_URL (optional) — URL to forward lead data to (e.g., Make.com webhook)
 *   LEAD_SECRET  (optional) — Shared secret for webhook authentication
 */

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const body = req.body;

    // ─── Validate required fields ───────────────────────────────
    const errors = [];

    if (!body.contact?.fullName?.trim()) {
      errors.push('Full name is required');
    }

    if (!body.contact?.email?.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.contact.email)) {
      errors.push('Invalid email format');
    }

    if (errors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        errors 
      });
    }

    // ─── Sanitize & structure the comprehensive PRD data ─────────────
    const lead = {
      id: generateLeadId(),
      type: 'FULL_PRD_SUBMISSION',
      contact: {
        fullName: sanitize(body.contact.fullName),
        email: sanitize(body.contact.email).toLowerCase(),
        company: sanitize(body.contact.company || ''),
        phone: sanitize(body.contact.phone || ''),
      },
      overview: {
        projectName: sanitize(body.overview?.projectName || ''),
        description: sanitize(body.overview?.description || ''),
        successMetrics: sanitize(body.overview?.successMetrics || ''),
      },
      personas: {
        userRoles: sanitize(body.personas?.userRoles || ''),
        userPainPoints: sanitize(body.personas?.userPainPoints || ''),
        targetPlatforms: sanitizeArray(body.personas?.targetPlatforms),
      },
      functionalScope: {
        featureModules: sanitizeArray(body.functionalScope?.featureModules),
        coreFeatureDetails: sanitize(body.functionalScope?.coreFeatureDetails || ''),
      },
      authAndSecurity: {
        authTypes: sanitizeArray(body.authAndSecurity?.authTypes),
        permissionLevels: sanitize(body.authAndSecurity?.permissionLevels || ''),
        complianceNeeds: sanitize(body.authAndSecurity?.complianceNeeds || ''),
      },
      integrations: {
        integrationTypes: sanitizeArray(body.integrations?.integrationTypes),
        customIntegrations: sanitize(body.integrations?.customIntegrations || ''),
      },
      techAndDelivery: {
        budget: sanitize(body.techAndDelivery?.budget || 'Not specified'),
        timeline: sanitize(body.techAndDelivery?.timeline || 'Not specified'),
        frontend: sanitizeArray(body.techAndDelivery?.frontend),
        backend: sanitizeArray(body.techAndDelivery?.backend),
        ai: sanitizeArray(body.techAndDelivery?.ai),
        letGuavaDecide: Boolean(body.techAndDelivery?.letGuavaDecide),
      },
      metadata: {
        submittedAt: new Date().toISOString(),
        clientSubmittedAt: body.submittedAt || null,
        userAgent: req.headers['user-agent'] || 'unknown',
        ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
        referer: req.headers['referer'] || 'direct',
      },
    };

    // ─── Log the lead (always visible in Vercel function logs) ──
    console.log('━━━ NEW LEAD SUBMITTED ━━━');
    console.log(JSON.stringify(lead, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // ─── Forward to Supabase if configured ────────────────────────
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: dbResult, error: dbError } = await supabase
          .from('prd_leads')
          .insert([
            {
              lead_id: lead.id,
              full_name: lead.contact.fullName,
              email: lead.contact.email,
              company: lead.contact.company,
              phone: lead.contact.phone,
              app_source: 'onboard.guava.earth',
              product_line: 'Guava Earth (Mother Agency)',
              prd_data: lead,
              created_at: new Date().toISOString()
            }
          ]);

        if (dbError) {
          console.error('Supabase DB Insert Error:', dbError.message);
        } else {
          console.log('Lead stored to Supabase successfully:', lead.id);
        }
      } catch (sbErr) {
        console.error('Supabase integration error:', sbErr.message);
      }
    }

    // ─── Forward to webhook if configured ───────────────────────
    const webhookUrl = process.env.WEBHOOK_URL;
    
    if (webhookUrl) {
      try {
        const webhookPayload = {
          ...lead,
          _source: 'guava-onboard',
          _secret: process.env.LEAD_SECRET || '',
        };

        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookPayload),
          signal: AbortSignal.timeout(10000), // 10s timeout
        });

        if (!webhookResponse.ok) {
          console.error(`Webhook failed: ${webhookResponse.status} ${webhookResponse.statusText}`);
        } else {
          console.log('Webhook forwarded successfully');
        }
      } catch (webhookError) {
        console.error('Webhook error:', webhookError.message);
      }
    }

    // ─── Return success ─────────────────────────────────────────
    return res.status(200).json({
      success: true,
      message: 'Your project brief has been submitted successfully!',
      leadId: lead.id,
    });

  } catch (error) {
    console.error('Lead submission error:', error);
    return res.status(500).json({
      success: false,
      error: 'Something went wrong. Please try again.',
    });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────

/** Generate a short unique lead ID */
function generateLeadId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `GV-${timestamp}-${random}`.toUpperCase();
}

/** Basic string sanitization — strip HTML tags */
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
}

/** Sanitize an array of strings */
function sanitizeArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(sanitize).filter(Boolean);
}

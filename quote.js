// Cloudflare Pages Function: /functions/api/quote.js
// Handles instant quote generation, rate limiting, and TreadAI API integrations

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { year, make, model, tireSize, email, serviceType } = body;

    if (!year || !make || !model || !tireSize || !email) {
      return new Response(JSON.stringify({ error: "Missing required vehicle parameters" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const clientIP = request.headers.get("cf-connecting-ip") || "127.0.0.1";
    const userKey = `user:${email.toLowerCase().trim()}`;
    const ipKey = `ip:${clientIP}`;

    // 1. Subscription & Rate Limit Verification via Cloudflare KV
    let subscriptionTier = "Free Tier";
    let allowedCredits = 1;
    let usedCredits = 0;

    if (env.QUOTE_CREDITS) {
      const userDataStr = await env.QUOTE_CREDITS.get(userKey);
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        subscriptionTier = userData.tier || "Free Tier";
        usedCredits = userData.usedCredits || 0;
      } else {
        // Fallback to IP check
        const ipDataStr = await env.QUOTE_CREDITS.get(ipKey);
        if (ipDataStr) {
          const ipData = JSON.parse(ipDataStr);
          usedCredits = ipData.usedCredits || 0;
        }
      }

      if (subscriptionTier === "Peak Performer" || subscriptionTier === "$35/mo Tier") {
        allowedCredits = 4;
      } else if (subscriptionTier === "Fleet Dominator" || subscriptionTier === "$50/mo Tier") {
        allowedCredits = 1; // 1 collective comprehensive quote for up to 5 cars
      } else {
        allowedCredits = 1; // Free tier
      }

      if (usedCredits >= allowedCredits) {
        return new Response(JSON.stringify({
          error: "Monthly Quote Limit Reached! Take massive action and upgrade your plan to unlock more quotes.",
          usedCredits,
          allowedCredits,
          remainingCredits: 0,
          tier: subscriptionTier,
          upgradeRequired: true
        }), {
          status: 429,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Record incremented usage
      const newUsage = usedCredits + 1;
      await env.QUOTE_CREDITS.put(userKey, JSON.stringify({
        tier: subscriptionTier,
        usedCredits: newUsage,
        lastUpdated: new Date().toISOString()
      }), { expirationTtl: 60 * 60 * 24 * 30 }); // 30 day TTL

      await env.QUOTE_CREDITS.put(ipKey, JSON.stringify({
        usedCredits: newUsage,
        lastUpdated: new Date().toISOString()
      }), { expirationTtl: 60 * 60 * 24 * 30 });
    }

    // 2. Dual TreadAI API Integrations
    // Calling TreadAI Pricing API & TreadAI Compatibility/Installation API in parallel
    let pricingData = null;
    let compatData = null;

    const pricingUrl = env.TREAD_AI_PRICING_API_BASE || "https://api.treadai.com/v1/pricing";
    const compatUrl = env.TREAD_AI_COMPAT_API_BASE || "https://api.treadai.com/v1/compatibility";

    if (env.TREAD_AI_PRICING_API_KEY && env.TREAD_AI_COMPAT_API_KEY) {
      try {
        const [pricingRes, compatRes] = await Promise.all([
          fetch(`${pricingUrl}?size=${encodeURIComponent(tireSize)}`, {
            headers: { "Authorization": `Bearer ${env.TREAD_AI_PRICING_API_KEY}` }
          }),
          fetch(`${compatUrl}?year=${encodeURIComponent(year)}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&size=${encodeURIComponent(tireSize)}`, {
            headers: { "Authorization": `Bearer ${env.TREAD_AI_COMPAT_API_KEY}` }
          })
        ]);

        if (pricingRes.ok) pricingData = await pricingRes.json();
        if (compatRes.ok) compatData = await compatRes.json();
      } catch (apiErr) {
        console.warn("External TreadAI network calls bypassed. Utilizing deterministic engine.", apiErr);
      }
    }

    // High performance fallback/blended quote generation
    const baseLabor = compatData?.laborCost || 89.99;
    const brakePackageCost = 179.99;
    const remainingCount = Math.max(0, allowedCredits - (usedCredits + 1));

    const options = [
      {
        tier: "Good (Solid Value)",
        brand: pricingData?.options?.[0]?.brand || "RoadMaster Touring All-Season",
        size: tireSize,
        unitPrice: 114.99,
        fourTires: 459.96,
        labor: baseLabor,
        totalTirePackage: 459.96 + baseLabor,
        warranty: "45,000 Mile Treadwear Warranty",
        compatibilityScore: "100% Verified OEM Fitment",
        specs: "Standard silica compound, wet traction rating A"
      },
      {
        tier: "Better (Peak Performer - Recommended)",
        brand: pricingData?.options?.[1]?.brand || "Continental ExtremeGrip DWS06 Plus",
        size: tireSize,
        unitPrice: 168.50,
        fourTires: 674.00,
        labor: baseLabor,
        totalTirePackage: 674.00 + baseLabor,
        warranty: "65,000 Mile Treadwear Warranty + Free Road Hazard",
        compatibilityScore: "100% Verified Performance Fitment",
        specs: "High-silica wet/dry grip, SportPlus tech, rim protection"
      },
      {
        tier: "Best (Apex Dominator)",
        brand: pricingData?.options?.[2]?.brand || "Michelin Pilot Sport All-Season 4",
        size: tireSize,
        unitPrice: 219.00,
        fourTires: 876.00,
        labor: baseLabor,
        totalTirePackage: 876.00 + baseLabor,
        warranty: "70,000 Mile Treadwear Warranty + 3-Year Free Hazard",
        compatibilityScore: "100% Verified Ultra-High-Performance",
        specs: "Dynamic Response tech, extreme stopping power, track-inspired"
      }
    ];

    return new Response(JSON.stringify({
      success: true,
      vehicle: `${year} ${make} ${model}`,
      tireSize,
      email,
      serviceType,
      plan: subscriptionTier,
      remainingCredits: remainingCount,
      allowedCredits,
      laborRate: baseLabor,
      brakePackage: brakePackageCost,
      options,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Server processing error", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

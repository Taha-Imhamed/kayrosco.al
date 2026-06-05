const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const GROK_URL = "https://api.x.ai/v1/chat/completions";

export function inferDepartment(text = "") {
  const value = text.toLowerCase();
  if (
    /(residency|visa|permit|passport|documents|residence|company formation|student)/.test(
      value
    )
  ) {
    return "consulting";
  }
  if (/(hotel|villa|apartment|airport|tour|destination|travel|guide|transfer)/.test(value)) {
    return "travel";
  }
  if (/(website|app|software|seo|e-commerce|ecommerce|system|platform|tech)/.test(value)) {
    return "tech";
  }
  return null;
}

export function pickProvider() {
  const requested = (process.env.AI_PROVIDER || "gemini").toLowerCase();
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const hasGrok = Boolean(process.env.XAI_API_KEY);

  if (requested === "grok" && hasGrok) return { configured: true, provider: "grok" };
  if (hasGemini) return { configured: true, provider: "gemini" };
  if (requested === "grok" && hasGrok) return { configured: true, provider: "grok" };
  if (hasGrok && !hasGemini && requested === "grok") return { configured: true, provider: "grok" };
  return {
    configured: false,
    provider: null,
    error:
      "No AI provider is configured. Set AI_PROVIDER=gemini with GEMINI_API_KEY, or AI_PROVIDER=grok with XAI_API_KEY.",
  };
}

export async function generateAgentReply({
  scope,
  systemPrompt,
  userPrompt,
}) {
  const config = pickProvider();
  if (!config.configured) {
    throw new Error(config.error);
  }

  if (config.provider === "gemini") {
    const response = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
        generationConfig: { temperature: scope === "public" ? 0.5 : 0.3 },
      }),
    });
    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join("") || "";
    if (!response.ok || !text) {
      throw new Error(data?.error?.message || "Gemini request failed.");
    }
    return text.trim();
  }

  const response = await fetch(GROK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.XAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "grok-3-mini",
      temperature: scope === "public" ? 0.5 : 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || "";
  if (!response.ok || !text) {
    throw new Error(data?.error?.message || "Grok request failed.");
  }
  return text.trim();
}

export function buildPublicFallbackReply(department) {
  const deptLabel =
    department === "consulting"
      ? "Consulting"
      : department === "travel"
        ? "Travel"
        : department === "tech"
          ? "Tech"
          : "the right team";
  return `Understood. I’ll route this to ${deptLabel}. Please complete your contact details, service type, and request below. For legal, residency, or visa matters, our team will review the case before advising next steps.`;
}

export function summariseLead(payload) {
  const detailBlock =
    payload.department === "consulting"
      ? payload.consultingDetails
      : payload.department === "travel"
        ? payload.travelDetails
        : payload.techDetails;
  const detailText = detailBlock
    ? Object.entries(detailBlock)
        .filter(([, value]) => value)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
        .join("; ")
    : "";
  return `${payload.fullName} requested ${payload.serviceType} via ${payload.department}. ${payload.message}${detailText ? ` Details: ${detailText}.` : ""}`;
}

import { pickProvider } from "../_lib/agent.js";
import { json } from "../_lib/response.js";

export default async function handler() {
  const result = pickProvider();
  return json({
    ok: true,
    provider: result.provider,
    configured: result.configured,
    error: result.error,
  });
}

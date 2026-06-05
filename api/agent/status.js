import { body, json } from "../_lib/response.js";
import { supabaseAdmin } from "../_lib/supabase.js";

export default async function handler(request) {
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  try {
    const payload = await body(request);
    const { error } = await supabaseAdmin
      .from("agent_work")
      .update({ status: payload.status, updated_at: new Date().toISOString() })
      .eq("id", payload.workId);
    if (error) throw new Error(error.message);
    return json({ ok: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Status update failed." }, 500);
  }
}

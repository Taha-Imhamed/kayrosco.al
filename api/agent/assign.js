import { body, json } from "../_lib/response.js";
import { supabaseAdmin } from "../_lib/supabase.js";

export default async function handler(request) {
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  try {
    const payload = await body(request);
    const { error } = await supabaseAdmin.from("agent_assignments").upsert(
      {
        work_id: payload.workId,
        worker_id: payload.workerId,
        worker_name: payload.workerName,
        assigned_by: payload.actor?.id || null,
        assigned_by_name: payload.actor?.name || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "work_id" }
    );
    if (error) throw new Error(error.message);
    return json({ ok: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Assignment failed." }, 500);
  }
}

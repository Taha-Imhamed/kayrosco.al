import { body, json } from "../_lib/response.js";
import { supabaseAdmin } from "../_lib/supabase.js";

export default async function handler(request) {
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  try {
    const payload = await body(request);
    const { data, error } = await supabaseAdmin
      .from("agent_internal_notes")
      .insert({
        work_id: payload.workId,
        author_id: payload.actor?.id || null,
        author_name: payload.actor?.name || null,
        content: payload.content,
      })
      .select("id, work_id, author_id, author_name, content, created_at")
      .single();
    if (error) throw new Error(error.message);
    return json({
      ok: true,
      note: {
        id: data.id,
        workId: data.work_id,
        authorId: data.author_id,
        authorName: data.author_name,
        content: data.content,
        createdAt: data.created_at,
      },
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Note save failed." }, 500);
  }
}

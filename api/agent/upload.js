import { json } from "../_lib/response.js";
import { supabaseAdmin } from "../_lib/supabase.js";

const BUCKET = "agent-documents";

export default async function handler(request) {
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return json({ error: "File is required." }, 400);
    }

    const conversationId = formData.get("conversationId")?.toString() || null;
    const workId = formData.get("workId")?.toString() || null;
    const kind = formData.get("kind")?.toString() || "supporting-document";
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
    const path = `${conversationId || "unlinked"}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: file.type || "application/octet-stream" });
    if (error) throw new Error(error.message);

    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
    return json({
      name: file.name,
      url: data.publicUrl,
      path,
      mimeType: file.type || null,
      kind,
      sizeBytes: file.size,
      conversationId,
      workId,
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Upload failed." }, 500);
  }
}

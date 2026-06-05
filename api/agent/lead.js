import { generateAgentReply, summariseLead } from "../_lib/agent.js";
import { body, json } from "../_lib/response.js";
import { supabaseAdmin } from "../_lib/supabase.js";

async function ensureConversation(conversationId, department, summary, payload) {
  if (conversationId) {
    await supabaseAdmin
      .from("agent_conversations")
      .update({
        department,
        summary,
        status: "completed",
        metadata: payload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId);
    return conversationId;
  }
  const { data, error } = await supabaseAdmin
    .from("agent_conversations")
    .insert({
      scope: "public",
      department,
      summary,
      status: "completed",
      metadata: payload,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

export default async function handler(request) {
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  try {
    const payload = await body(request);
    const fallbackSummary = summariseLead(payload);
    let summary = fallbackSummary;

    try {
      summary = await generateAgentReply({
        scope: "internal",
        systemPrompt:
          "Summarize this Kayrosco lead for staff. Use 2-4 concise sentences. Mention department, requested service, urgency, and any missing documents or blockers.",
        userPrompt: JSON.stringify(payload),
      });
    } catch {
      summary = fallbackSummary;
    }

    const conversationId = await ensureConversation(
      payload.conversationId,
      payload.department,
      summary,
      payload
    );

    const { data: workItem, error: workError } = await supabaseAdmin
      .from("agent_work")
      .insert({
        conversation_id: conversationId,
        client_name: payload.fullName,
        client_email: payload.email,
        client_phone: payload.phone,
        department: payload.department,
        service_type: payload.serviceType,
        status: "new",
        priority: payload.priority || "medium",
        country: payload.country || null,
        preferred_contact_method: payload.preferredContactMethod || null,
        summary,
        structured_data: payload,
      })
      .select("id")
      .single();
    if (workError) throw new Error(workError.message);

    if (Array.isArray(payload.uploadedDocuments) && payload.uploadedDocuments.length) {
      const docs = payload.uploadedDocuments.map((doc) => ({
        conversation_id: conversationId,
        work_id: workItem.id,
        bucket: "agent-documents",
        storage_path: doc.path || null,
        file_name: doc.name,
        mime_type: doc.mimeType || null,
        size_bytes: doc.sizeBytes || null,
        document_kind: doc.kind || "supporting-document",
      }));
      const { error: docError } = await supabaseAdmin.from("agent_documents").insert(docs);
      if (docError) throw new Error(docError.message);
    }

    return json({ ok: true, workId: workItem.id, conversationId });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Lead save failed." }, 500);
  }
}

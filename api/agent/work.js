import { json } from "../_lib/response.js";
import { supabaseAdmin } from "../_lib/supabase.js";

function mapWork(row, documents, assignment, notes) {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    clientName: row.client_name,
    clientEmail: row.client_email,
    clientPhone: row.client_phone,
    department: row.department,
    serviceType: row.service_type,
    status: row.status,
    priority: row.priority,
    country: row.country,
    preferredContactMethod: row.preferred_contact_method,
    summary: row.summary,
    structuredData: row.structured_data || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    assignedWorkerId: assignment?.worker_id || null,
    assignedWorkerName: assignment?.worker_name || null,
    uploadedFiles: documents.map((doc) => ({
      id: doc.id,
      name: doc.file_name,
      url: doc.public_url || null,
      path: doc.storage_path,
      mimeType: doc.mime_type,
      kind: doc.document_kind,
      sizeBytes: doc.size_bytes,
    })),
    notes: notes.map((note) => ({
      id: note.id,
      workId: note.work_id,
      authorId: note.author_id,
      authorName: note.author_name,
      content: note.content,
      createdAt: note.created_at,
    })),
  };
}

export default async function handler(request) {
  if (request.method !== "GET") return json({ error: "Method not allowed." }, 405);

  try {
    const url = new URL(request.url);
    const conversationId = url.searchParams.get("conversationId");
    if (conversationId) {
      const [{ data: conversation }, { data: messages }] = await Promise.all([
        supabaseAdmin
          .from("agent_conversations")
          .select("*")
          .eq("id", conversationId)
          .maybeSingle(),
        supabaseAdmin
          .from("agent_messages")
          .select("id, sender, content, created_at")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true }),
      ]);
      return json({
        conversation: conversation
          ? {
              id: conversation.id,
              scope: conversation.scope,
              department: conversation.department,
              status: conversation.status,
              summary: conversation.summary,
              createdAt: conversation.created_at,
              updatedAt: conversation.updated_at,
              messages: (messages || []).map((message) => ({
                id: message.id,
                sender: message.sender,
                content: message.content,
                createdAt: message.created_at,
              })),
            }
          : null,
      });
    }

    let query = supabaseAdmin.from("agent_work").select("*").order("created_at", { ascending: false });
    const department = url.searchParams.get("department");
    const status = url.searchParams.get("status");
    const priority = url.searchParams.get("priority");
    const date = url.searchParams.get("date");

    if (department) query = query.eq("department", department);
    if (status) query = query.eq("status", status);
    if (priority) query = query.eq("priority", priority);
    if (date) {
      query = query
        .gte("created_at", `${date}T00:00:00.000Z`)
        .lte("created_at", `${date}T23:59:59.999Z`);
    }

    const { data: workRows, error } = await query;
    if (error) throw new Error(error.message);

    const workIds = (workRows || []).map((row) => row.id);
    const [docsRes, assignmentsRes, notesRes] = await Promise.all([
      workIds.length
        ? supabaseAdmin.from("agent_documents").select("*").in("work_id", workIds)
        : Promise.resolve({ data: [] }),
      workIds.length
        ? supabaseAdmin.from("agent_assignments").select("*").in("work_id", workIds)
        : Promise.resolve({ data: [] }),
      workIds.length
        ? supabaseAdmin
            .from("agent_internal_notes")
            .select("*")
            .in("work_id", workIds)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [] }),
    ]);

    const docsByWork = new Map();
    (docsRes.data || []).forEach((doc) => {
      const entry = docsByWork.get(doc.work_id) || [];
      const publicUrl = doc.storage_path
        ? supabaseAdmin.storage.from(doc.bucket || "agent-documents").getPublicUrl(doc.storage_path).data.publicUrl
        : null;
      entry.push({ ...doc, public_url: publicUrl });
      docsByWork.set(doc.work_id, entry);
    });

    const assignmentByWork = new Map(
      (assignmentsRes.data || []).map((assignment) => [assignment.work_id, assignment])
    );
    const notesByWork = new Map();
    (notesRes.data || []).forEach((note) => {
      const entry = notesByWork.get(note.work_id) || [];
      entry.push(note);
      notesByWork.set(note.work_id, entry);
    });

    return json({
      items: (workRows || []).map((row) =>
        mapWork(
          row,
          docsByWork.get(row.id) || [],
          assignmentByWork.get(row.id),
          notesByWork.get(row.id) || []
        )
      ),
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Load failed." }, 500);
  }
}

import {
  buildPublicFallbackReply,
  generateAgentReply,
  inferDepartment,
} from "../_lib/agent.js";
import { body, json } from "../_lib/response.js";
import { supabaseAdmin } from "../_lib/supabase.js";

async function ensureConversation(scope, conversationId, department, metadata = {}) {
  if (conversationId) {
    return conversationId;
  }
  const { data, error } = await supabaseAdmin
    .from("agent_conversations")
    .insert({
      scope,
      department,
      status: scope === "public" ? "collecting" : "open",
      metadata,
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
    const scope = payload.scope === "internal" ? "internal" : "public";
    const department =
      payload.department ||
      inferDepartment(`${payload.message || ""} ${JSON.stringify(payload.metadata || {})}`);
    const conversationId = await ensureConversation(
      scope,
      payload.conversationId,
      department,
      payload.metadata || {}
    );

    const { error: insertUserError } = await supabaseAdmin.from("agent_messages").insert({
      conversation_id: conversationId,
      sender: "user",
      content: payload.message || "",
      metadata: payload.metadata || {},
    });
    if (insertUserError) throw new Error(insertUserError.message);

    let replyText = "";
    if (scope === "public") {
      try {
        replyText = await generateAgentReply({
          scope,
          systemPrompt:
            "You are Kayrosco Group's public-facing agent. Be professional, friendly, and concise. Help the visitor clarify whether they need Travel, Consulting, or Tech. Do not promise legal approvals or guarantees. For residency, legal, visa, or permit matters, say the team will review the case. Keep responses under 90 words.",
          userPrompt: `Detected department: ${department || "unknown"}.\nVisitor message: ${payload.message}`,
        });
      } catch {
        replyText = buildPublicFallbackReply(department);
      }
    } else {
      const { data: workRows } = await supabaseAdmin
        .from("agent_work")
        .select(
          "id, client_name, department, service_type, status, priority, summary, structured_data, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(12);

      const activeWork =
        payload.activeWorkId &&
        workRows?.find((row) => row.id === payload.activeWorkId);

      replyText = await generateAgentReply({
        scope,
        systemPrompt:
          "You are Kayrosco Group's internal operations assistant. Answer only from the supplied case data and general operational reasoning. If information is missing, say so clearly. Keep answers structured and practical. Do not invent facts.",
        userPrompt: `Staff request: ${payload.message}\nActive case: ${
          activeWork ? JSON.stringify(activeWork) : "none"
        }\nRecent cases: ${JSON.stringify(workRows || [])}`,
      });
    }

    const assistantMessage = {
      conversation_id: conversationId,
      sender: "assistant",
      content: replyText,
      metadata: { department: department || null },
    };
    const { data: insertedReply, error: insertReplyError } = await supabaseAdmin
      .from("agent_messages")
      .insert(assistantMessage)
      .select("id, sender, content, created_at")
      .single();
    if (insertReplyError) throw new Error(insertReplyError.message);

    await supabaseAdmin
      .from("agent_conversations")
      .update({
        department: department || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    return json({
      conversationId,
      department: department || null,
      reply: {
        id: insertedReply.id,
        sender: insertedReply.sender,
        content: insertedReply.content,
        createdAt: insertedReply.created_at,
      },
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Agent request failed." }, 500);
  }
}

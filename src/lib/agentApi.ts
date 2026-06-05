import type {
  AgentChatMessage,
  AgentConversationRecord,
  AgentConversationScope,
  AgentDepartment,
  AgentDocumentRef,
  AgentInternalNote,
  AgentLeadPayload,
  AgentWorkItem,
  AgentWorkStatus,
} from "@/lib/agentTypes";

async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof data?.error === "string" ? data.error : "Agent request failed."
    );
  }
  return data as T;
}

export async function getAgentConfig(): Promise<{
  ok: boolean;
  provider: string | null;
  configured: boolean;
  error?: string;
}> {
  const response = await fetch("/api/agent/config");
  return parseJson(response);
}

export async function sendAgentMessage(payload: {
  scope: AgentConversationScope;
  message: string;
  conversationId?: string | null;
  messages?: AgentChatMessage[];
  department?: AgentDepartment | null;
  metadata?: Record<string, unknown>;
  activeWorkId?: string | null;
  actor?: { id?: string | null; name?: string | null; role?: string | null };
}): Promise<{
  conversationId: string;
  reply: AgentChatMessage;
  department: AgentDepartment | null;
}> {
  const response = await fetch("/api/agent/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson(response);
}

export async function uploadAgentDocument(payload: {
  conversationId?: string | null;
  workId?: string | null;
  file: File;
  kind: string;
  scope: AgentConversationScope;
}): Promise<AgentDocumentRef> {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("kind", payload.kind);
  formData.append("scope", payload.scope);
  if (payload.conversationId) formData.append("conversationId", payload.conversationId);
  if (payload.workId) formData.append("workId", payload.workId);

  const response = await fetch("/api/agent/upload", {
    method: "POST",
    body: formData,
  });
  return parseJson(response);
}

export async function saveAgentLead(payload: AgentLeadPayload): Promise<{
  ok: boolean;
  workId: string;
  conversationId: string;
}> {
  const response = await fetch("/api/agent/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson(response);
}

export async function getAgentWork(filters?: {
  department?: string;
  status?: string;
  priority?: string;
  date?: string;
}): Promise<{ items: AgentWorkItem[] }> {
  const params = new URLSearchParams();
  if (filters?.department) params.set("department", filters.department);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.priority) params.set("priority", filters.priority);
  if (filters?.date) params.set("date", filters.date);

  const response = await fetch(`/api/agent/work?${params.toString()}`);
  return parseJson(response);
}

export async function updateAgentWorkStatus(
  workId: string,
  status: AgentWorkStatus
): Promise<{ ok: boolean }> {
  const response = await fetch("/api/agent/status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workId, status }),
  });
  return parseJson(response);
}

export async function assignAgentWork(
  workId: string,
  workerId: string,
  workerName: string,
  actor?: { id?: string | null; name?: string | null }
): Promise<{ ok: boolean }> {
  const response = await fetch("/api/agent/assign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workId, workerId, workerName, actor }),
  });
  return parseJson(response);
}

export async function createAgentNote(payload: {
  workId: string;
  content: string;
  actor?: { id?: string | null; name?: string | null };
}): Promise<{ ok: boolean; note: AgentInternalNote }> {
  const response = await fetch("/api/agent/note", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson(response);
}

export async function getAgentConversation(
  conversationId: string
): Promise<AgentConversationRecord> {
  const response = await fetch(`/api/agent/work?conversationId=${conversationId}`);
  const data = await parseJson<{ conversation?: AgentConversationRecord }>(response);
  if (!data.conversation) throw new Error("Conversation not found.");
  return data.conversation;
}

export type AgentDepartment = "tech" | "consulting" | "travel";
export type AgentConversationScope = "public" | "internal";
export type AgentWorkStatus =
  | "new"
  | "in_progress"
  | "waiting_for_client"
  | "completed"
  | "cancelled";
export type AgentWorkPriority = "low" | "medium" | "high" | "urgent";
export type AgentSender = "user" | "assistant" | "system";

export interface AgentChatMessage {
  id: string;
  sender: AgentSender;
  content: string;
  createdAt: string;
  attachments?: AgentDocumentRef[];
}

export interface AgentDocumentRef {
  id?: string;
  name: string;
  url?: string;
  path?: string;
  mimeType?: string;
  kind?: string;
  sizeBytes?: number;
}

export interface AgentLeadPayload {
  conversationId?: string | null;
  department: AgentDepartment;
  fullName: string;
  email: string;
  phone: string;
  serviceType: string;
  message: string;
  country?: string;
  preferredContactMethod?: string;
  priority?: AgentWorkPriority;
  consultingDetails?: Record<string, string | string[] | null | undefined>;
  travelDetails?: Record<string, string | string[] | null | undefined>;
  techDetails?: Record<string, string | string[] | null | undefined>;
  uploadedDocuments?: AgentDocumentRef[];
}

export interface AgentWorkItem {
  id: string;
  conversationId: string | null;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  department: AgentDepartment;
  serviceType: string | null;
  status: AgentWorkStatus;
  priority: AgentWorkPriority;
  country: string | null;
  preferredContactMethod: string | null;
  summary: string | null;
  structuredData: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  assignedWorkerId: string | null;
  assignedWorkerName: string | null;
  uploadedFiles: AgentDocumentRef[];
  notes?: AgentInternalNote[];
}

export interface AgentInternalNote {
  id: string;
  workId: string;
  authorId: string | null;
  authorName: string | null;
  content: string;
  createdAt: string;
}

export interface AgentConversationRecord {
  id: string;
  scope: AgentConversationScope;
  department: AgentDepartment | null;
  status: string;
  summary: string | null;
  messages: AgentChatMessage[];
  createdAt: string;
  updatedAt: string;
}

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { getAgentConfig, getAgentWork, sendAgentMessage } from "@/lib/agentApi";
import type { AgentChatMessage, AgentWorkItem } from "@/lib/agentTypes";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const C = {
  bg: "#EEF0F7",
  surface: "#FFFFFF",
  surface2: "#F5F6FF",
  ink: "#16213E",
  ink2: "#2C3E62",
  muted: "#8892A4",
  hair: "rgba(0,0,0,0.07)",
  accent: "#6C5CE7",
  accentSoft: "#EDE9FE",
  danger: "#DC2626",
  dangerSoft: "#FEE2E2",
};
const SANS = "'Geist', ui-sans-serif, -apple-system, sans-serif";
const MONO = "'Geist Mono', ui-monospace, monospace";

const shortcuts = [
  "Show me new consulting leads",
  "Summarize this client",
  "Create a checklist for this residency case",
  "Draft a reply to this client",
  "What documents are missing?",
];

export default function AdminAgentChat() {
  const { admin } = useAdminAuth();
  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: "admin-welcome",
      sender: "assistant",
      content:
        "Kayrosco Agent is ready. Ask about recent leads, case summaries, missing documents, or response drafts.",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [draft, setDraft] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [configError, setConfigError] = useState("");
  const [workItems, setWorkItems] = useState<AgentWorkItem[]>([]);
  const [activeWorkId, setActiveWorkId] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getAgentConfig()
      .then((result) => {
        if (!result.configured) {
          setConfigError(
            result.error ||
              "No AI provider is configured. Set AI_PROVIDER and a valid provider API key."
          );
        }
      })
      .catch((err) => setConfigError(err instanceof Error ? err.message : "Agent is unavailable."));

    getAgentWork().then((result) => setWorkItems(result.items.slice(0, 12))).catch(() => {});
  }, []);

  useEffect(() => {
    if (!logRef.current) return;
    logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages]);

  const activeWork = useMemo(
    () => workItems.find((item) => item.id === activeWorkId) ?? null,
    [activeWorkId, workItems]
  );

  const handleSend = async (text: string) => {
    if (!text.trim() || busy || configError) return;
    const nextUserMessage: AgentChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((current) => [...current, nextUserMessage]);
    setDraft("");
    setBusy(true);
    try {
      const result = await sendAgentMessage({
        scope: "internal",
        message: text,
        conversationId,
        messages: [...messages, nextUserMessage],
        activeWorkId,
        actor: {
          id: admin?.id,
          name: admin?.username,
          role: admin?.role,
        },
      });
      setConversationId(result.conversationId);
      setMessages((current) => [...current, result.reply]);
    } catch (err) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          sender: "assistant",
          content: err instanceof Error ? err.message : "Agent request failed.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(260px, 300px)", gap: 16 }}>
      <section
        style={{
          background: C.surface,
          borderRadius: 16,
          border: `1px solid ${C.hair}`,
          display: "flex",
          flexDirection: "column",
          minHeight: "calc(100vh - 180px)",
          overflow: "hidden",
        }}
      >
        <header
          style={{
            padding: "18px 20px",
            borderBottom: `1px solid ${C.hair}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: C.accentSoft,
                color: C.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Bot size={18} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, color: C.ink, fontFamily: SANS }}>Agent Chat</h1>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>
                Fast staff assistant
              </p>
            </div>
          </div>
          {activeWork && (
            <div
              style={{
                borderRadius: 999,
                background: C.surface2,
                border: `1px solid ${C.hair}`,
                padding: "8px 12px",
                fontSize: 12,
                color: C.ink2,
              }}
            >
              Context: {activeWork.clientName}
            </div>
          )}
        </header>

        {configError && (
          <div
            style={{
              margin: 16,
              padding: "12px 14px",
              borderRadius: 12,
              background: C.dangerSoft,
              border: "1px solid #fecaca",
              color: C.danger,
              fontSize: 13,
            }}
          >
            {configError}
          </div>
        )}

        <div
          ref={logRef}
          style={{
            flex: 1,
            overflowY: "auto",
            minHeight: 0,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            background: "linear-gradient(180deg, #F9FAFF 0%, #F3F5FC 100%)",
          }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                maxWidth: "82%",
                alignSelf: message.sender === "user" ? "flex-end" : "flex-start",
                background: message.sender === "user" ? C.ink : C.surface,
                color: message.sender === "user" ? "#F8FAFC" : C.ink2,
                borderRadius: 16,
                padding: "12px 14px",
                border: message.sender === "user" ? "none" : `1px solid ${C.hair}`,
                boxShadow: message.sender === "user" ? "none" : "0 6px 18px rgba(18, 24, 40, 0.05)",
                whiteSpace: "pre-wrap",
                lineHeight: 1.6,
                fontSize: 13,
              }}
            >
              {message.content}
            </div>
          ))}
        </div>

        <div style={{ padding: 16, borderTop: `1px solid ${C.hair}` }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "nowrap", overflowX: "auto", paddingBottom: 2 }}>
            {shortcuts.map((shortcut) => (
              <button
                key={shortcut}
                type="button"
                onClick={() => void handleSend(shortcut)}
                style={{
                  borderRadius: 999,
                  border: `1px solid ${C.hair}`,
                  background: C.surface2,
                  color: C.ink2,
                  cursor: "pointer",
                  fontSize: 12,
                  padding: "7px 11px",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {shortcut}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask the agent to summarize, draft, or review a case..."
              style={{
                flex: 1,
                minHeight: 86,
                borderRadius: 14,
                border: `1px solid ${C.hair}`,
                background: C.surface2,
                color: C.ink2,
                padding: "12px 14px",
                resize: "vertical",
                outline: "none",
                fontFamily: SANS,
                fontSize: 13,
              }}
            />
            <button
              type="button"
              disabled={busy || !!configError}
              onClick={() => void handleSend(draft)}
              style={{
                alignSelf: "flex-end",
                width: 54,
                height: 54,
                borderRadius: 14,
                border: "none",
                background: C.accent,
                color: "#fff",
                cursor: "pointer",
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </section>

      <aside style={{ display: "grid", gap: 12, alignContent: "start", maxHeight: "calc(100vh - 180px)", overflowY: "auto" }}>
        <section
          style={{
            background: C.surface,
            borderRadius: 16,
            border: `1px solid ${C.hair}`,
            padding: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Sparkles size={16} color={C.accent} />
            <h2 style={{ margin: 0, fontSize: 16, color: C.ink }}>Recent Agent Work</h2>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {workItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveWorkId(item.id)}
                style={{
                  textAlign: "left",
                  borderRadius: 12,
                  border:
                    item.id === activeWorkId ? `1px solid ${C.accent}` : `1px solid ${C.hair}`,
                  background: item.id === activeWorkId ? C.accentSoft : C.surface2,
                  padding: 12,
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{item.clientName}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                  {item.department} • {item.status.replaceAll("_", " ")}
                </div>
                <div style={{ fontSize: 12, color: C.ink2, marginTop: 6 }}>
                  {item.serviceType || "General request"}
                </div>
              </button>
            ))}
          </div>
        </section>

        {activeWork && (
          <section
            style={{
              background: C.surface,
              borderRadius: 16,
              border: `1px solid ${C.hair}`,
              padding: 18,
            }}
          >
            <div style={{ fontSize: 11, color: C.muted, fontFamily: MONO, textTransform: "uppercase" }}>
              Active case
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.ink, marginTop: 6 }}>
              {activeWork.clientName}
            </div>
            <div style={{ fontSize: 13, color: C.ink2, marginTop: 8, lineHeight: 1.6 }}>
              {activeWork.summary || "No summary saved yet."}
            </div>
          </section>
        )}
      </aside>
    </div>
  );
}

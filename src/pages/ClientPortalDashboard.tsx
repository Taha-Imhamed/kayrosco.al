import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import type { Client } from "@/lib/adminApi";
import { getClients } from "@/lib/adminApi";
import {
  addClientPortalMessage,
  getClientPortalMessages,
  getClientPortalSession,
  logoutClientPortal,
} from "@/lib/clientPortalStore";
import { getLocalRequests, type LocalRequest } from "@/lib/localStore";

const C = {
  bg: "#F5F6FB",
  surface: "#FFFFFF",
  surface2: "#F8F8FE",
  ink: "#16213E",
  ink2: "#334155",
  muted: "#7C879A",
  border: "rgba(0,0,0,0.08)",
  accent: "#6C5CE7",
  accentTint: "#EDE9FE",
  positive: "#10B981",
  positiveTint: "#D1FAE5",
  warning: "#F59E0B",
  warningTint: "#FEF3C7",
  danger: "#EF4444",
  dangerTint: "#FEE2E2",
  info: "#3B82F6",
  infoTint: "#DBEAFE",
};

const SANS = "'Geist', ui-sans-serif, -apple-system, sans-serif";
const MONO = "'Geist Mono', ui-monospace, monospace";

const STATUS_CFG: Record<string, { fg: string; bg: string; label: string }> = {
  new:           { fg: C.warning, bg: C.warningTint, label: "Received" },
  in_review:     { fg: C.info, bg: C.infoTint, label: "In Review" },
  awaiting_docs: { fg: C.danger, bg: C.dangerTint, label: "Awaiting Documents" },
  in_progress:   { fg: C.accent, bg: C.accentTint, label: "In Progress" },
  completed:     { fg: C.positive, bg: C.positiveTint, label: "Completed" },
};

function isImage(url: string) {
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(url);
}

export default function ClientPortalDashboard() {
  const session = getClientPortalSession();
  const [client, setClient] = useState<Client | null>(null);
  const [requests, setRequests] = useState<LocalRequest[]>([]);
  const [messages, setMessages] = useState<ReturnType<typeof getClientPortalMessages>>([]);
  const [reply, setReply] = useState("");

  useEffect(() => {
    if (!session) return;

    const load = async () => {
      const allClients = await getClients();
      const currentClient = allClients.find((entry) => entry.id === session.client_id) ?? null;
      setClient(currentClient);
      if (!currentClient) return;

      const matchedRequests = getLocalRequests().filter((request) =>
        request.email === currentClient.contact_email ||
        request.full_name === currentClient.name,
      );
      setRequests(matchedRequests);
      setMessages(getClientPortalMessages(currentClient.id));
    };

    load().catch(() => {});

    const refresh = () => {
      load().catch(() => {});
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [session]);

  const sharedDocs = useMemo(() => {
    if (!client) return [];
    const docs = [];
    if (client.passport_url) docs.push({ name: client.passport_name ?? "Passport", url: client.passport_url });
    if (client.id_doc_url) docs.push({ name: client.id_doc_name ?? "ID Document", url: client.id_doc_url });
    for (const doc of client.extra_docs) docs.push({ name: doc.name, url: doc.url });
    return docs;
  }, [client]);

  if (!session) return <Navigate to="/client/login" replace />;
  if (!client) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, color: C.ink, fontFamily: SANS }}>
        Loading your dashboard...
      </div>
    );
  }

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    addClientPortalMessage({
      clientId: client.id,
      senderType: "client",
      senderName: client.name,
      body: reply,
    });
    setMessages(getClientPortalMessages(client.id));
    setReply("");
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: SANS, color: C.ink }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "26px 20px 48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <div>
            <p style={{ margin: "0 0 8px", fontFamily: MONO, fontSize: 11, color: C.accent, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Kayrosco Client Dashboard
            </p>
            <h1 style={{ margin: "0 0 6px", fontSize: 30, fontWeight: 800 }}>{client.name}</h1>
            <p style={{ margin: 0, color: C.muted, fontSize: 14 }}>
              Track applications, read updates from our team, and view shared files.
            </p>
          </div>
          <button
            onClick={() => {
              logoutClientPortal();
              window.location.href = "/client/login";
            }}
            style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.ink2, fontSize: 13, fontWeight: 700, fontFamily: SANS, cursor: "pointer" }}
          >
            Sign Out
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14, marginBottom: 18 }}>
          {[
            { label: "Applications", value: String(requests.length) },
            { label: "Unread Updates", value: String(messages.filter((m) => m.sender_type === "admin").length) },
            { label: "Shared Files", value: String(sharedDocs.length) },
          ].map((card) => (
            <div key={card.label} style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: "16px 18px" }}>
              <p style={{ margin: "0 0 6px", fontSize: 10, fontFamily: MONO, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{card.label}</p>
              <p style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>{card.value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 18, alignItems: "start" }}>
          <div style={{ display: "grid", gap: 18 }}>
            <section style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 20 }}>
              <h2 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 800 }}>Your Applications</h2>
              {requests.length === 0 ? (
                <p style={{ margin: 0, color: C.muted, fontSize: 14 }}>No applications linked yet.</p>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {requests.map((request) => {
                    const cfg = STATUS_CFG[request.status] ?? STATUS_CFG.new;
                    return (
                      <div key={request.id} style={{ border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, background: C.surface2 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                          <div>
                            <p style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>{request.service_type}</p>
                            <p style={{ margin: 0, color: C.muted, fontSize: 12, fontFamily: MONO }}>{request.tracking_id}</p>
                          </div>
                          <span style={{ padding: "5px 10px", borderRadius: 999, background: cfg.bg, color: cfg.fg, fontSize: 11, fontWeight: 800, fontFamily: MONO, textTransform: "uppercase" }}>
                            {cfg.label}
                          </span>
                        </div>
                        {request.report && (
                          <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, background: C.accentTint, color: C.ink2, fontSize: 13, lineHeight: 1.6 }}>
                            {request.report}
                          </div>
                        )}
                        <p style={{ margin: "12px 0 0", color: C.muted, fontSize: 12 }}>
                          Submitted: {new Date(request.created_at).toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 20 }}>
              <h2 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 800 }}>Messages</h2>
              <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
                {messages.length === 0 ? (
                  <p style={{ margin: 0, color: C.muted, fontSize: 14 }}>No messages yet.</p>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} style={{ padding: "12px 14px", borderRadius: 14, background: message.sender_type === "admin" ? C.accentTint : C.surface2, border: `1px solid ${C.border}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
                        <strong style={{ fontSize: 13 }}>{message.sender_name}</strong>
                        <span style={{ fontSize: 11, color: C.muted, fontFamily: MONO }}>{new Date(message.created_at).toLocaleString()}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: C.ink2, lineHeight: 1.6 }}>{message.body}</p>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleReply}>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write a message to the Kayrosco team..."
                  style={{ width: "100%", minHeight: 100, padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface2, fontFamily: SANS, fontSize: 13, color: C.ink, resize: "vertical", boxSizing: "border-box" }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                  <button type="submit" style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: C.accent, color: "#fff", fontSize: 13, fontWeight: 800, fontFamily: SANS, cursor: "pointer" }}>
                    Send Message
                  </button>
                </div>
              </form>
            </section>
          </div>

          <div style={{ display: "grid", gap: 18 }}>
            <section style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 20 }}>
              <h2 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 800 }}>Profile</h2>
              <div style={{ display: "grid", gap: 10 }}>
                {[
                  ["Email", client.contact_email ?? "—"],
                  ["Phone", client.contact_phone ?? "—"],
                  ["Department", client.department ?? "—"],
                  ["Country", client.country ?? "—"],
                  ["City", client.city ?? "—"],
                  ["Address", client.address ?? "—"],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <p style={{ margin: "0 0 4px", fontSize: 10, fontFamily: MONO, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
                    <p style={{ margin: 0, fontSize: 13, color: C.ink2 }}>{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 20 }}>
              <h2 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 800 }}>Shared Files</h2>
              {sharedDocs.length === 0 ? (
                <p style={{ margin: 0, color: C.muted, fontSize: 14 }}>No files shared yet.</p>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {sharedDocs.map((doc) => (
                    <div key={`${doc.name}-${doc.url}`} style={{ border: `1px solid ${C.border}`, borderRadius: 14, padding: 12, background: C.surface2 }}>
                      {isImage(doc.url) ? (
                        <img src={doc.url} alt={doc.name} style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 12, marginBottom: 10 }} />
                      ) : null}
                      <a href={doc.url} target="_blank" rel="noreferrer" style={{ color: C.accent, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                        {doc.name}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

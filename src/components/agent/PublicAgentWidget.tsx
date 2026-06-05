import { useEffect, useMemo, useRef, useState } from "react";
import { MessageSquare, Send, X, Upload, Bot } from "lucide-react";
import { useLocation } from "react-router-dom";
import { saveAgentLead, sendAgentMessage, uploadAgentDocument } from "@/lib/agentApi";
import type {
  AgentChatMessage,
  AgentDepartment,
  AgentDocumentRef,
  AgentLeadPayload,
  AgentWorkPriority,
} from "@/lib/agentTypes";

const departments: { value: AgentDepartment; label: string }[] = [
  { value: "travel", label: "Travel" },
  { value: "consulting", label: "Consulting" },
  { value: "tech", label: "Tech" },
];

const initialAssistantMessage: AgentChatMessage = {
  id: "welcome",
  sender: "assistant",
  content:
    "Welcome to Kayrosco Group. I can help with Travel, Consulting, or Tech services. Tell me what you need, and I’ll collect the details for our team.",
  createdAt: new Date().toISOString(),
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(8,12,18,0.92)",
  color: "#F8FAFC",
  fontSize: 13,
  padding: "10px 12px",
  outline: "none",
};

export default function PublicAgentWidget() {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AgentChatMessage[]>([initialAssistantMessage]);
  const [draft, setDraft] = useState("");
  const [department, setDepartment] = useState<AgentDepartment | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeView, setActiveView] = useState<"chat" | "request">("chat");
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [documents, setDocuments] = useState<AgentDocumentRef[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    serviceType: "",
    message: "",
    country: "",
    preferredContactMethod: "email",
    priority: "medium" as AgentWorkPriority,
    consultingService: "",
    currentStatus: "",
    requiredDocuments: "",
    urgency: "",
    destination: "",
    arrivalDate: "",
    departureDate: "",
    numberOfPeople: "",
    stayPreference: "",
    airportTransfer: "no",
    guideNeeded: "no",
    budget: "",
    projectType: "",
    deliveryDeadline: "",
    projectBudget: "",
    projectDescription: "",
  });
  const logRef = useRef<HTMLDivElement | null>(null);

  const enabled = useMemo(
    () => ["/", "/travel", "/consulting", "/tech"].includes(pathname),
    [pathname]
  );

  useEffect(() => {
    if (!logRef.current) return;
    logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overscrollBehavior = "contain";
    return () => {
      document.body.style.overscrollBehavior = "";
    };
  }, [isOpen]);

  if (!enabled) return null;

  const sendMessage = async (content: string, chosenDepartment?: AgentDepartment | null) => {
    if (!content.trim()) return;
    setError("");
    setSuccess("");
    const userMessage: AgentChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setIsBusy(true);

    try {
      const result = await sendAgentMessage({
        scope: "public",
        message: content,
        conversationId,
        messages: [...messages, userMessage],
        department: chosenDepartment ?? department,
        metadata: { pathname },
      });
      setConversationId(result.conversationId);
      if (result.department) setDepartment(result.department);
      setActiveView("request");
      setMessages((current) => [...current, result.reply]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to contact the agent.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleDocumentSelection = async (selectedFiles: FileList | null) => {
    if (!selectedFiles?.length) return;
    setFiles(Array.from(selectedFiles));
    if (!conversationId) return;
    setIsBusy(true);
    setError("");
    try {
      const uploaded = await Promise.all(
        Array.from(selectedFiles).map((file) =>
          uploadAgentDocument({
            file,
            conversationId,
            kind: "public-supporting-document",
            scope: "public",
          })
        )
      );
      setDocuments(uploaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Document upload failed.");
    } finally {
      setIsBusy(false);
    }
  };

  const submitLead = async () => {
    setError("");
    setSuccess("");
    if (!department) {
      setError("Choose Travel, Consulting, or Tech first.");
      return;
    }
    if (!form.fullName || !form.email || !form.phone || !form.serviceType || !form.message) {
      setError("Complete the contact fields before submitting.");
      return;
    }

    setIsBusy(true);
    try {
      let uploadedDocs = documents;
      if (files.length && !documents.length) {
        uploadedDocs = await Promise.all(
          files.map((file) =>
            uploadAgentDocument({
              file,
              conversationId,
              kind: "public-supporting-document",
              scope: "public",
            })
          )
        );
        setDocuments(uploadedDocs);
      }

      const payload: AgentLeadPayload = {
        conversationId,
        department,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        serviceType: form.serviceType,
        message: form.message,
        country: form.country || undefined,
        preferredContactMethod: form.preferredContactMethod,
        priority: form.priority,
        uploadedDocuments: uploadedDocs,
        consultingDetails:
          department === "consulting"
            ? {
                serviceNeeded: form.consultingService,
                currentStatus: form.currentStatus,
                requiredDocuments: form.requiredDocuments,
                urgency: form.urgency,
              }
            : undefined,
        travelDetails:
          department === "travel"
            ? {
                destination: form.destination,
                arrivalDate: form.arrivalDate,
                departureDate: form.departureDate,
                numberOfPeople: form.numberOfPeople,
                stayPreference: form.stayPreference,
                airportTransfer: form.airportTransfer,
                guideNeeded: form.guideNeeded,
                budget: form.budget,
              }
            : undefined,
        techDetails:
          department === "tech"
            ? {
                projectType: form.projectType,
                deadline: form.deliveryDeadline,
                budget: form.projectBudget,
                description: form.projectDescription,
              }
            : undefined,
      };

      const result = await saveAgentLead(payload);
      setConversationId(result.conversationId);
      setSuccess("Your request has been sent to Kayrosco Group. The team will review it and follow up.");
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          sender: "assistant",
          content:
            "Thanks. I’ve created your case and shared it with the team. For legal or residency matters, our specialists will review the case before advising next steps.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save your request.");
    } finally {
      setIsBusy(false);
    }
  };

  const renderDepartmentFields = () => {
    if (department === "consulting") {
      return (
        <>
          <input
            style={inputStyle}
            placeholder="Service needed: residency, visa, company formation..."
            value={form.consultingService}
            onChange={(e) => setForm((current) => ({ ...current, consultingService: e.target.value }))}
          />
          <input
            style={inputStyle}
            placeholder="Current status"
            value={form.currentStatus}
            onChange={(e) => setForm((current) => ({ ...current, currentStatus: e.target.value }))}
          />
          <input
            style={inputStyle}
            placeholder="Required documents"
            value={form.requiredDocuments}
            onChange={(e) => setForm((current) => ({ ...current, requiredDocuments: e.target.value }))}
          />
          <input
            style={inputStyle}
            placeholder="Deadline or urgency"
            value={form.urgency}
            onChange={(e) => setForm((current) => ({ ...current, urgency: e.target.value }))}
          />
        </>
      );
    }

    if (department === "travel") {
      return (
        <>
          <input
            style={inputStyle}
            placeholder="Destination"
            value={form.destination}
            onChange={(e) => setForm((current) => ({ ...current, destination: e.target.value }))}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <input
              style={inputStyle}
              type="date"
              value={form.arrivalDate}
              onChange={(e) => setForm((current) => ({ ...current, arrivalDate: e.target.value }))}
            />
            <input
              style={inputStyle}
              type="date"
              value={form.departureDate}
              onChange={(e) => setForm((current) => ({ ...current, departureDate: e.target.value }))}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <input
              style={inputStyle}
              placeholder="Number of people"
              value={form.numberOfPeople}
              onChange={(e) => setForm((current) => ({ ...current, numberOfPeople: e.target.value }))}
            />
            <input
              style={inputStyle}
              placeholder="Hotel / apartment / villa"
              value={form.stayPreference}
              onChange={(e) => setForm((current) => ({ ...current, stayPreference: e.target.value }))}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <select
              style={inputStyle}
              value={form.airportTransfer}
              onChange={(e) => setForm((current) => ({ ...current, airportTransfer: e.target.value }))}
            >
              <option value="no">Airport transfer not needed</option>
              <option value="yes">Airport transfer needed</option>
            </select>
            <select
              style={inputStyle}
              value={form.guideNeeded}
              onChange={(e) => setForm((current) => ({ ...current, guideNeeded: e.target.value }))}
            >
              <option value="no">Driver or guide not needed</option>
              <option value="yes">Driver or guide needed</option>
            </select>
          </div>
          <input
            style={inputStyle}
            placeholder="Budget"
            value={form.budget}
            onChange={(e) => setForm((current) => ({ ...current, budget: e.target.value }))}
          />
        </>
      );
    }

    if (department === "tech") {
      return (
        <>
          <input
            style={inputStyle}
            placeholder="Project type: website, app, software, e-commerce..."
            value={form.projectType}
            onChange={(e) => setForm((current) => ({ ...current, projectType: e.target.value }))}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <input
              style={inputStyle}
              placeholder="Budget"
              value={form.projectBudget}
              onChange={(e) => setForm((current) => ({ ...current, projectBudget: e.target.value }))}
            />
            <input
              style={inputStyle}
              placeholder="Deadline"
              value={form.deliveryDeadline}
              onChange={(e) => setForm((current) => ({ ...current, deliveryDeadline: e.target.value }))}
            />
          </div>
          <textarea
            style={{ ...inputStyle, minHeight: 88, resize: "vertical" }}
            placeholder="Project description"
            value={form.projectDescription}
            onChange={(e) => setForm((current) => ({ ...current, projectDescription: e.target.value }))}
          />
        </>
      );
    }

    return null;
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          width: 60,
          height: 60,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.1)",
          background: "linear-gradient(180deg, #668dbc 0%, #496c97 100%)",
          color: "#F8FAFC",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 18px 50px rgba(0,0,0,0.38)",
          zIndex: 1200,
          cursor: "pointer",
        }}
        aria-label="Open Kayrosco agent"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            right: 20,
            bottom: 92,
            width: "min(380px, calc(100vw - 20px))",
            height: "min(720px, calc(100vh - 112px))",
            display: "flex",
            flexDirection: "column",
            borderRadius: 20,
            overflow: "hidden",
            background: "rgba(8,12,18,0.98)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
            zIndex: 1200,
          }}
        >
          <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "rgba(102,141,188,0.16)",
                  color: "#9BC0EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bot size={18} />
              </div>
              <div>
                <div style={{ color: "#F8FAFC", fontWeight: 700, fontSize: 14 }}>Kayrosco Agent</div>
                <div style={{ color: "rgba(255,255,255,0.62)", fontSize: 12 }}>
                  Fast intake for Travel, Consulting, and Tech
                </div>
              </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)",
                  color: "#F8FAFC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
              <button
                type="button"
                onClick={() => setActiveView("chat")}
                style={tabStyle(activeView === "chat")}
              >
                Chat
              </button>
              <button
                type="button"
                onClick={() => setActiveView("request")}
                style={tabStyle(activeView === "request")}
              >
                Request
              </button>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
            {activeView === "chat" ? (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
                <div style={{ padding: "12px 14px 10px", display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {departments.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        setDepartment(item.value);
                        if (!conversationId) {
                          void sendMessage(`I need help with ${item.label} services.`, item.value);
                        }
                      }}
                      style={{
                        borderRadius: 999,
                        padding: "7px 12px",
                        border:
                          department === item.value
                            ? "1px solid rgba(102,141,188,0.8)"
                            : "1px solid rgba(255,255,255,0.08)",
                        background:
                          department === item.value
                            ? "rgba(102,141,188,0.16)"
                            : "rgba(255,255,255,0.03)",
                        color: "#F8FAFC",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div
                  ref={logRef}
                  style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    overscrollBehavior: "contain",
                    padding: "0 14px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      style={{
                        alignSelf: message.sender === "user" ? "flex-end" : "flex-start",
                        maxWidth: "88%",
                        padding: "10px 12px",
                        borderRadius: 14,
                        background:
                          message.sender === "user"
                            ? "linear-gradient(180deg, #668dbc 0%, #4F7097 100%)"
                            : "rgba(255,255,255,0.06)",
                        color: "#F8FAFC",
                        fontSize: 13,
                        lineHeight: 1.5,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {message.content}
                    </div>
                  ))}
                </div>

                <div style={{ padding: 14, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void sendMessage(draft);
                        }
                      }}
                      style={{ ...inputStyle, marginBottom: 0 }}
                      placeholder="Tell us what you need"
                    />
                    <button
                      type="button"
                      onClick={() => void sendMessage(draft)}
                      disabled={isBusy}
                      style={sendButtonStyle}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  height: "100%",
                  overflowY: "auto",
                  overscrollBehavior: "contain",
                  padding: 14,
                  display: "grid",
                  gap: 10,
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {departments.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setDepartment(item.value)}
                      style={{
                        ...tabStyle(department === item.value),
                        padding: "10px 8px",
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <input
                    style={inputStyle}
                    placeholder="Full name"
                    value={form.fullName}
                    onChange={(e) => setForm((current) => ({ ...current, fullName: e.target.value }))}
                  />
                  <input
                    style={inputStyle}
                    placeholder="Phone"
                    value={form.phone}
                    onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))}
                  />
                </div>

                <input
                  style={inputStyle}
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <input
                    style={inputStyle}
                    placeholder="Service type"
                    value={form.serviceType}
                    onChange={(e) => setForm((current) => ({ ...current, serviceType: e.target.value }))}
                  />
                  <select
                    style={inputStyle}
                    value={form.preferredContactMethod}
                    onChange={(e) =>
                      setForm((current) => ({ ...current, preferredContactMethod: e.target.value }))
                    }
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>

                <textarea
                  style={{ ...inputStyle, minHeight: 96, resize: "vertical" }}
                  placeholder="Message or request"
                  value={form.message}
                  onChange={(e) => setForm((current) => ({ ...current, message: e.target.value }))}
                />

                <button
                  type="button"
                  onClick={() => setShowMoreDetails((current) => !current)}
                  style={{
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.04)",
                    color: "#D9ECFF",
                    padding: "10px 12px",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: 12,
                  }}
                >
                  {showMoreDetails ? "Hide extra details" : "Add extra details"}
                </button>

                {showMoreDetails && (
                  <div style={{ display: "grid", gap: 8 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <input
                        style={inputStyle}
                        placeholder="Country / nationality"
                        value={form.country}
                        onChange={(e) => setForm((current) => ({ ...current, country: e.target.value }))}
                      />
                      <select
                        style={inputStyle}
                        value={form.priority}
                        onChange={(e) =>
                          setForm((current) => ({
                            ...current,
                            priority: e.target.value as AgentWorkPriority,
                          }))
                        }
                      >
                        <option value="low">Low priority</option>
                        <option value="medium">Medium priority</option>
                        <option value="high">High priority</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    {renderDepartmentFields()}
                  </div>
                )}

                <label
                  style={{
                    borderRadius: 10,
                    border: "1px dashed rgba(255,255,255,0.16)",
                    padding: "10px 12px",
                    color: "rgba(255,255,255,0.72)",
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                  }}
                >
                  <Upload size={15} />
                  {documents.length ? `${documents.length} file(s) uploaded` : "Upload documents"}
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    style={{ display: "none" }}
                    onChange={(e) => void handleDocumentSelection(e.target.files)}
                  />
                </label>

                {error && <div style={{ color: "#FCA5A5", fontSize: 12 }}>{error}</div>}
                {success && <div style={{ color: "#86EFAC", fontSize: 12 }}>{success}</div>}

                <button
                  type="button"
                  onClick={() => void submitLead()}
                  disabled={isBusy}
                  style={{
                    borderRadius: 10,
                    border: "none",
                    background: "linear-gradient(180deg, #668dbc 0%, #496c97 100%)",
                    color: "#F8FAFC",
                    fontWeight: 700,
                    padding: "11px 14px",
                    cursor: "pointer",
                  }}
                >
                  {isBusy ? "Working..." : "Send Request"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function tabStyle(active: boolean): React.CSSProperties {
  return {
    borderRadius: 10,
    border: active ? "1px solid rgba(102,141,188,0.7)" : "1px solid rgba(255,255,255,0.08)",
    background: active ? "rgba(102,141,188,0.18)" : "rgba(255,255,255,0.04)",
    color: "#F8FAFC",
    minHeight: 38,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  };
}

const sendButtonStyle: React.CSSProperties = {
  width: 42,
  borderRadius: 10,
  border: "1px solid rgba(102,141,188,0.5)",
  background: "rgba(102,141,188,0.18)",
  color: "#D9ECFF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

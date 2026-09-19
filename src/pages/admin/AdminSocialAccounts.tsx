import { useCallback, useEffect, useState } from "react";
import {
  SocialAccount,
  createSocialAccount,
  deleteSocialAccount,
  getSocialAccounts,
} from "@/lib/adminApi";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const C = {
  bg: "#0B0818", surface: "#161029", surface2: "#1F1840", border: "rgba(255,255,255,0.10)",
  text: "#F4F2FF", muted: "#8A84A8", accent: "#8B7CFF", accentSoft: "rgba(139,124,255,0.10)",
  danger: "#FB7185", dangerSoft: "rgba(251,113,133,0.10)", success: "#34D399",
};
const FONT = "'Geist', ui-sans-serif, -apple-system, sans-serif";
const MONO = "'Geist Mono', ui-monospace, monospace";
const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 9,
  border: `1px solid ${C.border}`, background: C.surface2, color: C.text, fontFamily: FONT,
  fontSize: 13, outline: "none",
};

export default function AdminSocialAccounts() {
  const { admin } = useAdminAuth();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({ name: "", username: "", password: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try { setAccounts(await getSocialAccounts()); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load social accounts."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.username.trim() || !form.password || saving) return;
    setSaving(true); setError("");
    try {
      await createSocialAccount({
        name: form.name.trim(), username: form.username.trim(), password: form.password,
        createdBy: admin?.id ?? null, createdByUsername: admin?.username ?? "admin",
      });
      setForm({ name: "", username: "", password: "" });
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save account."); }
    finally { setSaving(false); }
  };

  const copy = async (value: string, key: string) => {
    try { await navigator.clipboard.writeText(value); setCopied(key); window.setTimeout(() => setCopied(""), 1400); }
    catch { setError("Copy failed. Your browser did not allow clipboard access."); }
  };

  const remove = async (account: SocialAccount) => {
    if (!window.confirm(`Delete ${account.name}?`)) return;
    try { await deleteSocialAccount(account.id); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not delete account."); }
  };

  return (
    <div style={{ fontFamily: FONT, color: C.text }}>
      <div style={{ marginBottom: 26 }}>
        <div style={{ color: C.accent, fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 8 }}>Shared credentials</div>
        <h1 style={{ margin: 0, fontSize: 30, letterSpacing: "-0.03em", fontWeight: 650 }}>Social Accounts</h1>
        <p style={{ margin: "8px 0 0", color: C.muted, fontSize: 14 }}>Shared account usernames and passwords for the team.</p>
      </div>

      {error && <div style={{ marginBottom: 16, padding: "11px 14px", borderRadius: 9, border: `1px solid ${C.danger}`, background: C.dangerSoft, color: C.danger, fontSize: 13 }}>{error}</div>}

      <div className="social-accounts-grid" style={{ display: "grid", gridTemplateColumns: "minmax(280px, 360px) minmax(0, 1fr)", gap: 18, alignItems: "start" }}>
        <form onSubmit={addAccount} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 650 }}>Add account</h2>
          <label style={{ display: "block", color: C.muted, fontSize: 11, marginBottom: 6 }}>ACCOUNT NAME</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Gmail" style={{ ...inputStyle, marginBottom: 12 }} required />
          <label style={{ display: "block", color: C.muted, fontSize: 11, marginBottom: 6 }}>USERNAME OR EMAIL</label>
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="team@example.com" style={{ ...inputStyle, marginBottom: 12 }} required />
          <label style={{ display: "block", color: C.muted, fontSize: 11, marginBottom: 6 }}>PASSWORD</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Account password" style={{ ...inputStyle, marginBottom: 18 }} required />
          <button disabled={saving || !form.name.trim() || !form.username.trim() || !form.password} style={{ width: "100%", border: 0, borderRadius: 9, padding: "10px 14px", background: C.accent, color: "#fff", fontFamily: FONT, fontWeight: 650, cursor: "pointer", opacity: saving ? .55 : 1 }}>{saving ? "Saving..." : "Save account"}</button>
        </form>

        <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div><h2 style={{ margin: 0, fontSize: 16, fontWeight: 650 }}>Accounts</h2><span style={{ color: C.muted, fontSize: 12 }}>{accounts.length} shared account{accounts.length === 1 ? "" : "s"}</span></div>
          </div>
          {loading ? <p style={{ color: C.muted, fontSize: 13 }}>Loading accounts...</p> : accounts.length === 0 ? <div style={{ padding: "42px 16px", textAlign: "center", color: C.muted, fontSize: 13 }}>No social accounts saved yet.</div> : <div>{accounts.map((account) => { const visible = visiblePasswords[account.id]; return <div key={account.id} style={{ borderTop: `1px solid ${C.border}`, padding: "16px 0" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 12 }}><strong style={{ fontSize: 15 }}>{account.name}</strong><button onClick={() => remove(account)} title="Delete account" style={{ border: 0, background: "transparent", color: C.muted, cursor: "pointer", fontSize: 18 }}>×</button></div><div style={{ display: "grid", gap: 8 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: C.muted, fontSize: 11, width: 72 }}>Username</span><code style={{ color: C.text, fontFamily: MONO, fontSize: 12, flex: 1, overflowWrap: "anywhere" }}>{account.username}</code><button onClick={() => copy(account.username, `${account.id}-username`)} style={{ border: `1px solid ${C.border}`, background: C.surface2, color: copied === `${account.id}-username` ? C.success : C.muted, borderRadius: 6, padding: "5px 8px", cursor: "pointer", fontSize: 11 }}>{copied === `${account.id}-username` ? "Copied" : "Copy"}</button></div><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: C.muted, fontSize: 11, width: 72 }}>Password</span><code style={{ color: C.text, fontFamily: MONO, fontSize: 12, flex: 1, overflowWrap: "anywhere" }}>{visible ? account.password : "••••••••"}</code><button onClick={() => setVisiblePasswords({ ...visiblePasswords, [account.id]: !visible })} style={{ border: `1px solid ${C.border}`, background: C.surface2, color: C.muted, borderRadius: 6, padding: "5px 8px", cursor: "pointer", fontSize: 11 }}>{visible ? "Hide" : "Show"}</button><button onClick={() => copy(account.password, `${account.id}-password`)} style={{ border: `1px solid ${C.border}`, background: C.surface2, color: copied === `${account.id}-password` ? C.success : C.muted, borderRadius: 6, padding: "5px 8px", cursor: "pointer", fontSize: 11 }}>{copied === `${account.id}-password` ? "Copied" : "Copy"}</button></div></div></div>; })}</div>}
        </section>
      </div>
      <style>{`@media (max-width: 760px) { .social-accounts-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
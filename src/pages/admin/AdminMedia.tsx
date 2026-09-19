import { useCallback, useEffect, useRef, useState } from "react";
import {
  AdminMediaAsset,
  deleteAdminMedia,
  getAdminMedia,
  uploadAdminMedia,
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

function formatSize(bytes: number | null) {
  if (!bytes) return "Unknown size";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(asset: AdminMediaAsset) {
  return asset.mime_type?.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(asset.file_name);
}

export default function AdminMedia() {
  const { admin } = useAdminAuth();
  const [assets, setAssets] = useState<AdminMediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setAssets(await getAdminMedia()); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load media."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const upload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile || !name.trim() || uploading) return;
    setUploading(true); setError("");
    try {
      await uploadAdminMedia({ file: selectedFile, name: name.trim(), uploadedBy: admin?.id ?? null, uploadedByUsername: admin?.username ?? "admin" });
      setName(""); setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Upload failed."); }
    finally { setUploading(false); }
  };

  const remove = async (asset: AdminMediaAsset) => {
    if (!window.confirm(`Delete ${asset.name}?`)) return;
    try { await deleteAdminMedia(asset); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not delete file."); }
  };

  return (
    <div style={{ fontFamily: FONT, color: C.text }}>
      <div style={{ marginBottom: 26 }}>
        <div style={{ color: C.accent, fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 8 }}>Shared media</div>
        <h1 style={{ margin: 0, fontSize: 30, letterSpacing: "-0.03em", fontWeight: 650 }}>Pictures & Logos</h1>
        <p style={{ margin: "8px 0 0", color: C.muted, fontSize: 14 }}>Upload, preview, and download shared pictures, logos, and files.</p>
      </div>

      {error && <div style={{ marginBottom: 16, padding: "11px 14px", borderRadius: 9, border: `1px solid ${C.danger}`, background: C.dangerSoft, color: C.danger, fontSize: 13 }}>{error}</div>}

      <form onSubmit={upload} style={{ display: "grid", gridTemplateColumns: "minmax(220px, 1fr) minmax(220px, 1fr) auto", gap: 10, alignItems: "end", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, marginBottom: 18 }}>
        <div><label style={{ display: "block", color: C.muted, fontSize: 11, marginBottom: 6 }}>FILE NAME</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Company logo" style={inputStyle} required /></div>
        <div><label style={{ display: "block", color: C.muted, fontSize: 11, marginBottom: 6 }}>FILE</label><input ref={fileInputRef} type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} style={{ ...inputStyle, padding: "8px 10px" }} required /></div>
        <button disabled={uploading || !selectedFile || !name.trim()} style={{ border: 0, borderRadius: 9, padding: "10px 18px", background: C.accent, color: "#fff", fontFamily: FONT, fontWeight: 650, cursor: "pointer", opacity: uploading || !selectedFile || !name.trim() ? .55 : 1 }}>{uploading ? "Uploading..." : "Upload file"}</button>
      </form>

      {loading ? <p style={{ color: C.muted }}>Loading media...</p> : assets.length === 0 ? <div style={{ padding: "48px 16px", textAlign: "center", color: C.muted, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16 }}>No files saved yet.</div> : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>{assets.map((asset) => <article key={asset.id} style={{ overflow: "hidden", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14 }}><div style={{ height: 170, background: C.surface2, display: "flex", alignItems: "center", justifyContent: "center", padding: 14 }}>{isImage(asset) ? <img src={asset.public_url} alt={asset.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <div style={{ textAlign: "center", color: C.accent }}><div style={{ fontSize: 42, marginBottom: 8 }}>▤</div><div style={{ color: C.text, fontFamily: MONO, fontSize: 12, overflowWrap: "anywhere" }}>{asset.file_name}</div></div>}</div><div style={{ padding: 14 }}><strong style={{ display: "block", fontSize: 14, marginBottom: 5 }}>{asset.name}</strong><span style={{ display: "block", color: C.muted, fontSize: 11, marginBottom: 12 }}>{formatSize(asset.size_bytes)} · {asset.file_name}</span><div style={{ display: "flex", gap: 6 }}><a href={asset.public_url} download={asset.file_name} target="_blank" rel="noreferrer" style={{ flex: 1, textAlign: "center", padding: "7px 8px", borderRadius: 7, border: `1px solid ${C.accent}`, background: C.accentSoft, color: C.accent, textDecoration: "none", fontSize: 12, fontWeight: 650 }}>Download</a><button onClick={() => remove(asset)} style={{ padding: "7px 10px", borderRadius: 7, border: `1px solid ${C.dangerSoft}`, background: C.dangerSoft, color: C.danger, cursor: "pointer", fontSize: 12 }}>Delete</button></div></div></article>)}</div>}
    </div>
  );
}
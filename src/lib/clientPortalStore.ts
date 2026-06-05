import type { Client } from "@/lib/adminApi";

export interface ClientPortalAccount {
  id: string;
  client_id: string;
  username: string;
  password: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientPortalMessage {
  id: string;
  client_id: string;
  sender_type: "admin" | "client";
  sender_name: string;
  body: string;
  created_at: string;
}

export interface ClientPortalSession {
  account_id: string;
  client_id: string;
  username: string;
}

const ACCOUNTS_KEY = "kayrosco_client_portal_accounts";
const MESSAGES_KEY = "kayrosco_client_portal_messages";
const SESSION_KEY = "kayrosco_client_portal_session";

function parse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 24) || "client";
}

function randomPassword() {
  return Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-4);
}

function derivePassword(client: Client) {
  const idNumber = (client.id_number ?? "").replace(/\s+/g, "");
  if (idNumber.length >= 6) return idNumber;
  const birth = (client.date_of_birth ?? "").replace(/-/g, "");
  if (birth.length >= 6) return birth;
  return randomPassword();
}

function uniqueUsername(base: string, accounts: ClientPortalAccount[]) {
  let candidate = slugify(base);
  let suffix = 1;
  while (accounts.some((account) => account.username === candidate)) {
    suffix += 1;
    candidate = `${slugify(base)}.${suffix}`;
  }
  return candidate;
}

export function getClientPortalAccounts(): ClientPortalAccount[] {
  return parse<ClientPortalAccount[]>(ACCOUNTS_KEY, []);
}

function saveClientPortalAccounts(accounts: ClientPortalAccount[]) {
  save(ACCOUNTS_KEY, accounts);
}

export function getClientPortalAccountByClientId(clientId: string) {
  return getClientPortalAccounts().find((account) => account.client_id === clientId) ?? null;
}

export function createClientPortalAccount(client: Client) {
  const accounts = getClientPortalAccounts();
  const existing = accounts.find((account) => account.client_id === client.id);
  if (existing) {
    return { account: existing, password: existing.password, created: false };
  }

  const now = new Date().toISOString();
  const username = uniqueUsername(client.name, accounts);
  const password = derivePassword(client);
  const account: ClientPortalAccount = {
    id: crypto.randomUUID(),
    client_id: client.id,
    username,
    password,
    is_active: true,
    created_at: now,
    updated_at: now,
  };
  saveClientPortalAccounts([account, ...accounts]);
  return { account, password, created: true };
}

export function resetClientPortalPassword(client: Client) {
  const accounts = getClientPortalAccounts();
  const nextPassword = derivePassword(client);
  const updated = accounts.map((account) =>
    account.client_id === client.id
      ? { ...account, password: nextPassword, updated_at: new Date().toISOString() }
      : account,
  );
  saveClientPortalAccounts(updated);
  const account = updated.find((entry) => entry.client_id === client.id) ?? null;
  return { account, password: nextPassword };
}

export function setClientPortalAccountActive(clientId: string, isActive: boolean) {
  saveClientPortalAccounts(
    getClientPortalAccounts().map((account) =>
      account.client_id === clientId
        ? { ...account, is_active: isActive, updated_at: new Date().toISOString() }
        : account,
    ),
  );
}

export function loginClientPortal(username: string, password: string) {
  const account = getClientPortalAccounts().find(
    (entry) => entry.username === username && entry.password === password && entry.is_active,
  );
  if (!account) throw new Error("Invalid username or password.");
  const session: ClientPortalSession = {
    account_id: account.id,
    client_id: account.client_id,
    username: account.username,
  };
  save(SESSION_KEY, session);
  return session;
}

export function getClientPortalSession() {
  return parse<ClientPortalSession | null>(SESSION_KEY, null);
}

export function logoutClientPortal() {
  localStorage.removeItem(SESSION_KEY);
}

export function getClientPortalMessages(clientId: string) {
  return parse<ClientPortalMessage[]>(MESSAGES_KEY, [])
    .filter((message) => message.client_id === clientId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

function saveClientPortalMessages(messages: ClientPortalMessage[]) {
  save(MESSAGES_KEY, messages);
}

export function addClientPortalMessage(payload: {
  clientId: string;
  senderType: "admin" | "client";
  senderName: string;
  body: string;
}) {
  const messages = parse<ClientPortalMessage[]>(MESSAGES_KEY, []);
  const message: ClientPortalMessage = {
    id: crypto.randomUUID(),
    client_id: payload.clientId,
    sender_type: payload.senderType,
    sender_name: payload.senderName,
    body: payload.body.trim(),
    created_at: new Date().toISOString(),
  };
  saveClientPortalMessages([...messages, message]);
  return message;
}

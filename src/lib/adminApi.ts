import { supabase } from "@/lib/supabaseClient";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AdminRole = "admin" | "tech_staff" | "consulting_staff" | "travel_staff" | "viewer";
export type Department = "tech" | "consulting" | "travel" | "admin";
export type ActionType = "login" | "logout" | "create" | "edit" | "delete" | "download" | "upload";
export type ContractCategory = "tech" | "consulting" | "travel";
export type ContractType = "internal" | "client" | "government";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "open" | "in_progress" | "done";

export interface AdminUser {
  id: string;
  username: string;
  password_hash: string;
  email: string | null;
  role: AdminRole;
  roles: AdminRole[];          // additional roles beyond primary
  department: Department | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  username: string | null;
  action: string;
  action_type: ActionType;
  department: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface Contract {
  id: string;
  title: string;
  category: ContractCategory;
  type: ContractType;
  uploaded_by: string | null;
  uploaded_by_username: string | null;
  file_name: string | null;
  storage_path: string | null;
  description: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface BudgetEntry {
  id: string;
  month: number;
  year: number;
  category: string;
  allocated_amount: number;
  spent_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CompanyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
}

export interface CompanyDoc {
  name: string;
  url: string;
  uploaded_at: string;
}

export interface CompanyInfo {
  id: string;
  company_name:        string | null;
  nip_number:          string | null;
  address:             string | null;
  bank_account:        string | null;
  founder_name:        string | null;
  phone:               string | null;
  email:               string | null;
  website:             string | null;
  registration_number: string | null;
  vat_number:          string | null;
  industry:            string | null;
  important_notes:     string | null;
  contacts:            CompanyContact[];
  docs:                CompanyDoc[];
  updated_at: string;
}

export interface AdminTask {
  id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  assigned_to_username: string | null;
  department: Department | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  created_by: string | null;
  created_by_username: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface AdminNote {
  id: string;
  content: string;
  author_id: string | null;
  author_username: string | null;
  pinned: boolean;
  created_at: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const adminLogin = async (username: string, password: string): Promise<AdminUser> => {
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("username", username)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(`Database error: ${error.message}`);
  if (!data) throw new Error("Invalid username or password.");

  // MVP: supports $plain$<password> prefix or raw match
  if (data.password_hash !== password && data.password_hash !== `$plain$${password}`) {
    throw new Error("Invalid username or password.");
  }

  await supabase
    .from("admin_users")
    .update({ last_login: new Date().toISOString() })
    .eq("id", data.id);

  return { ...data, roles: Array.isArray(data.roles) ? data.roles : [] } as AdminUser;
};

// ─── Activity Logs ────────────────────────────────────────────────────────────

export const logActivity = async (
  userId: string | null,
  username: string,
  action: string,
  actionType: ActionType,
  department?: string | null
) => {
  // Fire-and-forget — never throw so it doesn't break main actions
  supabase.from("activity_logs").insert({
    user_id: userId,
    username,
    action,
    action_type: actionType,
    department: department ?? null,
    ip_address: null,
  }).then(({ error }) => {
    if (error) console.warn("Log write failed:", error.message);
  });
};

export const getActivityLogs = async (filters?: {
  userId?: string;
  actionType?: ActionType;
  department?: string;
  from?: string;
  to?: string;
}): Promise<ActivityLog[]> => {
  let q = supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (filters?.userId) q = q.eq("user_id", filters.userId);
  if (filters?.actionType) q = q.eq("action_type", filters.actionType);
  if (filters?.department) q = q.eq("department", filters.department);
  if (filters?.from) q = q.gte("created_at", filters.from);
  if (filters?.to) q = q.lte("created_at", filters.to);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as ActivityLog[];
};

// ─── Staff / Admin Users ──────────────────────────────────────────────────────

export const getAdminUsers = async (): Promise<AdminUser[]> => {
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, username, email, role, roles, department, is_active, last_login, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((u) => ({ ...u, roles: Array.isArray(u.roles) ? u.roles : [] })) as AdminUser[];
};

export const createAdminUser = async (payload: {
  username: string;
  password: string;
  email: string;
  role: AdminRole;
  department: Department | null;
}): Promise<AdminUser> => {
  const { data, error } = await supabase
    .from("admin_users")
    .insert({
      username: payload.username,
      password_hash: `$plain$${payload.password}`,
      email: payload.email,
      role: payload.role,
      department: payload.department,
      is_active: true,
    })
    .select("id, username, email, role, roles, department, is_active, last_login, created_at")
    .single();
  if (error) throw new Error(error.message);
  return { ...data, roles: Array.isArray(data.roles) ? data.roles : [] } as AdminUser;
};

export const updateAdminUser = async (
  id: string,
  updates: Partial<Pick<AdminUser, "email" | "role" | "roles" | "department" | "is_active">>
): Promise<void> => {
  const { error } = await supabase.from("admin_users").update(updates).eq("id", id);
  if (error) throw new Error(error.message);
};

export const deactivateAdminUser = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("admin_users")
    .update({ is_active: false })
    .eq("id", id);
  if (error) throw new Error(error.message);
};

// ─── Budget ───────────────────────────────────────────────────────────────────

export const getBudget = async (year?: number, month?: number): Promise<BudgetEntry[]> => {
  let q = supabase
    .from("budget")
    .select("*")
    .order("year", { ascending: false })
    .order("month", { ascending: false });
  if (year) q = q.eq("year", year);
  if (month) q = q.eq("month", month);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as BudgetEntry[];
};

export const createBudgetEntry = async (payload: {
  month: number;
  year: number;
  category: string;
  allocated_amount: number;
  notes?: string;
}): Promise<BudgetEntry> => {
  const { data, error } = await supabase
    .from("budget")
    .insert({
      month: payload.month,
      year: payload.year,
      category: payload.category,
      allocated_amount: payload.allocated_amount,
      spent_amount: 0,
      notes: payload.notes ?? null,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as BudgetEntry;
};

export const adjustBudgetSpent = async (id: string, delta: number): Promise<void> => {
  const { data, error: readErr } = await supabase
    .from("budget")
    .select("spent_amount")
    .eq("id", id)
    .single();
  if (readErr) throw new Error(readErr.message);
  const newSpent = Math.max(0, (Number(data.spent_amount)) + delta);
  const { error } = await supabase
    .from("budget")
    .update({ spent_amount: newSpent, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
};

export const updateBudgetEntry = async (
  id: string,
  updates: Partial<Pick<BudgetEntry, "allocated_amount" | "spent_amount" | "notes">>
): Promise<void> => {
  const { error } = await supabase
    .from("budget")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
};

export const deleteBudgetEntry = async (id: string): Promise<void> => {
  const { error } = await supabase.from("budget").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

// ─── Company Info ─────────────────────────────────────────────────────────────

export const getCompanyInfo = async (): Promise<CompanyInfo | null> => {
  const { data, error } = await supabase
    .from("company_info")
    .select("*")
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    ...data,
    contacts: Array.isArray(data.contacts) ? data.contacts : [],
    docs:     Array.isArray(data.docs)     ? data.docs     : [],
  } as CompanyInfo;
};

export const upsertCompanyInfo = async (
  payload: Partial<Omit<CompanyInfo, "updated_at">> & { id?: string }
): Promise<void> => {
  const { id, ...fields } = payload;
  const now = new Date().toISOString();
  if (id) {
    const { error } = await supabase
      .from("company_info")
      .update({ ...fields, updated_at: now })
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("company_info")
      .insert({ ...fields, updated_at: now });
    if (error) throw new Error(error.message);
  }
};

// ─── Contracts ────────────────────────────────────────────────────────────────

export const getContracts = async (filters?: {
  category?: ContractCategory;
  type?: ContractType;
  uploadedBy?: string;
}): Promise<Contract[]> => {
  let q = supabase
    .from("contracts")
    .select("*")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (filters?.category) q = q.eq("category", filters.category);
  if (filters?.type) q = q.eq("type", filters.type);
  if (filters?.uploadedBy) q = q.eq("uploaded_by", filters.uploadedBy);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as Contract[];
};

export const createContract = async (
  payload: {
    title: string;
    category: ContractCategory;
    type: ContractType;
    description?: string;
    uploadedBy: string;
    uploadedByUsername: string;
  },
  file?: File
): Promise<{ contract: Contract; uploadWarning?: string }> => {
  let storagePath: string | null = null;
  let fileName: string | null = null;
  let uploadWarning: string | undefined;

  // Try to upload file — if storage fails, save the record anyway without the file
  if (file) {
    fileName = file.name;
    storagePath = `${payload.category}/${payload.type}/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadErr } = await supabase.storage
      .from("contracts")
      .upload(storagePath, file, { upsert: false });

    if (uploadErr) {
      // Don't block the save — just warn
      uploadWarning = `File upload failed: ${uploadErr.message}. Contract saved without file attachment.`;
      storagePath = null;
      fileName = null;
    }
  }

  const { data, error } = await supabase
    .from("contracts")
    .insert({
      title: payload.title,
      category: payload.category,
      type: payload.type,
      description: payload.description ?? null,
      uploaded_by: payload.uploadedBy || null,
      uploaded_by_username: payload.uploadedByUsername,
      file_name: fileName,
      storage_path: storagePath,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return { contract: data as Contract, uploadWarning };
};

export const softDeleteContract = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("contracts")
    .update({ is_deleted: true, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
};

export const getContractDownloadUrl = async (storagePath: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from("contracts")
    .createSignedUrl(storagePath, 60 * 10); // 10 min expiry
  if (error) throw new Error(error.message);
  return data.signedUrl;
};

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const getTasks = async (filters?: {
  status?: TaskStatus;
  department?: Department;
  assignedTo?: string;
}): Promise<AdminTask[]> => {
  let q = supabase
    .from("admin_tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status) q = q.eq("status", filters.status);
  if (filters?.department) q = q.eq("department", filters.department);
  if (filters?.assignedTo) q = q.eq("assigned_to", filters.assignedTo);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as AdminTask[];
};

export const createTask = async (payload: {
  title: string;
  description?: string;
  assignedTo?: string | null;
  assignedToUsername?: string | null;
  department?: Department | null;
  priority: TaskPriority;
  dueDate?: string | null;
  createdBy: string | null;
  createdByUsername: string;
}): Promise<AdminTask> => {
  const { data, error } = await supabase
    .from("admin_tasks")
    .insert({
      title: payload.title,
      description: payload.description ?? null,
      assigned_to: payload.assignedTo ?? null,
      assigned_to_username: payload.assignedToUsername ?? null,
      department: payload.department ?? null,
      priority: payload.priority,
      status: "open",
      due_date: payload.dueDate ?? null,
      created_by: payload.createdBy,
      created_by_username: payload.createdByUsername,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as AdminTask;
};

export const updateTaskStatus = async (id: string, status: TaskStatus): Promise<void> => {
  const { error } = await supabase
    .from("admin_tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
};

export const deleteTask = async (id: string): Promise<void> => {
  const { error } = await supabase.from("admin_tasks").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

// ─── Notes ────────────────────────────────────────────────────────────────────

export const getNotes = async (): Promise<AdminNote[]> => {
  const { data, error } = await supabase
    .from("admin_notes")
    .select("*")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw new Error(error.message);
  return (data ?? []) as AdminNote[];
};

export const createNote = async (payload: {
  content: string;
  authorId: string | null;
  authorUsername: string;
  pinned?: boolean;
}): Promise<AdminNote> => {
  const { data, error } = await supabase
    .from("admin_notes")
    .insert({
      content: payload.content,
      author_id: payload.authorId,
      author_username: payload.authorUsername,
      pinned: payload.pinned ?? false,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as AdminNote;
};

export const toggleNotePin = async (id: string, pinned: boolean): Promise<void> => {
  const { error } = await supabase
    .from("admin_notes")
    .update({ pinned })
    .eq("id", id);
  if (error) throw new Error(error.message);
};

export const deleteNote = async (id: string): Promise<void> => {
  const { error } = await supabase.from("admin_notes").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

// ─── Revenue ──────────────────────────────────────────────────────────────────

export interface RevenueEntry {
  id: string;
  month: number;
  year: number;
  department: "tech" | "consulting" | "travel";
  amount: number;
  description: string | null;
  balance_account_id:   string | null;
  balance_account_name: string | null;
  balance_credited:     boolean;
  created_by: string | null;
  created_by_username: string | null;
  created_at: string;
  updated_at: string | null;
}

export const getRevenue = async (year?: number): Promise<RevenueEntry[]> => {
  let q = supabase
    .from("revenue")
    .select("*")
    .order("year", { ascending: false })
    .order("month", { ascending: false });
  if (year) q = q.eq("year", year);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as RevenueEntry[];
};

export const createRevenueEntry = async (payload: {
  month: number;
  year: number;
  department: "tech" | "consulting" | "travel";
  amount: number;
  description?: string;
  balanceAccountId?:   string;
  balanceAccountName?: string;
  createdBy: string | null;
  createdByUsername: string;
}): Promise<RevenueEntry> => {
  const { data, error } = await supabase
    .from("revenue")
    .insert({
      month: payload.month,
      year: payload.year,
      department: payload.department,
      amount: payload.amount,
      description: payload.description ?? null,
      balance_account_id:   payload.balanceAccountId   ?? null,
      balance_account_name: payload.balanceAccountName ?? null,
      balance_credited:     !!payload.balanceAccountId,
      created_by: payload.createdBy,
      created_by_username: payload.createdByUsername,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as RevenueEntry;
};

export const updateRevenueEntry = async (id: string, updates: Partial<Pick<RevenueEntry, "amount" | "description">>): Promise<void> => {
  const { error } = await supabase
    .from("revenue")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
};

export const deleteRevenueEntry = async (id: string): Promise<void> => {
  const { error } = await supabase.from("revenue").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

// ─── Expense Claims ───────────────────────────────────────────────────────────

export type ExpenseStatus = "pending" | "approved" | "rejected";

export interface ExpenseClaim {
  id: string;
  title: string;
  amount: number;
  category: string;
  department: Department | null;
  submitted_by: string | null;
  submitted_by_username: string | null;
  status: ExpenseStatus;
  reviewed_by: string | null;
  reviewed_by_username: string | null;
  reviewed_at: string | null;
  notes: string | null;
  receipt_path: string | null;
  receipt_name: string | null;
  balance_account_id:   string | null;
  balance_account_name: string | null;
  balance_deducted:     boolean;
  created_at: string;
  updated_at: string | null;
}

export const getExpenseClaims = async (filters?: {
  status?: ExpenseStatus;
  department?: Department;
  submittedBy?: string;
}): Promise<ExpenseClaim[]> => {
  let q = supabase
    .from("expense_claims")
    .select("*")
    .order("created_at", { ascending: false });
  if (filters?.status) q = q.eq("status", filters.status);
  if (filters?.department) q = q.eq("department", filters.department);
  if (filters?.submittedBy) q = q.eq("submitted_by", filters.submittedBy);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as ExpenseClaim[];
};

export const createExpenseClaim = async (payload: {
  title: string;
  amount: number;
  category: string;
  department: Department | null;
  submittedBy: string | null;
  submittedByUsername: string;
  notes?: string;
  balanceAccountId?:   string;
  balanceAccountName?: string;
}, file?: File): Promise<ExpenseClaim> => {
  let receiptPath: string | null = null;
  let receiptName: string | null = null;
  if (file) {
    receiptName = file.name;
    receiptPath = `expenses/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadErr } = await supabase.storage
      .from("contracts")
      .upload(receiptPath, file, { upsert: false });
    if (uploadErr) {
      receiptPath = null;
      receiptName = null;
    }
  }
  const { data, error } = await supabase
    .from("expense_claims")
    .insert({
      title: payload.title,
      amount: payload.amount,
      category: payload.category,
      department: payload.department,
      submitted_by: payload.submittedBy,
      submitted_by_username: payload.submittedByUsername,
      status: "pending",
      notes: payload.notes ?? null,
      receipt_path: receiptPath,
      receipt_name: receiptName,
      balance_account_id:   payload.balanceAccountId   ?? null,
      balance_account_name: payload.balanceAccountName ?? null,
      balance_deducted:     false,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as ExpenseClaim;
};

export const reviewExpenseClaim = async (
  id: string,
  status: "approved" | "rejected",
  reviewer: { id: string; username: string },
  balanceDeducted = false,
): Promise<void> => {
  const { error } = await supabase
    .from("expense_claims")
    .update({
      status,
      reviewed_by: reviewer.id,
      reviewed_by_username: reviewer.username,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...(status === "approved" && balanceDeducted ? { balance_deducted: true } : {}),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
};

export const deleteExpenseClaim = async (id: string): Promise<void> => {
  const { error } = await supabase.from("expense_claims").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

// ─── Announcements ────────────────────────────────────────────────────────────

export type AnnouncementLevel = "info" | "warning" | "urgent";

export interface Announcement {
  id: string;
  content: string;
  level: AnnouncementLevel;
  is_active: boolean;
  created_by: string | null;
  created_by_username: string | null;
  expires_at: string | null;
  created_at: string;
}

export const getAnnouncements = async (activeOnly = false): Promise<Announcement[]> => {
  let q = supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });
  if (activeOnly) q = q.eq("is_active", true);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as Announcement[];
};

export const createAnnouncement = async (payload: {
  content: string;
  level: AnnouncementLevel;
  expiresAt?: string | null;
  createdBy: string | null;
  createdByUsername: string;
}): Promise<Announcement> => {
  const { data, error } = await supabase
    .from("announcements")
    .insert({
      content: payload.content,
      level: payload.level,
      is_active: true,
      expires_at: payload.expiresAt ?? null,
      created_by: payload.createdBy,
      created_by_username: payload.createdByUsername,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as Announcement;
};

export const toggleAnnouncement = async (id: string, isActive: boolean): Promise<void> => {
  const { error } = await supabase.from("announcements").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(error.message);
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

// ─── Clients ──────────────────────────────────────────────────────────────────

export interface ClientDoc {
  name:        string;
  url:         string;
  uploaded_at: string;
}

export interface Client {
  id:                   string;
  name:                 string;
  contact_name:         string | null;
  contact_email:        string | null;
  contact_phone:        string | null;
  department:           "tech" | "consulting" | "travel" | null;
  notes:                string | null;
  // Extended identity fields (added in v3 migration)
  id_number:            string | null;
  nationality:          string | null;
  date_of_birth:        string | null;   // ISO date "YYYY-MM-DD"
  address:              string | null;
  city:                 string | null;
  country:              string | null;
  // Document storage URLs
  passport_url:         string | null;
  passport_name:        string | null;
  id_doc_url:           string | null;
  id_doc_name:          string | null;
  extra_docs:           ClientDoc[];
  is_active:            boolean;
  created_by:           string | null;
  created_by_username:  string | null;
  created_at:           string;
  updated_at:           string | null;
}

export const getClients = async (filters?: {
  department?: string;
  isActive?:   boolean;
  search?:     string;
}): Promise<Client[]> => {
  let q = supabase
    .from("clients")
    .select("*")
    .order("name", { ascending: true });
  if (filters?.department) q = q.eq("department", filters.department);
  if (filters?.isActive !== undefined) q = q.eq("is_active", filters.isActive);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  // Normalise extra_docs — older rows may have null
  return (data ?? []).map((row) => ({
    ...row,
    extra_docs: Array.isArray(row.extra_docs) ? row.extra_docs : [],
  })) as Client[];
};

export const createClient = async (payload: {
  name:               string;
  contactName?:       string;
  contactEmail?:      string;
  contactPhone?:      string;
  department?:        "tech" | "consulting" | "travel" | null;
  notes?:             string;
  idNumber?:          string;
  nationality?:       string;
  dateOfBirth?:       string;
  address?:           string;
  city?:              string;
  country?:           string;
  createdBy:          string | null;
  createdByUsername:  string;
}): Promise<Client> => {
  const { data, error } = await supabase
    .from("clients")
    .insert({
      name:                 payload.name,
      contact_name:         payload.contactName         ?? null,
      contact_email:        payload.contactEmail        ?? null,
      contact_phone:        payload.contactPhone        ?? null,
      department:           payload.department          ?? null,
      notes:                payload.notes               ?? null,
      id_number:            payload.idNumber            ?? null,
      nationality:          payload.nationality         ?? null,
      date_of_birth:        payload.dateOfBirth         ?? null,
      address:              payload.address             ?? null,
      city:                 payload.city                ?? null,
      country:              payload.country             ?? null,
      created_by:           payload.createdBy,
      created_by_username:  payload.createdByUsername,
      is_active:            true,
      extra_docs:           [],
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return { ...data, extra_docs: Array.isArray(data.extra_docs) ? data.extra_docs : [] } as Client;
};

/** All updatable client fields (basic + extended + document URLs) */
export type ClientUpdates = Partial<
  Pick<Client,
    | "name" | "contact_name" | "contact_email" | "contact_phone"
    | "department" | "notes" | "is_active"
    | "id_number" | "nationality" | "date_of_birth" | "address" | "city" | "country"
    | "passport_url" | "passport_name" | "id_doc_url" | "id_doc_name" | "extra_docs"
  >
>;

export const updateClient = async (
  id:      string,
  updates: ClientUpdates,
): Promise<void> => {
  const { error } = await supabase
    .from("clients")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
};

export const deleteClient = async (id: string): Promise<void> => {
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

// ─── Client document upload (Supabase Storage) ────────────────────────────────
const CLIENT_DOCS_BUCKET = "client-docs";

export const uploadClientDoc = async (
  clientId: string,
  file:     File,
  slot:     "passport" | "id_doc" | `extra_${number}`,
): Promise<string> => {
  const ext  = file.name.split(".").pop() ?? "bin";
  const path = `${clientId}/${slot}_${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(CLIENT_DOCS_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: true });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from(CLIENT_DOCS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
};

export const deleteClientDoc = async (publicUrl: string): Promise<void> => {
  // Extract the storage path from the public URL
  const marker = `/object/public/${CLIENT_DOCS_BUCKET}/`;
  const idx    = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const path   = publicUrl.slice(idx + marker.length);
  await supabase.storage.from(CLIENT_DOCS_BUCKET).remove([path]);
};

// ─── Role Permissions ─────────────────────────────────────────────────────────

export interface RolePermission {
  id: string;
  role: AdminRole;
  resource: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  updated_at: string;
}

export const getRolePermissions = async (): Promise<RolePermission[]> => {
  const { data, error } = await supabase
    .from("role_permissions")
    .select("*")
    .order("role")
    .order("resource");
  if (error) throw new Error(error.message);
  return (data ?? []) as RolePermission[];
};

export const updateRolePermission = async (
  id: string,
  updates: Partial<Pick<RolePermission, "can_view" | "can_create" | "can_edit" | "can_delete">>
): Promise<void> => {
  const { error } = await supabase
    .from("role_permissions")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
};

// ─── Contract Expiry ──────────────────────────────────────────────────────────

export const getExpiringContracts = async (withinDays = 30): Promise<Contract[]> => {
  const today = new Date();
  const future = new Date();
  future.setDate(future.getDate() + withinDays);
  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("is_deleted", false)
    .not("expires_at", "is", null)
    .lte("expires_at", future.toISOString().split("T")[0])
    .order("expires_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Contract[];
};

export const updateContractMeta = async (
  id: string,
  updates: { status?: string; value?: number | null; expires_at?: string | null; description?: string }
): Promise<void> => {
  const { error } = await supabase
    .from("contracts")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
};

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export const getDashboardStats = async () => {
  const now = new Date();
  const [usersRes, contractsRes, budgetRes, logsRes, tasksOpenRes, tasksDoneRes, announcementsRes, expensesRes] =
    await Promise.all([
      supabase
        .from("admin_users")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("contracts")
        .select("id", { count: "exact", head: true })
        .eq("is_deleted", false),
      supabase
        .from("budget")
        .select("allocated_amount, spent_amount")
        .eq("year", now.getFullYear())
        .eq("month", now.getMonth() + 1),
      supabase
        .from("activity_logs")
        .select("id, username, action, action_type, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("admin_tasks")
        .select("id", { count: "exact", head: true })
        .in("status", ["open", "in_progress"]),
      supabase
        .from("admin_tasks")
        .select("id", { count: "exact", head: true })
        .eq("status", "done"),
      supabase
        .from("announcements")
        .select("id, content, level")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("expense_claims")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

  const totalAllocated = (budgetRes.data ?? []).reduce(
    (s, r) => s + Number(r.allocated_amount),
    0
  );
  const totalSpent = (budgetRes.data ?? []).reduce(
    (s, r) => s + Number(r.spent_amount),
    0
  );

  return {
    totalUsers: usersRes.count ?? 0,
    activeContracts: contractsRes.count ?? 0,
    budgetAllocated: totalAllocated,
    budgetSpent: totalSpent,
    openTasks: tasksOpenRes.count ?? 0,
    doneTasks: tasksDoneRes.count ?? 0,
    pendingExpenses: expensesRes.count ?? 0,
    activeAnnouncements: (announcementsRes.data ?? []) as { id: string; content: string; level: string }[],
    recentLogs: (logsRes.data ?? []) as Pick<
      ActivityLog,
      "id" | "username" | "action" | "action_type" | "created_at"
    >[],
  };
};

// ─── Tickets ──────────────────────────────────────────────────────────────────

export type TicketStatus   = "open" | "in_progress" | "done";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface TicketAttachment {
  type:        "link" | "file";
  name:        string;
  url:         string;
  uploaded_at: string;
}

export interface Ticket {
  id:                   string;
  client_id:            string | null;
  client_name:          string | null;
  title:                string;
  description:          string | null;
  status:               TicketStatus;
  priority:             TicketPriority;
  department:           string | null;
  attachments:          TicketAttachment[];
  notes:                string | null;
  created_by:           string | null;
  created_by_username:  string | null;
  created_at:           string;
  updated_at:           string | null;
}

const normaliseTicket = (row: Record<string, unknown>): Ticket => ({
  ...row,
  attachments: Array.isArray(row.attachments) ? row.attachments : [],
} as Ticket);

export const getTickets = async (filters?: {
  status?:     TicketStatus;
  clientId?:   string;
  department?: string;
}): Promise<Ticket[]> => {
  let q = supabase.from("tickets").select("*").order("created_at", { ascending: false });
  if (filters?.status)     q = q.eq("status", filters.status);
  if (filters?.clientId)   q = q.eq("client_id", filters.clientId);
  if (filters?.department) q = q.eq("department", filters.department);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map(normaliseTicket);
};

export const createTicket = async (payload: {
  clientId?:           string | null;
  clientName?:         string | null;
  title:               string;
  description?:        string;
  priority?:           TicketPriority;
  department?:         string | null;
  createdBy:           string | null;
  createdByUsername:   string;
}): Promise<Ticket> => {
  const { data, error } = await supabase
    .from("tickets")
    .insert({
      client_id:            payload.clientId          ?? null,
      client_name:          payload.clientName         ?? null,
      title:                payload.title,
      description:          payload.description        ?? null,
      priority:             payload.priority           ?? "medium",
      department:           payload.department         ?? null,
      status:               "open",
      attachments:          [],
      created_by:           payload.createdBy,
      created_by_username:  payload.createdByUsername,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return normaliseTicket(data);
};

export const updateTicket = async (
  id:      string,
  updates: Partial<Pick<Ticket, "status" | "priority" | "description" | "notes" | "attachments" | "client_id" | "client_name" | "title">>,
): Promise<void> => {
  const { error } = await supabase
    .from("tickets")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
};

export const deleteTicket = async (id: string): Promise<void> => {
  const { error } = await supabase.from("tickets").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

export const uploadTicketFile = async (ticketId: string, file: File): Promise<string> => {
  const ext  = file.name.split(".").pop() ?? "bin";
  const path = `${ticketId}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
  const { error } = await supabase.storage
    .from("ticket-docs")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from("ticket-docs").getPublicUrl(path);
  return data.publicUrl;
};

// ─── Deals ────────────────────────────────────────────────────────────────────

export interface Deal {
  id:                       string;
  title:                    string;
  description:              string | null;
  client_id:                string | null;
  client_name:              string | null;
  department:               string | null;
  expected_value:           number;
  due_date:                 string | null;
  is_done:                  boolean;
  payment_received:         boolean;
  payment_amount:           number | null;
  payment_date:             string | null;
  payment_added_to_balance: boolean;
  is_archived:              boolean;
  created_by:               string | null;
  created_by_username:      string | null;
  created_at:               string;
  updated_at:               string | null;
}

export const getDeals = async (filters?: { archived?: boolean }): Promise<Deal[]> => {
  let q = supabase.from("deals").select("*").order("created_at", { ascending: false });
  if (filters?.archived !== undefined) q = q.eq("is_archived", filters.archived);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as Deal[];
};

export const createDeal = async (payload: {
  title:              string;
  description?:       string;
  clientId?:          string | null;
  clientName?:        string | null;
  department?:        string | null;
  expectedValue:      number;
  dueDate?:           string | null;
  createdBy:          string | null;
  createdByUsername:  string;
}): Promise<Deal> => {
  const { data, error } = await supabase
    .from("deals")
    .insert({
      title:               payload.title,
      description:         payload.description    ?? null,
      client_id:           payload.clientId       ?? null,
      client_name:         payload.clientName     ?? null,
      department:          payload.department     ?? null,
      expected_value:      payload.expectedValue,
      due_date:            payload.dueDate        ?? null,
      created_by:          payload.createdBy,
      created_by_username: payload.createdByUsername,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as Deal;
};

export const updateDeal = async (
  id:      string,
  updates: Partial<Pick<Deal,
    | "title" | "description" | "client_id" | "client_name"
    | "department" | "expected_value" | "due_date"
    | "is_done" | "payment_received" | "payment_amount"
    | "payment_date" | "payment_added_to_balance" | "is_archived"
  >>,
): Promise<void> => {
  const { error } = await supabase
    .from("deals")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
};

export const deleteDeal = async (id: string): Promise<void> => {
  const { error } = await supabase.from("deals").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

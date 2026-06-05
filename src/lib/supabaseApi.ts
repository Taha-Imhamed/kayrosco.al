import { supabase } from "@/lib/supabaseClient";

export type ServiceArea = "travel" | "ealbana" | "tech";
export type WorkerArea = ServiceArea | "all";
export type RequestStatus =
  | "new"
  | "in_review"
  | "awaiting_docs"
  | "in_progress"
  | "completed";

export type ServiceCatalogItem = {
  id: string;
  area: ServiceArea;
  title: string;
  description: string | null;
  created_at: string;
};

export type WorkerProfile = {
  id: string;
  full_name: string;
  email: string;
  role_area: WorkerArea;
  role_title: string | null;
  active: boolean;
  created_at: string;
};

export type CompanySetting = {
  id: string;
  area: ServiceArea | "global";
  phone: string | null;
  email: string | null;
  address: string | null;
  updated_at: string;
};

export type RequestFile = {
  id: string;
  request_id: string;
  file_name: string;
  storage_path: string;
  created_at: string;
};

export type RequestPriority = "low" | "medium" | "high" | "urgent";

export type RequestLinkType = "demo" | "repo" | "figma" | "staging" | "doc" | "meet" | "other";

export type RequestLink = {
  id: string;
  label: string;
  url: string;
  type: RequestLinkType;
};

export type ChecklistItem = {
  id: string;
  text: string;
  done: boolean;
};

export type ServiceRequest = {
  id: string;
  tracking_id: string;
  service_area: ServiceArea;
  service_type: string;
  status: RequestStatus;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  data: Record<string, unknown> | null;
  assigned_worker_id: string | null;
  due_at: string | null;
  report: string | null;
  priority: RequestPriority | null;
  links: RequestLink[];
  checklist: ChecklistItem[];
  created_at: string;
  request_files?: RequestFile[];
  assigned_worker?: WorkerProfile | null;
};

export const createTrackingId = () =>
  crypto.randomUUID().replace(/-/g, "").slice(0, 12);

export const getServicesByArea = async (area: ServiceArea) => {
  const { data, error } = await supabase
    .from("service_catalog")
    .select("*")
    .eq("area", area)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as ServiceCatalogItem[];
};

export const getSettingsByArea = async (area: CompanySetting["area"]) => {
  const { data, error } = await supabase
    .from("company_settings")
    .select("*")
    .eq("area", area)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as CompanySetting | null;
};

export const createServiceRequest = async (payload: {
  service_area: ServiceArea;
  service_type: string;
  full_name: string;
  email: string;
  phone: string;
  data?: Record<string, unknown>;
}) => {
  // Generate both IDs locally so we never need a SELECT after INSERT.
  // This means the real UUID is available for file uploads immediately.
  const id = crypto.randomUUID();
  const trackingId = createTrackingId();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("service_requests")
    .insert({
      id,
      tracking_id: trackingId,
      service_area: payload.service_area,
      service_type: payload.service_type,
      status: "new",
      full_name: payload.full_name,
      email: payload.email,
      phone: payload.phone,
      data: payload.data ?? {},
    });
  if (error) throw error;
  return {
    id,
    tracking_id: trackingId,
    service_area: payload.service_area,
    service_type: payload.service_type,
    status: "new" as RequestStatus,
    full_name: payload.full_name,
    email: payload.email,
    phone: payload.phone,
    data: payload.data ?? {},
    assigned_worker_id: null,
    due_at: null,
    report: null,
    priority: null,
    links: [],
    checklist: [],
    created_at: now,
  } as ServiceRequest;
};

export const uploadRequestFile = async (
  requestId: string,
  file: File
) => {
  const filePath = `${requestId}/${crypto.randomUUID()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("request-files")
    .upload(filePath, file, { upsert: false });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("request_files")
    .insert({
      request_id: requestId,
      file_name: file.name,
      storage_path: filePath,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as RequestFile;
};

export const getRequestByTrackingId = async (
  trackingId: string,
  area: ServiceArea
) => {
  const { data, error } = await supabase.rpc("get_request_by_tracking_id", {
    p_tracking_id: trackingId,
    p_area: area,
  });
  if (error) throw error;
  if (!data || !data.length) return null;
  return data[0] as ServiceRequest;
};

export const fetchAdminData = async () => {
  const [requests, services, workers, settings] = await Promise.all([
    supabase
      .from("service_requests")
      .select(
        "*, request_files(*), assigned_worker:workers(id, full_name, email, role_area, role_title, active)"
      )
      .order("created_at", { ascending: false }),
    supabase.from("service_catalog").select("*").order("created_at", {
      ascending: false,
    }),
    supabase.from("workers").select("*").order("created_at", {
      ascending: false,
    }),
    supabase.from("company_settings").select("*").order("area", {
      ascending: true,
    }),
  ]);

  if (requests.error) throw requests.error;
  if (services.error) throw services.error;
  if (workers.error) throw workers.error;
  if (settings.error) throw settings.error;

  return {
    requests: (requests.data ?? []) as ServiceRequest[],
    services: (services.data ?? []) as ServiceCatalogItem[],
    workers: (workers.data ?? []) as WorkerProfile[],
    settings: (settings.data ?? []) as CompanySetting[],
  };
};

export const updateServiceRequest = async (
  id: string,
  updates: Partial<ServiceRequest>
) => {
  const { error } = await supabase
    .from("service_requests")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
};

export const createServiceCatalogItem = async (
  payload: Pick<ServiceCatalogItem, "area" | "title" | "description">
) => {
  const { data, error } = await supabase
    .from("service_catalog")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as ServiceCatalogItem;
};

export const updateServiceCatalogItem = async (
  id: string,
  updates: Partial<ServiceCatalogItem>
) => {
  const { error } = await supabase
    .from("service_catalog")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
};

export const deleteServiceCatalogItem = async (id: string) => {
  const { error } = await supabase
    .from("service_catalog")
    .delete()
    .eq("id", id);
  if (error) throw error;
};

export const createWorkerProfile = async (
  payload: Pick<WorkerProfile, "full_name" | "email" | "role_area" | "role_title">
) => {
  const { data, error } = await supabase
    .from("workers")
    .insert({ ...payload, active: true })
    .select("*")
    .single();
  if (error) throw error;
  return data as WorkerProfile;
};

export const updateWorkerProfile = async (
  id: string,
  updates: Partial<WorkerProfile>
) => {
  const { error } = await supabase
    .from("workers")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
};

export const deleteWorkerProfile = async (id: string) => {
  const { error } = await supabase.from("workers").delete().eq("id", id);
  if (error) throw error;
};

export const upsertCompanySetting = async (
  payload: Pick<CompanySetting, "area" | "phone" | "email" | "address">
) => {
  const { error } = await supabase
    .from("company_settings")
    .upsert({ ...payload, updated_at: new Date().toISOString() }, { onConflict: "area" });
  if (error) throw error;
};

/** Fetch all service requests for a specific area, newest first. */
export const getRequestsByArea = async (area: ServiceArea) => {
  const { data, error } = await supabase
    .from("service_requests")
    .select(
      "*, request_files(*), assigned_worker:workers(id, full_name, email, role_area, role_title, active)"
    )
    .eq("service_area", area)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ServiceRequest[];
};

export const deleteServiceRequest = async (id: string) => {
  const { error } = await supabase
    .from("service_requests")
    .delete()
    .eq("id", id);
  if (error) throw error;
};

// ─── Tech Projects ─────────────────────────────────────────────────────────────

export type TechProjectStatus = "done" | "available" | "in_progress";

export type TechProject = {
  id: string;
  title: string;
  description: string | null;
  photo_url: string | null;
  link: string | null;
  status: TechProjectStatus;
  tags: string[];
  order_index: number;
  created_at: string;
};

export const getTechProjects = async () => {
  const { data, error } = await supabase
    .from("tech_projects")
    .select("*")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as TechProject[];
};

export const createTechProject = async (
  payload: Omit<TechProject, "id" | "created_at">
) => {
  const { data, error } = await supabase
    .from("tech_projects")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as TechProject;
};

export const updateTechProject = async (
  id: string,
  updates: Partial<Omit<TechProject, "id" | "created_at">>
) => {
  const { error } = await supabase
    .from("tech_projects")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
};

export const deleteTechProject = async (id: string) => {
  const { error } = await supabase
    .from("tech_projects")
    .delete()
    .eq("id", id);
  if (error) throw error;
};

/** Fetch workers who can handle a given area (or area "all"). */
export const getWorkersByArea = async (area: ServiceArea) => {
  const { data, error } = await supabase
    .from("workers")
    .select("*")
    .in("role_area", [area, "all"])
    .eq("active", true)
    .order("full_name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as WorkerProfile[];
};


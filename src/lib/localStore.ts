export type ServiceArea = "travel" | "ealbana" | "tech";
export type RequestStatus =
  | "new"
  | "in_review"
  | "awaiting_docs"
  | "in_progress"
  | "completed";

export type RequestFile = {
  id: string;
  file_name: string;
  created_at: string;
};

export type LocalRequest = {
  id: string;
  tracking_id: string;
  service_area: ServiceArea;
  service_type: string;
  status: RequestStatus;
  full_name: string;
  email: string;
  phone: string;
  data?: Record<string, unknown>;
  assigned_worker_id?: string | null;
  due_at?: string | null;
  report?: string | null;
  created_at: string;
  request_files?: RequestFile[];
};

export type LocalService = {
  id: string;
  area: ServiceArea;
  title: string;
  description: string | null;
};

export type LocalWorker = {
  id: string;
  full_name: string;
  email: string;
  area: ServiceArea | "all";
};

export type LocalSetting = {
  area: ServiceArea | "global";
  phone: string;
  email: string;
  address: string;
};

const REQUESTS_KEY = "kayroscoRequests";
const SERVICES_KEY = "kayroscoServices";
const WORKERS_KEY = "kayroscoWorkers";
const SETTINGS_KEY = "kayroscoSettings";

const safeParse = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const normalizeReferenceCode = (value: string) =>
  value.replace(/[^a-z0-9]/gi, "").toLowerCase().replace(/^kay/, "");

export const createTrackingId = () =>
  crypto.randomUUID().replace(/-/g, "").slice(0, 12);

export const formatReferenceCode = (trackingId: string) =>
  `KAY-${trackingId.slice(0, 4).toUpperCase()}-${trackingId.slice(4, 8).toUpperCase()}-${trackingId.slice(8, 12).toUpperCase()}`;

export const getLocalRequests = (): LocalRequest[] =>
  safeParse<LocalRequest[]>(localStorage.getItem(REQUESTS_KEY), []);

export const saveLocalRequests = (requests: LocalRequest[]) => {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
};

export const addLocalRequest = (
  payload: Omit<LocalRequest, "id" | "tracking_id" | "created_at" | "status"> & {
    status?: RequestStatus;
    request_files?: RequestFile[];
  }
) => {
  const requests = getLocalRequests();
  const tracking_id = createTrackingId();
  const id = crypto.randomUUID();
  const created_at = new Date().toISOString();
  const newRequest: LocalRequest = {
    id,
    tracking_id,
    service_area: payload.service_area,
    service_type: payload.service_type,
    status: payload.status ?? "new",
    full_name: payload.full_name,
    email: payload.email,
    phone: payload.phone,
    data: payload.data ?? {},
    assigned_worker_id: payload.assigned_worker_id ?? null,
    due_at: payload.due_at ?? null,
    report: payload.report ?? null,
    created_at,
    request_files: payload.request_files ?? [],
  };
  requests.unshift(newRequest);
  saveLocalRequests(requests);
  return newRequest;
};

export const updateLocalRequest = (
  id: string,
  updates: Partial<LocalRequest>
) => {
  const requests = getLocalRequests();
  const next = requests.map((req) =>
    req.id === id ? { ...req, ...updates } : req
  );
  saveLocalRequests(next);
};

export const getRequestByTrackingId = (trackingId: string) => {
  const requests = getLocalRequests();
  const normalizedTrackingId = normalizeReferenceCode(trackingId);
  return (
    requests.find((req) => normalizeReferenceCode(req.tracking_id) === normalizedTrackingId) ||
    null
  );
};

export const getLocalServices = (): LocalService[] =>
  safeParse<LocalService[]>(localStorage.getItem(SERVICES_KEY), []);

export const saveLocalServices = (services: LocalService[]) => {
  localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
};

export const addLocalService = (service: Omit<LocalService, "id">) => {
  const services = getLocalServices();
  const newService = { ...service, id: crypto.randomUUID() };
  services.push(newService);
  saveLocalServices(services);
  return newService;
};

export const deleteLocalService = (id: string) => {
  const services = getLocalServices().filter((service) => service.id !== id);
  saveLocalServices(services);
};

export const getLocalWorkers = (): LocalWorker[] =>
  safeParse<LocalWorker[]>(localStorage.getItem(WORKERS_KEY), []);

export const saveLocalWorkers = (workers: LocalWorker[]) => {
  localStorage.setItem(WORKERS_KEY, JSON.stringify(workers));
};

export const addLocalWorker = (worker: Omit<LocalWorker, "id">) => {
  const workers = getLocalWorkers();
  const newWorker = { ...worker, id: crypto.randomUUID() };
  workers.push(newWorker);
  saveLocalWorkers(workers);
  return newWorker;
};

export const getLocalSettings = (): LocalSetting[] =>
  safeParse<LocalSetting[]>(localStorage.getItem(SETTINGS_KEY), []);

export const saveLocalSettings = (settings: LocalSetting[]) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const upsertLocalSetting = (setting: LocalSetting) => {
  const settings = getLocalSettings();
  const index = settings.findIndex((s) => s.area === setting.area);
  if (index >= 0) {
    settings[index] = setting;
  } else {
    settings.push(setting);
  }
  saveLocalSettings(settings);
};

export const getSettingByArea = (area: LocalSetting["area"]) => {
  return getLocalSettings().find((s) => s.area === area) || null;
};

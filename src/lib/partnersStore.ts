export type PartnerCategory =
  | "restaurant"
  | "hotel"
  | "transport"
  | "legal"
  | "technology"
  | "supplier"
  | "other";

export type ContractStatus =
  | "active"
  | "pending"
  | "expired"
  | "draft";

export interface PartnerRecord {
  id: string;
  name: string;
  category: PartnerCategory;
  logo_url: string;
  short_description: string;
  details: string;
  contact_person: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  contract_status: ContractStatus;
  contract_title: string;
  contract_value: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = "kayrosco_partners_records";

function parse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function savePartners(records: PartnerRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function getPartners(): PartnerRecord[] {
  return parse<PartnerRecord[]>(STORAGE_KEY, []);
}

export function createPartner(
  payload: Omit<PartnerRecord, "id" | "created_at" | "updated_at">,
): PartnerRecord {
  const now = new Date().toISOString();
  const record: PartnerRecord = {
    id: crypto.randomUUID(),
    ...payload,
    created_at: now,
    updated_at: now,
  };
  savePartners([record, ...getPartners()]);
  return record;
}

export function updatePartner(
  id: string,
  updates: Partial<Omit<PartnerRecord, "id" | "created_at" | "updated_at">>,
): void {
  savePartners(
    getPartners().map((record) =>
      record.id === id
        ? { ...record, ...updates, updated_at: new Date().toISOString() }
        : record,
    ),
  );
}

export function deletePartner(id: string): void {
  savePartners(getPartners().filter((record) => record.id !== id));
}

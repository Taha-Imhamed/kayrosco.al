// ─── Balance Store — localStorage-backed financial accounts ─────────────────

export type BalanceCategoryKey = "assets" | "liquid" | "stocks" | "bank" | "other";

export interface BalanceAccount {
  id: string;
  name: string;
  category: BalanceCategoryKey;
  balance: number;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface BalanceTx {
  id: string;
  account_id: string;
  type: "credit" | "debit";
  amount: number;
  label: string;
  created_at: string;
  created_by: string;
}

const ACCOUNTS_KEY = "kayrosco_balance_accounts";
const TXS_KEY      = "kayrosco_balance_txs";

function parse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// ── Accounts ─────────────────────────────────────────────────────────────────
export const getAccounts = (): BalanceAccount[] => parse(ACCOUNTS_KEY, []);
export const saveAccounts = (a: BalanceAccount[]) =>
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(a));

export const addAccount = (
  payload: Pick<BalanceAccount, "name" | "category" | "note">,
  initialBalance = 0,
  createdBy = "admin",
): BalanceAccount => {
  const now = new Date().toISOString();
  const account: BalanceAccount = {
    id: crypto.randomUUID(),
    name: payload.name,
    category: payload.category,
    balance: initialBalance,
    note: payload.note,
    created_at: now,
    updated_at: now,
  };
  saveAccounts([account, ...getAccounts()]);

  // Record an opening transaction if there's an initial balance
  if (initialBalance !== 0) {
    const txs = getTxs();
    txs.unshift({
      id: crypto.randomUUID(),
      account_id: account.id,
      type: initialBalance > 0 ? "credit" : "debit",
      amount: Math.abs(initialBalance),
      label: "Opening balance",
      created_at: now,
      created_by: createdBy,
    });
    saveTxs(txs);
  }
  return account;
};

export const updateAccount = (
  id: string,
  updates: Partial<Pick<BalanceAccount, "name" | "note">>,
) => {
  saveAccounts(
    getAccounts().map((a) =>
      a.id === id ? { ...a, ...updates, updated_at: new Date().toISOString() } : a,
    ),
  );
};

export const deleteAccount = (id: string) => {
  saveAccounts(getAccounts().filter((a) => a.id !== id));
  saveTxs(getTxs().filter((t) => t.account_id !== id));
};

// ── Transactions ──────────────────────────────────────────────────────────────
export const getTxs = (): BalanceTx[] => parse(TXS_KEY, []);
export const saveTxs = (t: BalanceTx[]) =>
  localStorage.setItem(TXS_KEY, JSON.stringify(t));

export const applyTx = (
  accountId: string,
  type: "credit" | "debit",
  amount: number,
  label: string,
  createdBy: string,
): void => {
  const delta = type === "credit" ? amount : -amount;
  saveAccounts(
    getAccounts().map((a) =>
      a.id === accountId
        ? { ...a, balance: a.balance + delta, updated_at: new Date().toISOString() }
        : a,
    ),
  );
  const txs = getTxs();
  txs.unshift({
    id: crypto.randomUUID(),
    account_id: accountId,
    type,
    amount,
    label: label.trim() || (type === "credit" ? "Credit" : "Debit"),
    created_at: new Date().toISOString(),
    created_by: createdBy,
  });
  saveTxs(txs);
};

export const getAccountTxs = (accountId: string, limit = 30): BalanceTx[] =>
  getTxs()
    .filter((t) => t.account_id === accountId)
    .slice(0, limit);

// ── CSV export helper ────────────────────────────────────────────────────────
export const exportBalanceCSV = () => {
  const accounts = getAccounts();
  const txs      = getTxs();

  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

  // ── Sheet 1: accounts summary
  const accountRows = [
    ["Account Name", "Category", "Balance", "Note", "Created", "Last Updated"],
    ...accounts.map((a) => [
      esc(a.name),
      esc(a.category.charAt(0).toUpperCase() + a.category.slice(1)),
      esc(a.balance.toFixed(2)),
      esc(a.note),
      esc(new Date(a.created_at).toLocaleString()),
      esc(new Date(a.updated_at).toLocaleString()),
    ]),
  ];

  // ── Sheet 2: transaction log
  const txRows = [
    ["", ""],
    ["TRANSACTIONS", ""],
    ["Account Name", "Type", "Amount", "Description", "Date", "By"],
    ...txs.map((t) => {
      const acc = accounts.find((a) => a.id === t.account_id);
      return [
        esc(acc?.name ?? t.account_id),
        esc(t.type),
        esc(t.amount.toFixed(2)),
        esc(t.label),
        esc(new Date(t.created_at).toLocaleString()),
        esc(t.created_by),
      ];
    }),
  ];

  const csv = [...accountRows, ...txRows]
    .map((r) => r.join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = `kayrosco-balance-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

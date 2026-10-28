import fs from "fs";
import path from "path";
import zlib from "zlib";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Read-only Prisma client for the storefront that keeps working when the
 * database does not.
 *
 * Every call goes to Postgres first. If it fails or takes longer than
 * DB_TIMEOUT_MS, the same query is answered from data/catalog-snapshot.json.gz
 * (written by scripts/export-catalog-snapshot.ts at build time), and for the
 * next CIRCUIT_OPEN_MS we skip the database entirely so visitors don't wait on
 * a dead connection.
 *
 * The snapshot evaluator understands the subset of Prisma query arguments the
 * storefront uses (where/orderBy/skip/take/select/include/distinct, relation
 * filters, _count). Anything else throws, so a page render fails loudly and
 * ISR keeps serving the last good version instead of caching something wrong.
 *
 * Use only for reads. Writes must keep going through `prisma`.
 */

const DB_TIMEOUT_MS = 8000;
const CIRCUIT_OPEN_MS = 30_000;
const SNAPSHOT_FILE = path.join(process.cwd(), "data", "catalog-snapshot.json.gz");
const READ_METHODS = new Set(["findMany", "findFirst", "findUnique", "findFirstOrThrow", "findUniqueOrThrow", "count", "groupBy"]);

type Row = Record<string, unknown>;
type Args = Record<string, unknown> | undefined;

// Relations between the snapshot tables: list = rows of `model` whose `fk` points at this row's id,
// one = the `model` row whose id is this row's `fk`.
type Relation = { kind: "list" | "one"; model: string; fk: string };
const RELATIONS: Record<string, Record<string, Relation>> = {
  Product: {
    images: { kind: "list", model: "ProductImage", fk: "productId" },
    categories: { kind: "list", model: "ProductCategory", fk: "productId" },
    variants: { kind: "list", model: "ProductVariant", fk: "productId" },
    reviews: { kind: "list", model: "Review", fk: "productId" },
    orderItems: { kind: "list", model: "OrderItem", fk: "productId" },
    wishlist: { kind: "list", model: "WishlistItem", fk: "productId" },
  },
  ProductImage: { product: { kind: "one", model: "Product", fk: "productId" } },
  ProductVariant: { product: { kind: "one", model: "Product", fk: "productId" } },
  ProductCategory: {
    product: { kind: "one", model: "Product", fk: "productId" },
    category: { kind: "one", model: "Category", fk: "categoryId" },
  },
  Category: {
    parent: { kind: "one", model: "Category", fk: "parentId" },
    children: { kind: "list", model: "Category", fk: "parentId" },
    products: { kind: "list", model: "ProductCategory", fk: "categoryId" },
  },
  Review: {
    product: { kind: "one", model: "Product", fk: "productId" },
    user: { kind: "one", model: "User", fk: "userId" },
  },
};

// ── Snapshot loading ────────────────────────────────────────────────

interface Snapshot {
  generatedAt: string;
  tables: Record<string, Row[]>;
  byId: Map<string, Map<string, Row>>;
  byFk: Map<string, Map<unknown, Row[]>>;
}

let snapshot: Snapshot | null = null;

const fieldTypes = new Map<string, Map<string, string>>(
  (Prisma.dmmf.datamodel.models as unknown as { name: string; fields: { name: string; kind: string; type: string }[] }[]).map(
    (m) => [m.name, new Map(m.fields.filter((f) => f.kind !== "object").map((f) => [f.name, f.type]))],
  ),
);

function loadSnapshot(): Snapshot {
  if (snapshot) return snapshot;
  const raw = JSON.parse(zlib.gunzipSync(fs.readFileSync(SNAPSHOT_FILE)).toString("utf8")) as {
    generatedAt: string;
    tables: Record<string, Row[]>;
  };
  // Revive the types Prisma would return.
  for (const [model, rows] of Object.entries(raw.tables)) {
    const types = fieldTypes.get(model);
    if (!types) continue;
    for (const row of rows) {
      for (const [field, type] of types) {
        const v = row[field];
        if (v == null) continue;
        if (type === "DateTime") row[field] = new Date(v as string);
        else if (type === "Decimal") row[field] = new Prisma.Decimal(v as string);
      }
    }
  }
  snapshot = { ...raw, byId: new Map(), byFk: new Map() };
  return snapshot;
}

function table(model: string): Row[] {
  return loadSnapshot().tables[model] ?? [];
}

function rowById(model: string, id: unknown): Row | undefined {
  const s = loadSnapshot();
  let index = s.byId.get(model);
  if (!index) {
    index = new Map(table(model).map((r) => [r.id as string, r]));
    s.byId.set(model, index);
  }
  return index.get(id as string);
}

function rowsByFk(model: string, fk: string, value: unknown): Row[] {
  const s = loadSnapshot();
  const key = `${model}.${fk}`;
  let index = s.byFk.get(key);
  if (!index) {
    index = new Map();
    for (const r of table(model)) {
      const list = index.get(r[fk]) ?? [];
      list.push(r);
      index.set(r[fk], list);
    }
    s.byFk.set(key, index);
  }
  return index.get(value) ?? [];
}

function related(model: string, row: Row, field: string): Row[] | Row | null {
  const rel = RELATIONS[model]?.[field];
  if (!rel) throw new Error(`catalog snapshot: unknown relation ${model}.${field}`);
  if (rel.kind === "one") return row[rel.fk] == null ? null : rowById(rel.model, row[rel.fk]) ?? null;
  return rowsByFk(rel.model, rel.fk, row.id);
}

// ── where ───────────────────────────────────────────────────────────

function comparable(v: unknown, insensitive = false): unknown {
  if (v instanceof Date) return v.getTime();
  if (Prisma.Decimal.isDecimal(v)) return (v as Prisma.Decimal).toNumber();
  if (insensitive && typeof v === "string") return v.toLowerCase();
  return v;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !(v instanceof Date) && !Prisma.Decimal.isDecimal(v) && !Array.isArray(v);
}

function matchScalar(value: unknown, filter: unknown): boolean {
  if (!isPlainObject(filter)) return comparable(value) === comparable(filter);
  const ci = filter.mode === "insensitive";
  const v = comparable(value, ci) as never;
  for (const [op, raw] of Object.entries(filter)) {
    if (op === "mode") continue;
    const f = (Array.isArray(raw) ? raw.map((x) => comparable(x, ci)) : comparable(raw, ci)) as never;
    switch (op) {
      case "equals": if (v !== f) return false; break;
      case "not": if (isPlainObject(raw) ? matchScalar(value, raw) : v === f) return false; break;
      case "in": if (!(f as unknown[]).includes(v)) return false; break;
      case "notIn": if ((f as unknown[]).includes(v)) return false; break;
      case "lt": if (!(v != null && v < f)) return false; break;
      case "lte": if (!(v != null && v <= f)) return false; break;
      case "gt": if (!(v != null && v > f)) return false; break;
      case "gte": if (!(v != null && v >= f)) return false; break;
      case "contains": if (typeof v !== "string" || !(v as string).includes(f)) return false; break;
      case "startsWith": if (typeof v !== "string" || !(v as string).startsWith(f)) return false; break;
      case "endsWith": if (typeof v !== "string" || !(v as string).endsWith(f)) return false; break;
      default: throw new Error(`catalog snapshot: unsupported filter "${op}"`);
    }
  }
  return true;
}

function matchWhere(model: string, row: Row, where: unknown): boolean {
  if (!where) return true;
  for (const [key, cond] of Object.entries(where as Record<string, unknown>)) {
    if (cond === undefined) continue;
    if (key === "AND") {
      if (!(Array.isArray(cond) ? cond : [cond]).every((w) => matchWhere(model, row, w))) return false;
    } else if (key === "OR") {
      if (!(cond as unknown[]).some((w) => matchWhere(model, row, w))) return false;
    } else if (key === "NOT") {
      if ((Array.isArray(cond) ? cond : [cond]).some((w) => matchWhere(model, row, w))) return false;
    } else if (RELATIONS[model]?.[key]) {
      const rel = RELATIONS[model][key];
      const target = related(model, row, key);
      const c = cond as Record<string, unknown> | null;
      if (rel.kind === "list") {
        const rows = target as Row[];
        if (c && "some" in c && !rows.some((r) => matchWhere(rel.model, r, c.some))) return false;
        if (c && "every" in c && !rows.every((r) => matchWhere(rel.model, r, c.every))) return false;
        if (c && "none" in c && rows.some((r) => matchWhere(rel.model, r, c.none))) return false;
      } else {
        const r = target as Row | null;
        if (c === null) { if (r) return false; continue; }
        if (c && ("is" in c || "isNot" in c)) {
          if ("is" in c && !(c.is === null ? !r : r && matchWhere(rel.model, r, c.is))) return false;
          if ("isNot" in c && (c.isNot === null ? !r : r && matchWhere(rel.model, r, c.isNot))) return false;
        } else if (!r || !matchWhere(rel.model, r, c)) return false;
      }
    } else if (cond === null) {
      if (row[key] != null) return false;
    } else if (!matchScalar(row[key], cond)) {
      return false;
    }
  }
  return true;
}

// ── orderBy ─────────────────────────────────────────────────────────

function sortKey(model: string, row: Row, spec: Record<string, unknown>): { value: unknown; dir: string } {
  const [field, dirOrNested] = Object.entries(spec)[0];
  if (RELATIONS[model]?.[field]) {
    const nested = dirOrNested as Record<string, unknown>;
    if ("_count" in nested) return { value: (related(model, row, field) as Row[]).length, dir: nested._count as string };
    const target = related(model, row, field) as Row | null;
    return target ? sortKey(RELATIONS[model][field].model, target, nested) : { value: null, dir: Object.values(nested)[0] as string };
  }
  const dir = isPlainObject(dirOrNested) ? (dirOrNested.sort as string) : (dirOrNested as string);
  return { value: comparable(row[field]), dir };
}

function sortRows(model: string, rows: Row[], orderBy: unknown): Row[] {
  if (!orderBy) return rows;
  const specs = (Array.isArray(orderBy) ? orderBy : [orderBy]) as Record<string, unknown>[];
  return [...rows].sort((a, b) => {
    for (const spec of specs) {
      const ka = sortKey(model, a, spec);
      const kb = sortKey(model, b, spec);
      if (ka.value === kb.value) continue;
      // Postgres puts NULLs last ascending, first descending.
      if (ka.value == null) return ka.dir === "desc" ? -1 : 1;
      if (kb.value == null) return ka.dir === "desc" ? 1 : -1;
      // Plain code-point order, matching the database's "C" collation.
      const cmp = (ka.value as number) < (kb.value as number) ? -1 : 1;
      return ka.dir === "desc" ? -cmp : cmp;
    }
    return 0;
  });
}

// ── select / include ───────────────────────────────────────────────

function copyJson(v: unknown): unknown {
  return isPlainObject(v) || Array.isArray(v) ? structuredClone(v) : v;
}

function project(model: string, row: Row, args: Args): Row {
  const select = args?.select as Record<string, unknown> | undefined;
  const include = args?.include as Record<string, unknown> | undefined;
  const out: Row = {};
  if (!select) for (const field of fieldTypes.get(model)?.keys() ?? []) out[field] = copyJson(row[field]);
  for (const [field, spec] of Object.entries(select ?? include ?? {})) {
    if (!spec) continue;
    if (field === "_count") {
      const counts: Row = {};
      const countSelect = ((spec as Record<string, unknown>).select ?? {}) as Record<string, unknown>;
      for (const [rel, relSpec] of Object.entries(countSelect)) {
        if (!relSpec) continue;
        const rows = related(model, row, rel) as Row[];
        const where = isPlainObject(relSpec) ? relSpec.where : undefined;
        counts[rel] = rows.filter((r) => matchWhere(RELATIONS[model][rel].model, r, where)).length;
      }
      out._count = counts;
    } else if (RELATIONS[model]?.[field]) {
      const rel = RELATIONS[model][field];
      const nested = spec === true ? undefined : (spec as Args);
      const target = related(model, row, field);
      out[field] =
        rel.kind === "list" ? findManyIn(rel.model, target as Row[], nested) : target ? project(rel.model, target as Row, nested) : null;
    } else {
      out[field] = copyJson(row[field]);
    }
  }
  return out;
}

// ── query methods ───────────────────────────────────────────────────

function findManyIn(model: string, rows: Row[], args: Args): Row[] {
  if (args?.cursor) throw new Error("catalog snapshot: cursor pagination is not supported");
  let result = rows.filter((r) => matchWhere(model, r, args?.where));
  result = sortRows(model, result, args?.orderBy);
  if (args?.distinct) {
    const fields = (Array.isArray(args.distinct) ? args.distinct : [args.distinct]) as string[];
    const seen = new Set<string>();
    result = result.filter((r) => {
      const key = JSON.stringify(fields.map((f) => comparable(r[f])));
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  const skip = (args?.skip as number) ?? 0;
  const take = args?.take as number | undefined;
  result = result.slice(skip, take === undefined ? undefined : skip + take);
  return result.map((r) => project(model, r, args));
}

function groupBy(model: string, args: Args): Row[] {
  const by = (Array.isArray(args?.by) ? args.by : [args?.by]) as string[];
  const unsupported = Object.keys(args ?? {}).filter((k) => !["by", "where", "_count", "orderBy"].includes(k));
  if (unsupported.length) throw new Error(`catalog snapshot: groupBy ${unsupported.join(", ")} not supported`);
  const groups = new Map<string, Row[]>();
  for (const r of table(model).filter((r) => matchWhere(model, r, args?.where))) {
    const key = JSON.stringify(by.map((f) => r[f]));
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  return [...groups.values()].map((rows) => {
    const out: Row = Object.fromEntries(by.map((f) => [f, rows[0][f]]));
    if (args?._count === true) out._count = rows.length;
    else if (args?._count) {
      out._count = Object.fromEntries(
        Object.keys(args._count as object).map((f) => [f, f === "_all" ? rows.length : rows.filter((r) => r[f] != null).length]),
      );
    }
    return out;
  });
}

function querySnapshot(model: string, method: string, args: Args): unknown {
  switch (method) {
    case "findMany":
      return findManyIn(model, table(model), args);
    case "findFirst":
    case "findUnique":
      return findManyIn(model, table(model), { ...args, take: 1 })[0] ?? null;
    case "findFirstOrThrow":
    case "findUniqueOrThrow": {
      const row = findManyIn(model, table(model), { ...args, take: 1 })[0];
      if (!row) throw new Error(`No ${model} found`);
      return row;
    }
    case "count":
      if (args?.select) throw new Error("catalog snapshot: count with select is not supported");
      return table(model).filter((r) => matchWhere(model, r, args?.where)).length;
    case "groupBy":
      return groupBy(model, args);
    default:
      throw new Error(`catalog snapshot: ${method} is not supported`);
  }
}

// ── client ──────────────────────────────────────────────────────────

let dbDownUntil = 0;

function withTimeout<T>(promise: PromiseLike<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`database did not answer within ${DB_TIMEOUT_MS}ms`)), DB_TIMEOUT_MS);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

async function run(model: string, delegate: string, method: string, args: Args): Promise<unknown> {
  if (Date.now() < dbDownUntil) return querySnapshot(model, method, args);
  try {
    const client = prisma as unknown as Record<string, Record<string, (a: Args) => PromiseLike<unknown>>>;
    return await withTimeout(client[delegate][method](args));
  } catch (err) {
    dbDownUntil = Date.now() + CIRCUIT_OPEN_MS;
    console.error(
      `[catalog-db] ${model}.${method} failed, serving the catalog snapshot for the next ${CIRCUIT_OPEN_MS / 1000}s:`,
      err instanceof Error ? err.message || (err as NodeJS.ErrnoException).code || err.name : err,
    );
    return querySnapshot(model, method, args);
  }
}

const delegates = new Map<string, unknown>();

export const catalogDb = new Proxy({} as typeof prisma, {
  get(_, delegate) {
    if (typeof delegate !== "string") return undefined;
    if (!delegates.has(delegate)) {
      const model = delegate.charAt(0).toUpperCase() + delegate.slice(1);
      if (!fieldTypes.has(model)) throw new Error(`catalogDb: unknown model ${delegate}`);
      delegates.set(
        delegate,
        new Proxy({}, {
          get(__, method) {
            if (typeof method !== "string" || !READ_METHODS.has(method)) {
              throw new Error(`catalogDb is read-only: use prisma.${delegate}.${String(method)} instead`);
            }
            return (args?: Args) => run(model, delegate, method, args);
          },
        }),
      );
    }
    return delegates.get(delegate);
  },
});

/** Exposed for scripts/test-catalog-fallback.ts, which compares it against the live database. */
export const snapshotQuery = querySnapshot;

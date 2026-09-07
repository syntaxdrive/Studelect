/**
 * StudElect Native Supabase Client
 * Direct REST interface with AbortController timeout on every request.
 */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lurbrcgeivofalftahhj.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1cmJyY2dlaXZvZmFsZnRhaGhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NzAwMDQsImV4cCI6MjEwMjU0NjAwNH0.4B6-ub0B6m4uE3ilCtVjcQ1RYRy2a4Pz8Qwb1no1DTU";

const FETCH_TIMEOUT_MS = 6000; // 6 seconds max per request

/** Make a fetch with a hard timeout. Throws on timeout. */
async function fetchWithTimeout(
  url: string,
  options: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export class SupabaseQueryBuilder {
  private table: string;
  private filters: Array<{ column: string; operator: string; value: any }> = [];
  private selectedColumns: string = "*";
  private isSingleResult: boolean = false;
  private sortColumn?: string;
  private sortAsc: boolean = true;

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string = "*") {
    this.selectedColumns = columns;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ column, operator: "eq", value });
    return this;
  }

  order(column: string, { ascending = true }: { ascending?: boolean } = {}) {
    this.sortColumn = column;
    this.sortAsc = ascending;
    return this;
  }

  single() {
    this.isSingleResult = true;
    return this;
  }

  maybeSingle() {
    this.isSingleResult = true;
    return this;
  }

  async then(resolve: (value: { data: any; error: any }) => void) {
    try {
      const url = new URL(`${SUPABASE_URL}/rest/v1/${this.table}`);
      url.searchParams.append("select", this.selectedColumns);

      for (const filter of this.filters) {
        url.searchParams.append(filter.column, `${filter.operator}.${filter.value}`);
      }

      if (this.sortColumn) {
        url.searchParams.append(
          "order",
          `${this.sortColumn}.${this.sortAsc ? "asc" : "desc"}`
        );
      }

      const headers: Record<string, string> = {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      };
      if (this.isSingleResult) {
        headers["Prefer"] = "return=representation";
      }

      const res = await fetchWithTimeout(url.toString(), {
        method: "GET",
        headers,
        cache: "no-store",
      });

      if (!res.ok) {
        const errorText = await res.text();
        resolve({ data: null, error: { message: errorText, status: res.status } });
        return;
      }

      const json = await res.json();
      const result =
        this.isSingleResult && Array.isArray(json) ? json[0] ?? null : json;
      resolve({ data: result, error: null });
    } catch (err: any) {
      const isTimeout = err?.name === "AbortError";
      resolve({
        data: null,
        error: {
          message: isTimeout
            ? "Supabase request timed out after 6s."
            : err.message || "Network request failed.",
        },
      });
    }
  }

  async insert(values: any | any[]) {
    try {
      const url = `${SUPABASE_URL}/rest/v1/${this.table}`;
      const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errText = await res.text();
        return { data: null, error: { message: errText, status: res.status } };
      }

      const data = await res.json();
      return { data, error: null };
    } catch (err: any) {
      const isTimeout = err?.name === "AbortError";
      return {
        data: null,
        error: {
          message: isTimeout ? "Supabase insert timed out." : err.message,
        },
      };
    }
  }

  async upsert(values: any | any[]) {
    try {
      const url = `${SUPABASE_URL}/rest/v1/${this.table}`;
      const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errText = await res.text();
        return { data: null, error: { message: errText, status: res.status } };
      }

      const data = await res.json();
      return { data, error: null };
    } catch (err: any) {
      const isTimeout = err?.name === "AbortError";
      return {
        data: null,
        error: {
          message: isTimeout ? "Supabase upsert timed out." : err.message,
        },
      };
    }
  }

  update(values: any) {
    const table = this.table;
    const filters = [...this.filters];

    return {
      eq: async (column: string, value: any) => {
        try {
          const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
          url.searchParams.append(column, `eq.${value}`);
          for (const f of filters) {
            url.searchParams.append(f.column, `${f.operator}.${f.value}`);
          }

          const res = await fetchWithTimeout(url.toString(), {
            method: "PATCH",
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify(values),
          });

          if (!res.ok) {
            const errText = await res.text();
            return { data: null, error: { message: errText } };
          }

          const data = await res.json();
          return { data, error: null };
        } catch (err: any) {
          return {
            data: null,
            error: { message: err?.name === "AbortError" ? "Supabase update timed out." : err.message },
          };
        }
      },
    };
  }

  delete() {
    const table = this.table;
    const filters = [...this.filters];

    return {
      eq: async (column: string, value: any) => {
        try {
          const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
          url.searchParams.append(column, `eq.${value}`);
          for (const f of filters) {
            url.searchParams.append(f.column, `${f.operator}.${f.value}`);
          }

          const res = await fetchWithTimeout(url.toString(), {
            method: "DELETE",
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              "Content-Type": "application/json",
            },
          });

          if (!res.ok) {
            const errText = await res.text();
            return { data: null, error: { message: errText } };
          }

          return { data: true, error: null };
        } catch (err: any) {
          return {
            data: null,
            error: { message: err?.name === "AbortError" ? "Supabase delete timed out." : err.message },
          };
        }
      },
    };
  }
}

export const supabase = {
  from: (table: string) => new SupabaseQueryBuilder(table),
  channel: (channelName: string) => ({
    on: (_type: string, _filter: any, _callback: (payload: any) => void) => ({
      subscribe: () => ({ unsubscribe: () => {} }),
    }),
    subscribe: () => ({ unsubscribe: () => {} }),
  }),
  removeChannel: (_channel: any) => {},
};

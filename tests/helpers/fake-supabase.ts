export interface FakeCall {
  method: string;
  args: unknown[];
}

export function makeFakeSupabase(result: { data?: unknown; error?: unknown } = {}) {
  const calls = { from: [] as FakeCall[], tables: [] as string[] };

  function chain(): Record<string, unknown> {
    return new Proxy(
      {},
      {
        get(_t, prop) {
          if (prop === 'then') {
            return (resolve: (v: unknown) => void) =>
              resolve({ data: result.data ?? null, error: result.error ?? null });
          }
          if (
            prop === 'single' ||
            prop === 'maybeSingle' ||
            prop === 'insert' ||
            prop === 'update' ||
            prop === 'delete' ||
            prop === 'upsert' ||
            prop === 'select' ||
            prop === 'eq' ||
            prop === 'order' ||
            prop === 'limit' ||
            prop === 'in'
          ) {
            if (prop === 'single' || prop === 'maybeSingle') {
              return async () => ({ data: result.data ?? null, error: result.error ?? null });
            }
            return (...args: unknown[]) => {
              calls.from.push({ method: String(prop), args });
              return chain();
            };
          }
          return (...args: unknown[]) => {
            calls.from.push({ method: String(prop), args });
            return chain();
          };
        },
      },
    );
  }

  const supabase = {
    from: (table: string) => {
      calls.tables.push(table);
      return chain();
    },
    calls,
  };

  return supabase;
}

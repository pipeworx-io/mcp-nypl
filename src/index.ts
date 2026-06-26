interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * NYPL Digital Collections MCP.
 *
 * New York Public Library Digital Collections — 900k+ digitised items: photographs, maps, manuscripts, prints & ephemera. Free API token required. Get a free key at api.repo.nypl.org (email signup -> token); the platform injects it, or pass _apiKey (BYOK).
 */


const BASE = 'https://api.repo.nypl.org';
const UA = 'pipeworx-mcp-nypl/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'search',
    description: 'Search the NYPL Digital Collections collection by keyword. Returns matching items with ids (pass an id to item), titles, creators/sources, dates and links.',
    inputSchema: { type: 'object', properties: {
      query: { type: 'string', description: 'Keyword(s).' },
      limit: { type: 'number', description: 'Max results (1-100, default 20).' },
      page: { type: 'number', description: 'Page (1-based, default 1).' },
      _apiKey: { type: 'string', description: 'NYPL Digital Collections API key (auto-injected by the platform).' },
    }, required: ['query'] },
  },
  {
    name: 'item',
    description: 'Fetch full details for one NYPL Digital Collections item by id — an NYPL item uuid (from search).',
    inputSchema: { type: 'object', properties: {
      id: { type: 'string', description: 'e.g. "510d47e4-1234-a3d9-e040-e00a18064a99".' },
      _apiKey: { type: 'string', description: 'NYPL Digital Collections API key.' },
    }, required: ['id'] },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const key = typeof args._apiKey === 'string' ? args._apiKey : '';
  delete args._apiKey;
  if (!key) throw new Error('NYPL Digital Collections API key required. Get one free at api.repo.nypl.org (email signup -> token) and pass via _apiKey (platform key may not be set yet).');
  switch (name) {
    case 'search': {
      const limit = clamp(numArg(args.limit, 20), 1, 100);
      const p = new URLSearchParams();
      p.set('q', String(args.query ?? ''));
      p.set('per_page', String(limit));
      const page = Math.max(1, numArg(args.page, 1));
      if (page > 1) p.set('page', String(page));
      
      
      return get(`${BASE}/api/v2/items/search?${p}`, key);
    }
    case 'item': {
      const id = reqStr(args, 'id', '"510d47e4-1234-a3d9-e040-e00a18064a99"');
      const dp = new URLSearchParams();  const dq = dp.toString() ? '?'+dp.toString() : '';
      return get(`${BASE}/api/v2/items/${encodeURIComponent(id)}${dq}`, key);
    }
    default: throw new Error(`Unknown tool: ${name}`);
  }
}

async function get(url: string, key: string): Promise<unknown> {
  const headers: Record<string,string> = { Accept: 'application/json', 'User-Agent': UA }; if (key) headers['Authorization'] = 'Token token=' + key;
  const res = await fetch(url, { headers });
  if (res.status === 401 || res.status === 403) throw new Error('NYPL Digital Collections: key rejected/missing. Get a free key at api.repo.nypl.org (email signup -> token).');
  if (!res.ok) throw new Error(`NYPL Digital Collections: ${res.status} ${await res.text().then((t) => t.slice(0, 160))}`);
  return res.json();
}
function reqStr(args: Record<string, unknown>, k: string, ex: string): string { const v = args[k]; if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${k}" is missing. Pass a string like ${ex}.`); return v; }
function numArg(v: unknown, d: number): number { const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN; return Number.isFinite(n) ? n : d; }
function clamp(n: number, lo: number, hi: number): number { return Math.max(lo, Math.min(hi, Math.trunc(n))); }

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;

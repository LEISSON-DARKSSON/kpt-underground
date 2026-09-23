/** Read-only Fourthwall client. Never use Platform API credentials here. */
export interface FourthwallShop {
  id: string;
  name: string;
  domain: string;
  publicDomain: string;
}
export interface CatalogItem extends Record<string, unknown> {
  id: string;
  name: string;
}
export interface StorefrontOptions {
  token: string;
  expectedShopId?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  maxPages?: number;
}
export class StorefrontError extends Error {
  readonly code: string;
  readonly status: number | undefined;
  constructor(code: string, status?: number) {
    super(code); // Do not expose request URLs, tokens or upstream error bodies.
    this.name = 'StorefrontError';
    this.code = code;
    this.status = status;
  }
}
function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
export function createStorefrontClient(options: StorefrontOptions) {
  const token = options.token.trim().replace(/^ptkn\\_/, 'ptkn_');
  if (!/^ptkn_[A-Za-z0-9_-]{10,200}$/.test(token)) {
    throw new StorefrontError('INVALID_STOREFRONT_TOKEN_FORMAT');
  }
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? 15000;
  const maxPages = options.maxPages ?? 20;
  if (!Number.isInteger(maxPages) || maxPages < 1 || maxPages > 100 ||
      !Number.isFinite(timeoutMs) || timeoutMs < 1 || timeoutMs > 60000) {
    throw new StorefrontError('INVALID_CLIENT_OPTIONS');
  }
  async function request(path: string, page?: number): Promise<unknown> {
    const url = new URL(`https://storefront-api.fourthwall.com/v1/${path}`);
    url.searchParams.set('storefront_token', token);
    if (page !== undefined) {
      url.searchParams.set('page', String(page));
      url.searchParams.set('size', '50');
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(url, {
        method: 'GET', headers: { Accept: 'application/json' },
        credentials: 'omit', redirect: 'error', cache: 'no-store',
        signal: controller.signal,
      });
      if (!response.ok) {
        const code = response.status === 401 || response.status === 403
          ? 'AUTH_REJECTED' : response.status === 429 ? 'RATE_LIMITED' : 'UPSTREAM_HTTP_ERROR';
        throw new StorefrontError(code, response.status);
      }
      try { return await response.json(); }
      catch { throw new StorefrontError('INVALID_JSON'); }
    } catch (error) {
      if (error instanceof StorefrontError) throw error;
      throw new StorefrontError(controller.signal.aborted ? 'TIMEOUT' : 'NETWORK_ERROR');
    } finally { clearTimeout(timer); }
  }
  async function getShop(): Promise<FourthwallShop> {
    const data = await request('shop');
    if (!record(data) || !['id', 'name', 'domain', 'publicDomain'].every(
      key => typeof data[key] === 'string' && (data[key] as string).length > 0,
    )) throw new StorefrontError('INVALID_SHOP_RESPONSE');
    const shop = data as unknown as FourthwallShop;
    if (options.expectedShopId && shop.id !== options.expectedShopId) {
      throw new StorefrontError('SHOP_ID_MISMATCH');
    }
    return { id: shop.id, name: shop.name, domain: shop.domain, publicDomain: shop.publicDomain };
  }
  async function list(path: 'collections' | 'collections/all/products'): Promise<CatalogItem[]> {
    const found = new Map<string, CatalogItem>();
    for (let page = 0; page < maxPages; page++) {
      const data = await request(path, page);
      if (!record(data) || !Array.isArray(data.results) || !record(data.paging) ||
          typeof data.paging.hasNextPage !== 'boolean') {
        throw new StorefrontError('INVALID_LIST_RESPONSE');
      }
      for (const item of data.results) {
        if (!record(item) || typeof item.id !== 'string' || typeof item.name !== 'string') {
          throw new StorefrontError('INVALID_CATALOG_ITEM');
        }
        found.set(item.id, item as CatalogItem);
      }
      if (!data.paging.hasNextPage) return [...found.values()];
    }
    throw new StorefrontError('PAGINATION_LIMIT_REACHED'); // Never claim partial totals are complete.
  }
  return {
    getShop,
    getCollections: () => list('collections'),
    getPublicProducts: () => list('collections/all/products'),
    async inspect() {
      const shop = await getShop(); // Validate identity before fetching the catalog.
      const collections = await list('collections');
      const products = await list('collections/all/products');
      return {
        checkedAt: new Date().toISOString(), connection: 'ok' as const,
        identityPinned: Boolean(options.expectedShopId), shop,
        collections, products, publicProductCount: products.length,
        salesReady: false as const, // Connectivity is NOT fulfillment/checkout verification.
      };
    },
  };
}

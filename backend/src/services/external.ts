export type Formato = 'json' | 'xml';

export const parseFormato = (v: unknown): Formato =>
  String(v ?? '').trim().toLowerCase() === 'xml' ? 'xml' : 'json';

const emitterHost = (id: string) =>
  ({
    visa: process.env.EMISOR_VISA_HOST,
    mastercard: process.env.EMISOR_MASTERCARD_HOST,
    credomatic: process.env.EMISOR_CREDOMATIC_HOST,
  } as Record<string, string | undefined>)[id];

const courierHost = (id: string) =>
  ({
    courier1: process.env.COURIER_1_HOST,
    courier2: process.env.COURIER_2_HOST,
    courier3: process.env.COURIER_3_HOST,
  } as Record<string, string | undefined>)[id];

// Función auxiliar para resolver si un proveedor específico necesita .php en su ruta
const resolvePath = (id: string, basePath: string): string => {
  // Proveedores que obligatoriamente necesitan la extensión .php
  const phpProviders = ['tarjeta', 'courier10'];
  
  if (phpProviders.includes(id)) {
    return `${basePath}.php`;
  }
  return basePath;
};

const decodeEntities = (s: string) =>
  s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');

const normalizeKey = (k: string) =>
  k.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function normalizeKeys(value: any): any {
  if (Array.isArray(value)) return value.map(normalizeKeys);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [normalizeKey(k), normalizeKeys(v)]));
  }
  return value;
}

export function parseXml(xml: string): any {
  const src = xml
    .replace(/<\?[\s\S]*?\?>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .trim();

  type Frame = { name: string; obj: Record<string, any>; text: string };
  const root: Frame = { name: '#root', obj: {}, text: '' };
  const stack: Frame[] = [root];

  const add = (parent: Frame, name: string, value: any) => {
    if (name in parent.obj) {
      parent.obj[name] = Array.isArray(parent.obj[name]) ? [...parent.obj[name], value] : [parent.obj[name], value];
    } else {
      parent.obj[name] = value;
    }
  };

  const token = /<!\[CDATA\[([\s\S]*?)\]\]>|<(\/?)([A-Za-z_][\w:.-]*)[^>]*?(\/?)>|([^<]+)/g;
  let m: RegExpExecArray | null;
  while ((m = token.exec(src))) {
    const [, cdata, closing, rawName, selfClose, text] = m;
    const top = stack[stack.length - 1];
    if (cdata !== undefined) {
      top.text += cdata;
    } else if (text !== undefined) {
      top.text += decodeEntities(text);
    } else {
      const name = rawName.includes(':') ? rawName.split(':').pop()! : rawName;
      if (closing) {
        if (stack.length > 1) {
          const frame = stack.pop()!;
          const hasChildren = Object.keys(frame.obj).length > 0;
          add(stack[stack.length - 1], frame.name, hasChildren ? frame.obj : frame.text.trim());
        }
      } else if (selfClose) {
        add(top, name, '');
      } else {
        stack.push({ name, obj: {}, text: '' });
      }
    }
  }

  if (!Object.keys(root.obj).length) throw new Error('Respuesta XML vacía o inválida');
  return root.obj;
}

export function parsePayload(body: string): any {
  const text = body.replace(/^\uFEFF/, '').trim();
  if (!text) return {};
  if (text.startsWith('<')) return normalizeKeys(parseXml(text));
  if (text.startsWith('{') || text.startsWith('[')) return normalizeKeys(JSON.parse(text));
  throw new Error(`Respuesta con formato desconocido: "${text.slice(0, 80)}"`);
}

async function request<T>(url: URL, formato: Formato): Promise<T> {
  console.log(`Consultando servicio externo (${formato.toUpperCase()}):`, url.toString());

  const r = await fetch(url, {
    headers: {
      'ngrok-skip-browser-warning': 'true',
      Accept: formato === 'xml' ? 'application/xml, text/xml' : 'application/json',
    },
  });

  if (!r.ok) {
    throw new Error(`Servicio externo respondió ${r.status}`);
  }

  return parsePayload(await r.text()) as T;
}

function requireHost(host: string | undefined, label: string): string {
  if (!host) {
    throw new Error(`No hay host configurado para ${label}. Define la variable correspondiente en .env`);
  }
  return host;
}

const buildUrl = (host: string, path: string, params: Record<string, string>, formato: Formato) => {
  const u = new URL(`${host.replace(/\/$/, '')}${path}`);
  Object.entries({ ...params, formato }).forEach(([k, v]) => u.searchParams.set(k, v));
  return u;
};

export function authorize(emisor: string, input: Record<string, string>, formato: Formato = 'json') {
  const host = requireHost(emitterHost(emisor), `el emisor "${emisor}"`);
  const path = resolvePath(emisor, '/autorizacion'); // Aplica .php si es 'mastercard'
  
  return request<{
    autorizacion: {
      status: string;
      numero: string;
    };
  }>(buildUrl(host, path, input, formato), formato);
}

export function shippingQuote(courier: string, destino: string, formato: Formato = 'json') {
  const host = requireHost(courierHost(courier), `el courier "${courier}"`);
  const path = resolvePath(courier, '/consulta'); // Aplica .php si es 'courier2'
  
  return request<{
    consultaprecio: {
      courrier: string;
      destino: string;
      cobertura: string;
      costo: string | number;
    };
  }>(buildUrl(host, path, { destino }, formato), formato);
}

export function createShipment(courier: string, input: Record<string, string>, formato: Formato = 'json') {
  const host = requireHost(courierHost(courier), `el courier "${courier}"`);
  const path = resolvePath(courier, '/envio'); // Aplica .php si es 'courier2'
  
  return request<any>(buildUrl(host, path, input, formato), formato);
}

export function shipmentStatus(courier: string, orden: string, formato: Formato = 'json') {
  const host = requireHost(courierHost(courier), `el courier "${courier}"`);
  const path = resolvePath(courier, '/status'); // Aplica .php si es 'courier2'
  
  return request<{
    orden: {
      courrier: string;
      orden: string;
      status: string;
    };
  }>(buildUrl(host, path, { orden, tienda: 'motorflow' }, formato), formato);
}
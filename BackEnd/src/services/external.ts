// Servicio de integración con las apps externas de Tarjeta de Crédito y Courier.
// Sin simulación local: siempre llama al host real configurado en .env.
// Si el host no está configurado, falla explícitamente en vez de responder con datos falsos.

const emitterHost = (id: string) => ({ visa: process.env.EMISOR_VISA_HOST, mastercard: process.env.EMISOR_MASTERCARD_HOST, credomatic: process.env.EMISOR_CREDOMATIC_HOST } as Record<string, string | undefined>)[id];
const courierHost = (id: string) => ({ courier1: process.env.COURIER_1_HOST, courier2: process.env.COURIER_2_HOST, courier3: process.env.COURIER_3_HOST } as Record<string, string | undefined>)[id];

async function getJson<T>(url: URL): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Servicio externo respondió ${r.status}`);
  return r.json() as Promise<T>;
}

function requireHost(host: string | undefined, label: string): string {
  if (!host) throw new Error(`No hay host configurado para ${label}. Define la variable correspondiente en .env`);
  return host;
}

export function authorize(emisor: string, input: Record<string, string>) {
  const host = requireHost(emitterHost(emisor), `el emisor "${emisor}"`);
  const u = new URL('/autorizacion', host);
  Object.entries({ ...input, formato: 'json' }).forEach(([k, v]) => u.searchParams.set(k, v));
  return getJson<{ autorizacion: { status: string; numero: string } }>(u);
}

export function shippingQuote(courier: string, destino: string) {
  const host = requireHost(courierHost(courier), `el courier "${courier}"`);
  const u = new URL('/consulta', host);
  u.searchParams.set('destino', destino);
  u.searchParams.set('formato', 'json');
  return getJson<{ consultaprecio: { cobertura: string; costo: string | number } }>(u);
}

export function createShipment(courier: string, input: Record<string, string>) {
  const host = requireHost(courierHost(courier), `el courier "${courier}"`);
  const u = new URL('/envio', host);
  Object.entries(input).forEach(([k, v]) => u.searchParams.set(k, v));
  return getJson(u);
}

export function shipmentStatus(courier: string, orden: string) {
  const host = requireHost(courierHost(courier), `el courier "${courier}"`);
  const u = new URL('/status', host);
  u.searchParams.set('orden', orden);
  u.searchParams.set('tienda', 'MotorFlow');
  u.searchParams.set('formato', 'json');
  return getJson<{ orden: { status: string } }>(u);
}

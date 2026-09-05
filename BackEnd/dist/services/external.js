const local = 'http://localhost:' + (process.env.PORT ?? '4000');
const emitterHost = (id) => ({ visa: process.env.EMISOR_VISA_HOST, mastercard: process.env.EMISOR_MASTERCARD_HOST, credomatic: process.env.EMISOR_CREDOMATIC_HOST }[id]);
const courierHost = (id) => ({ courier1: process.env.COURIER_1_HOST, courier2: process.env.COURIER_2_HOST, courier3: process.env.COURIER_3_HOST }[id]);
async function getJson(url) { const r = await fetch(url); if (!r.ok)
    throw new Error(`Servicio externo respondió ${r.status}`); return r.json(); }
export function authorize(emisor, input) { const host = emitterHost(emisor); const u = new URL(host ? '/autorizacion' : `/mocks/emisores/${emisor}/autorizacion`, host || local); Object.entries({ ...input, formato: 'json' }).forEach(([k, v]) => u.searchParams.set(k, v)); return getJson(u); }
export function shippingQuote(courier, destino) { const host = courierHost(courier); const u = new URL(host ? '/consulta' : `/mocks/couriers/${courier}/consulta`, host || local); u.searchParams.set('destino', destino); u.searchParams.set('formato', 'json'); return getJson(u); }
export function createShipment(courier, input) { const host = courierHost(courier); const u = new URL(host ? '/envio' : `/mocks/couriers/${courier}/envio`, host || local); Object.entries(input).forEach(([k, v]) => u.searchParams.set(k, v)); return getJson(u); }
export function shipmentStatus(courier, orden) { const host = courierHost(courier); const u = new URL(host ? '/status' : `/mocks/couriers/${courier}/status`, host || local); u.searchParams.set('orden', orden); u.searchParams.set('tienda', 'MotorFlow'); u.searchParams.set('formato', 'json'); return getJson(u); }

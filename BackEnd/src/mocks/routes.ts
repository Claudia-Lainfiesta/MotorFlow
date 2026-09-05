import { Router } from 'express';
export const mocks = Router();
mocks.get('/emisores/:emisor/autorizacion', (req,res) => { const tarjeta=String(req.query.tarjeta ?? ''); const approved=/^[245]\d{12,18}$/.test(tarjeta) && String(req.query.num_seguridad ?? '').length >= 3; res.json({ autorizacion:{ emisor:req.params.emisor, tarjeta, status:approved?'APROBADO':'DENEGADO', numero:approved ? `MF-${Date.now()}` : '0' } }); });
mocks.get('/couriers/:courier/consulta', (req,res) => { const destino=String(req.query.destino ?? ''); const coverage=/^\d{5}$/.test(destino); res.json({ consultaprecio:{ courier:req.params.courier, destino, cobertura:coverage?'TRUE':'FALSE', costo:coverage ? ({courier1:35,courier2:42,courier3:50}[req.params.courier] ?? 55) : 0 } }); });
mocks.get('/couriers/:courier/envio', (req,res) => res.json({ envio:{ courier:req.params.courier, orden:String(req.query.orden), status:'RECIBIDO' } }));
mocks.get('/couriers/:courier/status', (req,res) => res.json({ orden:{ courier:req.params.courier, orden:String(req.query.orden), status:'ORDEN NUEVA' } }));

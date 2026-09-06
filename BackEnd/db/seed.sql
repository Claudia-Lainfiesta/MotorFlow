INSERT INTO codigos_postales (codigo_destino,departamento,cabecera)
SELECT '010' || lpad(z::text,2,'0'),'Guatemala','Ciudad de Guatemala' FROM generate_series(1,21) z;
INSERT INTO codigos_postales VALUES
 ('02001','El Progreso','Guastatoya'),('03001','Sacatepéquez','Antigua Guatemala'),('04001','Chimaltenango','Chimaltenango'),('05001','Escuintla','Escuintla'),('06001','Santa Rosa','Cuilapa'),('07001','Sololá','Sololá'),('08001','Totonicapán','Totonicapán'),('09001','Quetzaltenango','Quetzaltenango (Xela)'),('10001','Suchitepéquez','Mazatenango'),('11001','Retalhuleu','Retalhuleu'),('12001','San Marcos','San Marcos'),('13001','Huehuetenango','Huehuetenango'),('14001','Quiché','Santa Cruz del Quiché'),('15001','Baja Verapaz','Salamá'),('16001','Alta Verapaz','Cobán'),('17001','Petén','Flores'),('18001','Izabal','Puerto Barrios'),('19001','Zacapa','Zacapa'),('20001','Chiquimula','Chiquimula'),('21001','Jalapa','Jalapa'),('22001','Jutiapa','Jutiapa');

-- Los inserts de emisores y courier dependen directamente de la configuración de la red y los servicios que se estén ejecutando. Asegúrese de que las direcciones IP y los puertos sean correctos para su entorno.

INSERT INTO emisores (id_emisor, nombre, host, script_autorizacion, prefijo_tarjeta) VALUES
  ('visa',       'Visa',       'http://192.168.1.5:4200', '/autorizacion', '4'),
  ('mastercard', 'Mastercard', 'http://192.168.1.5:4200', '/autorizacion', '5'),
  ('credomatic', 'Credomatic', 'http://192.168.1.5:4200', '/autorizacion', '2');

INSERT INTO couriers (id_courier, nombre, host, script_consulta, script_envio, script_status) VALUES
  ('courier1', 'MotorCourier', 'http://192.168.1.5:4100', '/consulta', '/envio', '/status');
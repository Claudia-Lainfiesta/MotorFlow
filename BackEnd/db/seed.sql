-- Ejecutar tras schema.sql: psql -U postgres -d motorflow -f db/seed.sql
INSERT INTO categorias (nombre_categoria) VALUES ('Aceites'),('Filtros'),('Refrigerantes'),('Repuestos');
INSERT INTO subcategorias (id_categoria,nombre_subcategoria) VALUES
 (1,'Carros Ligeros'),(1,'Motocicletas'),(1,'Maquinaria Pesada'),(2,'Aceite'),(2,'Aire'),(2,'Combustible'),
 (3,'Concentrados'),(3,'Listos para usar'),(4,'Frenos'),(4,'Encendido'),(4,'Suspensión');
INSERT INTO emisores VALUES
 ('visa','Visa','http://localhost:4000','/mocks/emisores/visa/autorizacion','4'),
 ('mastercard','Mastercard','http://localhost:4000','/mocks/emisores/mastercard/autorizacion','5'),
 ('credomatic','Credomatic','http://localhost:4000','/mocks/emisores/credomatic/autorizacion','2');
INSERT INTO couriers VALUES
 ('courier1','Cargo Express','http://localhost:4000','/mocks/couriers/courier1/consulta','/mocks/couriers/courier1/envio','/mocks/couriers/courier1/status'),
 ('courier2','Guatex','http://localhost:4000','/mocks/couriers/courier2/consulta','/mocks/couriers/courier2/envio','/mocks/couriers/courier2/status'),
 ('courier3','Forza Delivery','http://localhost:4000','/mocks/couriers/courier3/consulta','/mocks/couriers/courier3/envio','/mocks/couriers/courier3/status');
INSERT INTO codigos_postales (codigo_destino,departamento,cabecera)
SELECT '010' || lpad(z::text,2,'0'),'Guatemala','Ciudad de Guatemala' FROM generate_series(1,21) z;
INSERT INTO codigos_postales VALUES
 ('02001','El Progreso','Guastatoya'),('03001','Sacatepéquez','Antigua Guatemala'),('04001','Chimaltenango','Chimaltenango'),('05001','Escuintla','Escuintla'),('06001','Santa Rosa','Cuilapa'),('07001','Sololá','Sololá'),('08001','Totonicapán','Totonicapán'),('09001','Quetzaltenango','Quetzaltenango (Xela)'),('10001','Suchitepéquez','Mazatenango'),('11001','Retalhuleu','Retalhuleu'),('12001','San Marcos','San Marcos'),('13001','Huehuetenango','Huehuetenango'),('14001','Quiché','Santa Cruz del Quiché'),('15001','Baja Verapaz','Salamá'),('16001','Alta Verapaz','Cobán'),('17001','Petén','Flores'),('18001','Izabal','Puerto Barrios'),('19001','Zacapa','Zacapa'),('20001','Chiquimula','Chiquimula'),('21001','Jalapa','Jalapa'),('22001','Jutiapa','Jutiapa');
INSERT INTO productos (nombreproducto,id_categoria,id_subcategoria,marca,descripcion,imagen_principal,precioproducto,stock) VALUES
 ('Aceite Sintético 5W-30',1,1,'MotorFlow','Lubricante sintético para proteger motores modernos.','https://picsum.photos/seed/mf-oil-1/900/900',285,24),
 ('Aceite Mineral 20W-50',1,1,'MotorFlow','Protección confiable para uso diario.','https://picsum.photos/seed/mf-oil-2/900/900',145,31),
 ('Aceite 4T Moto 10W-40',1,2,'Motul','Flujo estable para motores de motocicleta.','https://picsum.photos/seed/mf-oil-3/900/900',98,18),
 ('Aceite Diésel 15W-40',1,3,'Shell','Rendimiento para trabajo pesado.','https://picsum.photos/seed/mf-oil-4/900/900',410,12),
 ('Filtro de Aceite Premium',2,4,'Mann','Filtración eficiente para intervalos prolongados.','https://picsum.photos/seed/mf-filter-1/900/900',75,40),
 ('Filtro de Aire Compacto',2,5,'Bosch','Mejora el flujo de aire del motor.','https://picsum.photos/seed/mf-filter-2/900/900',120,29),
 ('Filtro de Combustible',2,6,'Wix','Protección contra partículas en el combustible.','https://picsum.photos/seed/mf-filter-3/900/900',110,20),
 ('Refrigerante Verde 50/50',3,7,'Prestone','Concentrado para control térmico y anticorrosión.','https://picsum.photos/seed/mf-coolant-1/900/900',115,36),
 ('Refrigerante Orgánico Rojo',3,8,'MotorFlow','Mezcla lista para usar de larga duración.','https://picsum.photos/seed/mf-coolant-2/900/900',130,15),
 ('Pastillas de Freno Delanteras',4,9,'Brembo','Frenado consistente para manejo urbano.','https://picsum.photos/seed/mf-part-1/900/900',260,10),
 ('Discos de Freno Ventilados',4,9,'TRW','Disipación de calor y frenado estable.','https://picsum.photos/seed/mf-part-2/900/900',480,8),
 ('Bujías de Iridio',4,10,'NGK','Encendido preciso y vida útil extendida.','https://picsum.photos/seed/mf-part-3/900/900',210,26),
 ('Amortiguador Delantero',4,11,'Monroe','Control de marcha para trayectos exigentes.','https://picsum.photos/seed/mf-part-4/900/900',550,7),
 ('Kit de Correa de Tiempo',4,10,'Gates','Kit de repuesto para mantenimiento preventivo.','https://picsum.photos/seed/mf-part-5/900/900',690,6),
 ('Aceite Transmisión ATF',1,1,'Castrol','Fluido para cambios suaves en transmisión automática.','https://picsum.photos/seed/mf-oil-5/900/900',185,19);
INSERT INTO producto_imagenes (idproducto,url_imagen,orden)
SELECT idproducto, imagen_principal, 1 FROM productos;
INSERT INTO producto_especificaciones (idproducto,etiqueta,valor)
SELECT idproducto,'Compatibilidad','Placeholder: confirma compatibilidad con tu vehículo' FROM productos;
INSERT INTO producto_especificaciones (idproducto,etiqueta,valor)
SELECT idproducto,'Garantía','Garantía de fabricante según producto' FROM productos;

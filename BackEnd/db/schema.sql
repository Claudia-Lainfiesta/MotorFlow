CREATE TABLE clientes (
    cusername VARCHAR(30) PRIMARY KEY,
    ccontrasena VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);
CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(50) NOT NULL UNIQUE
);
CREATE TABLE subcategorias (
    id_subcategoria SERIAL PRIMARY KEY,
    id_categoria INTEGER NOT NULL REFERENCES categorias(id_categoria),
    nombre_subcategoria VARCHAR(50) NOT NULL,
    UNIQUE (id_categoria, nombre_subcategoria)
);
CREATE TABLE emisores (
    id_emisor VARCHAR(15) PRIMARY KEY, nombre VARCHAR(50) NOT NULL,
    host VARCHAR(100) NOT NULL, script_autorizacion VARCHAR(100) NOT NULL,
    prefijo_tarjeta CHAR(1) NOT NULL UNIQUE
);
CREATE TABLE couriers (
    id_courier VARCHAR(15) PRIMARY KEY, nombre VARCHAR(50) NOT NULL,
    host VARCHAR(100) NOT NULL, script_consulta VARCHAR(100) NOT NULL,
    script_envio VARCHAR(100) NOT NULL, script_status VARCHAR(100) NOT NULL
);
CREATE TABLE codigos_postales (
    codigo_destino CHAR(5) PRIMARY KEY, departamento VARCHAR(50) NOT NULL, cabecera VARCHAR(50) NOT NULL
);
CREATE TABLE direcciones (
    id_direccion SERIAL PRIMARY KEY, cusername VARCHAR(30) NOT NULL REFERENCES clientes(cusername),
    dnombre VARCHAR(50) NOT NULL, calle VARCHAR(150) NOT NULL, ciudad VARCHAR(50) NOT NULL,
    codigo_destino CHAR(5) NOT NULL REFERENCES codigos_postales(codigo_destino), telefono VARCHAR(20),
    es_predeterminada BOOLEAN NOT NULL DEFAULT FALSE, UNIQUE (cusername, dnombre)
);
CREATE TABLE productos (
    idproducto SERIAL PRIMARY KEY, nombreproducto VARCHAR(100) NOT NULL,
    id_categoria INTEGER NOT NULL REFERENCES categorias(id_categoria),
    id_subcategoria INTEGER REFERENCES subcategorias(id_subcategoria), marca VARCHAR(50), descripcion TEXT,
    especificaciones TEXT,
    imagen_principal VARCHAR(255), precioproducto NUMERIC(10,2) NOT NULL CHECK (precioproducto >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0)
);
CREATE TABLE carrito_items (
    cusername VARCHAR(30) NOT NULL REFERENCES clientes(cusername), idproducto INTEGER NOT NULL REFERENCES productos(idproducto),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0), fecha_agregado TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (cusername, idproducto)
);
CREATE TABLE ordenes (
    ordendecompra SERIAL PRIMARY KEY, cusername VARCHAR(30) NOT NULL REFERENCES clientes(cusername),
    id_direccion INTEGER NOT NULL REFERENCES direcciones(id_direccion), id_courier VARCHAR(15) NOT NULL REFERENCES couriers(id_courier),
    id_emisor VARCHAR(15) NOT NULL REFERENCES emisores(id_emisor), numero_autorizacion VARCHAR(50) NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT NOW(), total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
    costo_envio NUMERIC(10,2) NOT NULL DEFAULT 0,
    estado_envio SMALLINT NOT NULL DEFAULT 1 CHECK (estado_envio BETWEEN 1 AND 5)
);
CREATE TABLE detalle_orden (
    ordendecompra INTEGER NOT NULL REFERENCES ordenes(ordendecompra), idproducto INTEGER NOT NULL REFERENCES productos(idproducto),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0), precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0),
    PRIMARY KEY (ordendecompra, idproducto)
);
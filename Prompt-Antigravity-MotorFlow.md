# PROMPT PARA GOOGLE ANTIGRAVITY — Proyecto MotorFlow

Actúa como un ingeniero de software full-stack senior. Vas a tomar dos repositorios que ya están en el workspace (`EasyShop-Angular-main` y `ProyectoFundamentos-main`) y vas a construir un proyecto nuevo llamado **MotorFlow**: el módulo "Tienda Virtual" de un sistema distribuido académico (Ciencias de la Computación VI — Bases de Datos) que se integra con dos aplicaciones externas (Tarjeta de Crédito y Courier) mediante WebServices REST en formato JSON.

No es un ajuste incremental: es una reconstrucción completa manteniendo la identidad visual de `EasyShop-Angular-main` pero reemplazando toda su lógica, persistencia y backend.

## 1. Stack obligatorio

- **Frontend**: Angular + TypeScript + Tailwind CSS (evitar CSS custom al máximo, todo con utilidades de Tailwind).
- **Backend**: Node.js + Express + TypeScript.
- **Base de datos**: PostgreSQL, **local** (no servicios en la nube), consumida exclusivamente vía HTTP desde el frontend (nunca acceso directo del navegador a la base de datos).
- **Estructura raíz**: dos carpetas principales, `FrontEnd/` y `BackEnd/`.
- **Backend interno**: separar en `/routes`, `/controllers`, `/models`, `/config`, `/middleware`.
- Cada carpeta (`FrontEnd/` y `BackEnd/`) debe tener su propio `package.json` y un `.env.example`.

## 2. Purga obligatoria

Elimina por completo, sin dejar residuos de configuración ni dependencias:
- Todo lo relacionado a Firebase/Firestore (`@angular/fire`, `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `.firebaserc`, imports de `Firestore` en los servicios).
- El bot de Telegram.
- La integración con Google Sheets (en `cart.service.ts` existe `googleSheetsScriptUrl` y `sendOrderToGoogleSheets` — elimínalos junto con cualquier llamada asociada).
- Toda lógica de "impuestos" (el campo `tax` en `OrderRecord` y su cálculo en el checkout).
- Las rutas de administrador ofuscadas con hash en la URL (`/d6fr7...`) — reemplázalas por rutas protegidas por rol dentro de un layout `/admin`, protegidas por guard + JWT, no por oscuridad de URL.

## 3. Identidad visual

- Nuevo nombre del proyecto/marca: **MotorFlow**. Reemplaza todas las menciones a "Shopeasy"/"ShopEasy" en textos, títulos, metadatos y logo.
- Color primario: **azul** (define una paleta Tailwind custom, ej. `motorflow-blue`, y reemplaza el color de acento actual en `tailwind.config.js`, botones, navbar, hero, etc.).
- MotorFlow es una **aceitera** (venta de lubricantes y repuestos automotrices), con 4 categorías principales:
  1. Aceites
  2. Filtros
  3. Refrigerantes
  4. Repuestos
- Cada categoría tiene subcategorías (ej. Carros Ligeros, Maquinaria Pesada, Motocicletas, por marca, etc. — genera un set razonable de subcategorías de ejemplo por categoría).
- Mantén intacta la estructura visual, componentes, animaciones y layout de `EasyShop-Angular-main` (navbar, hero, footer, cart-drawer, menu-drawer, product-card, auth-modal como base) — solo cambia textos, nombre, colores y la lógica de datos detrás.
- Todo el contenido nuevo generado (productos, imágenes, descripciones, testimonios, FAQ, etc.) debe ser **placeholder**: usa imágenes aleatorias (ej. picsum.photos con distintos seeds, como ya hace el proyecto original) y texto de relleno realista relacionado al rubro automotriz. El usuario lo reemplazará después.

## 4. Base de datos — schema.sql actualizado

Usa como base el schema que te paso abajo (ya adaptado respecto al original: ver sección 9 de este documento para el detalle de qué cambió). Colócalo en `BackEnd/db/schema.sql` y crea un script de seed (`BackEnd/db/seed.sql`) con datos placeholder: las 4 categorías, subcategorías, ~15-20 productos con imágenes/descr placeholder, los 3 emisores, los 3 couriers, y el catálogo completo de códigos postales.

```sql
CREATE DATABASE motorflow;

-- Clientes
CREATE TABLE clientes (
    cusername       VARCHAR(30) PRIMARY KEY,
    ccontrasena     VARCHAR(255) NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE
);

-- Categorias
CREATE TABLE categorias (
    id_categoria    SERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(50) NOT NULL UNIQUE
);

-- Subcategorias (NUEVA)
CREATE TABLE subcategorias (
    id_subcategoria     SERIAL PRIMARY KEY,
    id_categoria        INTEGER NOT NULL REFERENCES categorias(id_categoria),
    nombre_subcategoria VARCHAR(50) NOT NULL,
    UNIQUE (id_categoria, nombre_subcategoria)
);

-- Emisores (Visa, Mastercard, Credomatic)
CREATE TABLE emisores (
    id_emisor       VARCHAR(15) PRIMARY KEY,
    nombre          VARCHAR(50) NOT NULL,
    host            VARCHAR(100) NOT NULL,
    script_autorizacion VARCHAR(100) NOT NULL,
    prefijo_tarjeta CHAR(1) NOT NULL -- NUEVA: 4=Visa, 5=Mastercard, 2=Credomatic, para enrutar la solicitud de autorización
);

-- Couriers (los 3 couriers)
CREATE TABLE couriers (
    id_courier      VARCHAR(15) PRIMARY KEY,
    nombre          VARCHAR(50) NOT NULL,
    host            VARCHAR(100) NOT NULL,
    script_consulta VARCHAR(100) NOT NULL,
    script_envio    VARCHAR(100) NOT NULL,
    script_status   VARCHAR(100) NOT NULL
);

-- Catalogo de codigos postales (NUEVA — para rechazar destinos inválidos)
CREATE TABLE codigos_postales (
    codigo_destino  CHAR(5) PRIMARY KEY,
    departamento    VARCHAR(50) NOT NULL,
    cabecera        VARCHAR(50) NOT NULL
);

-- Direcciones (varias por cliente)
CREATE TABLE direcciones (
    id_direccion    SERIAL PRIMARY KEY,
    cusername       VARCHAR(30) NOT NULL REFERENCES clientes(cusername),
    dnombre         VARCHAR(50) NOT NULL,
    calle           VARCHAR(150) NOT NULL,
    ciudad          VARCHAR(50) NOT NULL,
    codigo_destino  CHAR(5) NOT NULL REFERENCES codigos_postales(codigo_destino), -- MODIFICADA: ahora con FK
    telefono        VARCHAR(20),
    es_predeterminada BOOLEAN NOT NULL DEFAULT FALSE, -- NUEVA
    UNIQUE (cusername, dnombre)
);

-- Productos
CREATE TABLE productos (
    idproducto       SERIAL PRIMARY KEY,
    nombreproducto   VARCHAR(100) NOT NULL,
    id_categoria     INTEGER NOT NULL REFERENCES categorias(id_categoria),
    id_subcategoria  INTEGER REFERENCES subcategorias(id_subcategoria), -- NUEVA
    marca            VARCHAR(50), -- NUEVA
    descripcion      TEXT, -- NUEVA
    imagen_principal VARCHAR(255), -- NUEVA
    precioproducto   NUMERIC(10,2) NOT NULL CHECK (precioproducto >= 0),
    stock            INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0)
);

-- Imagenes adicionales de producto (NUEVA — galeria para la pagina de detalle)
CREATE TABLE producto_imagenes (
    id_imagen   SERIAL PRIMARY KEY,
    idproducto  INTEGER NOT NULL REFERENCES productos(idproducto),
    url_imagen  VARCHAR(255) NOT NULL,
    orden       SMALLINT NOT NULL DEFAULT 1
);

-- Especificaciones/filtros de producto (NUEVA — para la pagina de detalle: marca, compatibilidad, viscosidad, etc.)
CREATE TABLE producto_especificaciones (
    id_especificacion SERIAL PRIMARY KEY,
    idproducto        INTEGER NOT NULL REFERENCES productos(idproducto),
    etiqueta          VARCHAR(50) NOT NULL,
    valor             VARCHAR(150) NOT NULL
);

-- CarritoItems (carrito persistente)
CREATE TABLE carrito_items (
    cusername       VARCHAR(30) NOT NULL REFERENCES clientes(cusername),
    idproducto      INTEGER NOT NULL REFERENCES productos(idproducto),
    cantidad        INTEGER NOT NULL CHECK (cantidad > 0),
    fecha_agregado  TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (cusername, idproducto)
);

-- Ordenes
CREATE TABLE ordenes (
    ordendecompra       SERIAL PRIMARY KEY,
    cusername           VARCHAR(30) NOT NULL REFERENCES clientes(cusername),
    id_direccion        INTEGER NOT NULL REFERENCES direcciones(id_direccion),
    id_courier          VARCHAR(15) NOT NULL REFERENCES couriers(id_courier),
    id_emisor           VARCHAR(15) NOT NULL REFERENCES emisores(id_emisor),
    numero_autorizacion VARCHAR(50) NOT NULL,
    fecha               TIMESTAMP NOT NULL DEFAULT NOW(),
    total               NUMERIC(10,2) NOT NULL CHECK (total >= 0),
    -- estado_envio: 1=orden nueva, 2=surtiendose, 3=empacandose, 4=en ruta, 5=entregada
    estado_envio        SMALLINT NOT NULL DEFAULT 1
        CHECK (estado_envio BETWEEN 1 AND 5)
);

-- DetalleOrden (relación Contener, materializada)
CREATE TABLE detalle_orden (
    ordendecompra   INTEGER NOT NULL REFERENCES ordenes(ordendecompra),
    idproducto      INTEGER NOT NULL REFERENCES productos(idproducto),
    cantidad        INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0),
    PRIMARY KEY (ordendecompra, idproducto)
);
```

Para `codigos_postales`, siembra estas filas exactas (Guatemala tiene 21 zonas, del 01001 al 01021; el resto de departamentos usa un único código de cabecera departamental):

| codigo_destino | departamento | cabecera |
|---|---|---|
| 01001–01021 (las 21 zonas) | Guatemala | Ciudad de Guatemala |
| 02001 | El Progreso | Guastatoya |
| 03001 | Sacatepéquez | Antigua Guatemala |
| 04001 | Chimaltenango | Chimaltenango |
| 05001 | Escuintla | Escuintla |
| 06001 | Santa Rosa | Cuilapa |
| 07001 | Sololá | Sololá |
| 08001 | Totonicapán | Totonicapán |
| 09001 | Quetzaltenango | Quetzaltenango (Xela) |
| 10001 | Suchitepéquez | Mazatenango |
| 11001 | Retalhuleu | Retalhuleu |
| 12001 | San Marcos | San Marcos |
| 13001 | Huehuetenango | Huehuetenango |
| 14001 | Quiché | Santa Cruz del Quiché |
| 15001 | Baja Verapaz | Salamá |
| 16001 | Alta Verapaz | Cobán |
| 17001 | Petén | Flores |
| 18001 | Izabal | Puerto Barrios |
| 19001 | Zacapa | Zacapa |
| 20001 | Chiquimula | Chiquimula |
| 21001 | Jalapa | Jalapa |
| 22001 | Jutiapa | Jutiapa |

Cualquier `codigo_destino` fuera de este catálogo debe ser rechazado por la FK a nivel de base de datos y validado también en el backend antes de intentar el insert (para devolver un mensaje de error claro, no un error 500 de PostgreSQL crudo).

## 5. Autenticación, seguridad y roles

Toma como referencia el patrón de `ProyectoFundamentos-main/BackendProyecto` (middleware `auth.js` con `jsonwebtoken`, estructura de respuestas `{ status, message, data }`, uso de `.env` para `JWT_SECRET`), pero con estas adaptaciones:

- Migra de MySQL (`mysql2`) a PostgreSQL (usa `pg`, con un pool de conexión análogo a `db/database.js`).
- **Reemplaza el hasheo de contraseña**: `ProyectoFundamentos` usa `MD5(?)` directo en la query SQL, lo cual es inseguro. Usa en su lugar `bcrypt`/`bcryptjs` (hash al registrar, `compare` al hacer login). Mantén la misma filosofía de middleware y de firmar/verificar JWT con `jsonwebtoken`.
- Validación de contraseña al registrar: mínimo 5 caracteres, al menos una mayúscula, una minúscula y un número.
- Login/registro es por `cusername` (no por email, ya que `cusername` es la PK de `clientes`).
- **Navegación sin cuenta**: cualquiera puede ver catálogo, categorías, subcategorías, detalle de producto, FAQ, quiénes somos, contacto, ofertas, sin login.
- **Login obligatorio** únicamente al intentar agregar un producto al carrito (o al hacer checkout). Si no hay sesión, redirige al modal/página de login y conserva la intención (agregar el producto tras autenticarse).
- **Administradores**: no se define un rol en base de datos. Se definen por variable de entorno en el backend, por `cusername`:
  ```
  ADMIN_USERNAMES=eduanleu,mclaudia,srodas
  ```
  Un middleware `isAdmin` decodifica el JWT, obtiene el `cusername` y verifica si está en esa lista (parseada desde `process.env.ADMIN_USERNAMES`). Únicamente los administradores pueden usar los endpoints CRUD de productos, categorías y subcategorías.

## 6. CRUD requeridos

Todo el sitio debe tener CRUD real contra PostgreSQL vía la API (no arreglos en memoria del frontend):
- Productos (solo admin: crear/editar/eliminar; lectura pública).
- Categorías y subcategorías (solo admin).
- Direcciones del cliente (el propio cliente autenticado gestiona las suyas).
- Clientes (admin puede ver/gestionar clientes — reemplaza `admin-clientes.component.ts` actual).
- Pedidos/órdenes (admin puede ver y actualizar `estado_envio`; el cliente puede ver y rastrear los suyos — reemplaza `admin-pedidos.component.ts` y `pedidos.component.ts`).
- Stock (reemplaza `admin-stock.component.ts`, integrado al CRUD de productos).

## 7. Rutas/vistas del frontend

Conserva y adapta las páginas ya existentes (`faq`, `sobre-nosotros`, `contacto`, `terminos`, `privacidad`, `envios`) y agrega/reestructura:

- `/` — catálogo (home), con filtro por categoría y subcategoría.
- `/producto/:id` — **página propia** (no modal emergente) con toda la info del producto: galería de imágenes, descripción larga, especificaciones/filtros (marca, precio, compatibilidad, etc. desde `producto_especificaciones`), botón de agregar al carrito.
- `/carrito` — carrito persistente (ya no solo signal en memoria, sincronizado con `carrito_items`).
- `/checkout` — **página propia** (no modal), en dos pasos secuenciales:
  1. Selección/registro de dirección de envío (si el cliente ya tiene una guardada — especialmente la marcada `es_predeterminada` — se preselecciona). Con la dirección definida, se consulta el costo/cobertura a los 3 couriers (llamadas JSON al endpoint de "consulta de precio" descrito en el PDF) y el cliente elige courier.
  2. Pago con tarjeta: el número de tarjeta determina el emisor automáticamente por el primer dígito (4→Visa, 5→Mastercard, 2→Credomatic) y se envía la solicitud de autorización JSON al emisor correspondiente.
- `/pedidos` — historial y rastreo de envío del cliente (consulta status al courier correspondiente).
- `/direcciones` — CRUD de direcciones del cliente.
- `/ofertas` — productos en oferta (placeholder).
- `/admin` (protegida, solo `ADMIN_USERNAMES`) con subrutas: `/admin/productos`, `/admin/categorias`, `/admin/clientes`, `/admin/pedidos`.

## 8. Integración con Tarjeta de Crédito y Courier (formato JSON)

Implementa los 3 endpoints externos usando exactamente el contrato JSON del PDF del proyecto:

- Autorización de pago: `GET /autorizacion?tarjeta=&nombre=&fecha_venc=&num_seguridad=&monto=&tienda=&formato=json` → `{"autorizacion": {"emisor","tarjeta","status","numero"}}`, `status` es `APROBADO`/`DENEGADO`.
- Consulta de costo de envío: `GET /consulta?destino=&formato=json` → `{"consultaprecio": {"courier","destino","cobertura","costo"}}`, `cobertura` es `TRUE`/`FALSE`.
- Solicitud de envío: `GET /envio?orden=&destinatario=&destino=&direccion=&tienda=`.
- Consulta de estatus: `GET /status?orden=&tienda=&formato=json` → `{"orden": {"courier","orden","status"}}`.

Como las aplicaciones de Tarjeta de Crédito y Courier las desarrollan otros grupos y probablemente no estén disponibles todavía, crea además **servicios mock locales** dentro del backend (ej. `BackEnd/mocks/emisorMock.ts`, `BackEnd/mocks/courierMock.ts`) que respondan exactamente con ese mismo contrato JSON, para poder probar el flujo de checkout de punta a punta ya mismo. El `host` de cada emisor/courier en la tabla debe ser configurable por `.env` (ej. `EMISOR_VISA_HOST`, `COURIER_1_HOST`, etc.) para poder apuntar a las URLs reales cuando los otros grupos las entreguen, con fallback al mock local si no están configuradas.

**Importante — aislamiento de los mocks**: el código que llama a emisores/couriers (controllers de checkout/tracking) debe comunicarse **siempre vía petición HTTP real** (fetch/axios) contra la URL de `.env`, nunca importando directamente las funciones del mock (`import { ... } from '../mocks/...'`). Así, el día de la entrega final, sustituir los mocks por las apps reales de los otros grupos es solo cambiar esas variables de entorno — sin tocar ni un import del código de negocio, y sin riesgo de romper nada si se elimina la carpeta `BackEnd/mocks/` por completo.

## 9. Resumen de qué cambié en tu esquema SQL original y por qué

Antes de generar este prompt sí modifiqué tu `schema.sql` original. Cambios:

1. **Nueva tabla `subcategorias`** (con FK a `categorias`) — la necesitabas porque pediste que las categorías tuvieran subcategorías, y el esquema original no tenía dónde guardarlas.
2. **`productos` ganó columnas**: `id_subcategoria`, `marca`, `descripcion`, `imagen_principal`. El esquema original no tenía ni un solo campo de imagen o descripción, y pediste una página de detalle con "todas sus características y filtros (marca, precio y así)" — sin estas columnas no había forma de mostrar eso.
3. **Nuevas tablas `producto_imagenes` y `producto_especificaciones`** — para la galería de imágenes y las especificaciones tipo lista (etiqueta/valor) de la página de detalle de producto, en vez de forzar todo en columnas fijas de `productos`.
4. **Nueva tabla `codigos_postales`** y la columna `direcciones.codigo_destino` ahora tiene **FK** hacia ella — es la única forma de que la base de datos rechace automáticamente un código postal que no esté en tu lista, tal como pediste.
5. **`direcciones` ganó `es_predeterminada`** — para poder implementar "si el cliente ya tenía una dirección guardada" sin ambigüedad de cuál usar por default en el checkout.
6. **`emisores` ganó `prefijo_tarjeta`** — para poder enrutar automáticamente la tarjeta al emisor correcto según el primer dígito (4/5/2) que diste, sin hardcodear esa regla en el código.

No toqué `clientes`, `couriers`, `carrito_items`, `ordenes` ni `detalle_orden`: ya cubrían bien lo que pediste (carrito persistente, estados de envío 1–5, sin campo de impuestos).

## 10. Nombre del nuevo proyecto y verificación

- Usa el nombre **MotorFlow** consistentemente (package.json, título, metadatos, README).
- Al finalizar, verifica el flujo completo: registro/login, navegación sin cuenta, agregar al carrito (forzando login), checkout (dirección → courier → pago con tarjeta usando cada uno de los 3 prefijos) hasta ver la orden creada con `estado_envio = 1`, y el CRUD de productos/categorías como administrador (`eduanleu`). Si tienes una herramienta de automatización de navegador disponible (browser tool, Playwright MCP, etc.), úsala para probar de forma autónoma. Si no la tienes, escribe pruebas automatizadas de backend (supertest/jest contra los endpoints REST) para lo que sí se pueda verificar sin navegador, deja el proyecto corriendo con `npm run dev`/`npm start` en ambas carpetas, y dime exactamente qué pasos seguir para probar manualmente el resto en el navegador.

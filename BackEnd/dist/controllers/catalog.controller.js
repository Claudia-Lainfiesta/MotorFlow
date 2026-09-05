import { pool } from '../config/database.js';
const productSql = `SELECT p.idproducto,p.nombreproducto,p.marca,p.descripcion,p.imagen_principal,p.precioproducto,p.stock,c.id_categoria,c.nombre_categoria,s.id_subcategoria,s.nombre_subcategoria FROM productos p JOIN categorias c ON c.id_categoria=p.id_categoria LEFT JOIN subcategorias s ON s.id_subcategoria=p.id_subcategoria`;
export async function listProducts(req, res) { const where = []; const values = []; if (req.query.categoria) {
    values.push(req.query.categoria);
    where.push(`p.id_categoria=$${values.length}`);
} if (req.query.subcategoria) {
    values.push(req.query.subcategoria);
    where.push(`p.id_subcategoria=$${values.length}`);
} if (req.query.q) {
    values.push(`%${req.query.q}%`);
    where.push(`p.nombreproducto ILIKE $${values.length}`);
} const { rows } = await pool.query(productSql + (where.length ? ' WHERE ' + where.join(' AND ') : '') + ' ORDER BY p.idproducto DESC', values); res.json({ status: 0, message: 'Productos obtenidos', data: rows }); }
export async function productDetail(req, res) { const { rows } = await pool.query(productSql + ' WHERE p.idproducto=$1', [req.params.id]); if (!rows[0])
    return res.status(404).json({ status: 1, message: 'Producto no encontrado' }); const [images, specs] = await Promise.all([pool.query('SELECT url_imagen,orden FROM producto_imagenes WHERE idproducto=$1 ORDER BY orden', [req.params.id]), pool.query('SELECT etiqueta,valor FROM producto_especificaciones WHERE idproducto=$1', [req.params.id])]); res.json({ status: 0, message: 'Producto obtenido', data: { ...rows[0], imagenes: images.rows, especificaciones: specs.rows } }); }
export async function categories(_req, res) { const { rows } = await pool.query('SELECT c.*,COALESCE(json_agg(s.*) FILTER (WHERE s.id_subcategoria IS NOT NULL),\'[]\') subcategorias FROM categorias c LEFT JOIN subcategorias s USING(id_categoria) GROUP BY c.id_categoria ORDER BY c.id_categoria'); res.json({ status: 0, message: 'Categorías obtenidas', data: rows }); }

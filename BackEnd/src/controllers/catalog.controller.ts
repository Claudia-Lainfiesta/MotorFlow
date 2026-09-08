import type { Request, Response } from "express";
import { pool } from "../config/database.js";
const productSql = `SELECT p.idproducto,p.nombreproducto,p.marca,p.descripcion,p.especificaciones,p.imagen_principal,p.precioproducto,p.stock,c.id_categoria,c.nombre_categoria,s.id_subcategoria,s.nombre_subcategoria FROM productos p JOIN categorias c ON c.id_categoria=p.id_categoria LEFT JOIN subcategorias s ON s.id_subcategoria=p.id_subcategoria`;
export async function listProducts(req: Request, res: Response) {
  const where: string[] = [];
  const values: unknown[] = [];
  if (req.query.categoria) {
    values.push(req.query.categoria);
    where.push(`p.id_categoria=$${values.length}`);
  }
  if (req.query.subcategoria) {
    values.push(req.query.subcategoria);
    where.push(`p.id_subcategoria=$${values.length}`);
  }
  if (req.query.marca) {
    values.push(req.query.marca);
    where.push(`p.marca=$${values.length}`);
  }
  if (req.query.q) {
    values.push(`%${req.query.q}%`);
    const n = values.length;
    where.push(
      `(p.nombreproducto ILIKE $${n} OR p.marca ILIKE $${n} OR p.descripcion ILIKE $${n} OR p.especificaciones ILIKE $${n} OR c.nombre_categoria ILIKE $${n} OR s.nombre_subcategoria ILIKE $${n})`,
    );
  }
  const { rows } = await pool.query(
    productSql +
      (where.length ? " WHERE " + where.join(" AND ") : "") +
      " ORDER BY p.idproducto DESC",
    values,
  );
  res.json({ status: 0, message: "Productos obtenidos", data: rows });
}
export async function productDetail(req: Request, res: Response) {
  const { rows } = await pool.query(productSql + " WHERE p.idproducto=$1", [
    req.params.id,
  ]);
  if (!rows[0])
    return res
      .status(404)
      .json({ status: 1, message: "Producto no encontrado" });
  res.json({ status: 0, message: "Producto obtenido", data: rows[0] });
}
export async function categories(_req: Request, res: Response) {
  const { rows } = await pool.query(
    "SELECT c.*,COALESCE(json_agg(s.*) FILTER (WHERE s.id_subcategoria IS NOT NULL),'[]') subcategorias FROM categorias c LEFT JOIN subcategorias s USING(id_categoria) GROUP BY c.id_categoria ORDER BY c.id_categoria",
  );
  res.json({ status: 0, message: "Categorías obtenidas", data: rows });
}
export async function brands(_req: Request, res: Response) {
  const { rows } = await pool.query(
    "SELECT DISTINCT marca FROM productos WHERE marca IS NOT NULL AND marca<>'' ORDER BY marca",
  );
  res.json({
    status: 0,
    message: "Marcas obtenidas",
    data: rows.map((r) => r.marca),
  });
}

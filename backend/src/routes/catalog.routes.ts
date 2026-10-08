import { Router } from "express";
import {
  categories,
  listProducts,
  productDetail,
  brands,
} from "../controllers/catalog.controller.js";
export const catalogRoutes = Router();
catalogRoutes.get("/productos", listProducts);
catalogRoutes.get("/productos/:id", productDetail);
catalogRoutes.get("/categorias", categories);
catalogRoutes.get("/marcas", brands);

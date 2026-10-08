import { Router } from 'express';
import { auth, isAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import * as a from '../controllers/admin.controller.js';

export const adminRoutes = Router();
adminRoutes.use(auth, isAdmin);
adminRoutes.post('/upload', upload.single('imagen'), a.uploadImage);
adminRoutes.post('/productos', a.saveProduct);
adminRoutes.put('/productos/:id', a.saveProduct);
adminRoutes.delete('/productos/:id', a.deleteProduct);
adminRoutes.post('/categorias', a.saveCategory);
adminRoutes.put('/categorias/:id', a.saveCategory);
adminRoutes.delete('/categorias/:id', a.deleteCategory);
adminRoutes.post('/subcategorias', a.saveSubcategory);
adminRoutes.put('/subcategorias/:id', a.saveSubcategory);
adminRoutes.delete('/subcategorias/:id', a.deleteSubcategory);
adminRoutes.get('/clientes', a.clients);
